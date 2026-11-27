import type { ConnectorState } from '@brand/schema';

import type { Charger, Connector } from '../types/stations.types';

export type ConnectorStatus = { state: ConnectorState; label: string };

// The CruzeEV app's connector status display: OCPP code -> state and label.
const OCPP: Record<string, ConnectorStatus> = {
  available: { state: 'available', label: 'Available' },
  preparing: { state: 'preparing', label: 'Preparing' },
  charging: { state: 'charging', label: 'Charging' },
  suspendedev: { state: 'suspendedEv', label: 'Suspended EV' },
  suspendedevse: { state: 'suspendedEvse', label: 'Suspended EVSE' },
  finishing: { state: 'finishing', label: 'Finishing' },
  reserved: { state: 'reserved', label: 'Reserved' },
  engaged: { state: 'engaged', label: 'Engaged' },
  unavailable: { state: 'unavailable', label: 'Unavailable' },
  faulted: { state: 'faulted', label: 'Faulted' },
};

// No heartbeat: the old app had no connector entry and its fallback showed "Unavailable" in red.
const OFFLINE_KEYS = ['offline', 'inactive', 'outoforder', 'inoperative', 'removed'];
const OFFLINE: ConnectorStatus = { state: 'offline', label: 'Unavailable' };

const UNKNOWN_LABEL = 'Unknown';

const key = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');

/**
 * Raw OCPP status -> what the driver sees. "Faulted - Door Open" keeps its full text with the
 * Faulted colours, like the old app; codes nobody knows show their raw text in the unknown grey.
 */
export function toConnectorStatus(raw: string | null | undefined): ConnectorStatus {
  const text = (raw ?? '').trim();
  const direct = OCPP[key(text)];
  if (direct) return direct;

  const prefix = OCPP[key(text.split(/\s+-\s+|:/)[0] ?? '')];
  if (prefix && text) return { state: prefix.state, label: text };

  if (OFFLINE_KEYS.includes(key(text))) return OFFLINE;
  return { state: 'unknown', label: text || UNKNOWN_LABEL };
}

// Only these two can start a session, same rule as the old app.
export function canStartCharging(state: ConnectorState): boolean {
  return state === 'available' || state === 'preparing';
}

export function freeConnectors(charger: Charger): number {
  return charger.connectors.filter(connector => connector.state === 'available').length;
}

// Chargers with a free connector first, keeping the server's order otherwise.
export function sortChargers(chargers: Charger[]): Charger[] {
  return chargers
    .map((charger, index) => ({ charger, index, free: freeConnectors(charger) > 0 }))
    .sort((a, b) => Number(b.free) - Number(a.free) || a.index - b.index)
    .map(entry => entry.charger);
}

export function chargingProgress(connector: Connector): string | null {
  if (connector.state !== 'charging') return null;

  const parts = [
    connector.socPercent !== null ? `${connector.socPercent}%` : null,
    connector.minutesToFull !== null ? `${connector.minutesToFull} min to full` : null,
  ];
  const text = parts.filter(Boolean).join(' · ');
  return text || null;
}
