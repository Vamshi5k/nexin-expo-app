import { formatRate } from '@/shared/utils/money';
import type { ConnectorState } from '@brand/schema';

import { CARD_COPY } from '../constants/stations.constants';
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

// Chargers sometimes report a nonsense estimate (weeks); anything past a day is not shown.
const MAX_MINUTES_TO_FULL = 24 * 60;

export function timeToFull(minutes: number | null): string | null {
  if (minutes === null || minutes <= 0 || minutes > MAX_MINUTES_TO_FULL) return null;

  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (!hours) return `${rest} min to full`;
  return rest ? `${hours} h ${rest} min to full` : `${hours} h to full`;
}

export function chargingProgress(connector: Connector): string | null {
  if (connector.state !== 'charging') return null;

  const parts = [
    connector.socPercent !== null ? `${connector.socPercent}%` : null,
    timeToFull(connector.minutesToFull),
  ];
  const text = parts.filter(Boolean).join(' · ');
  return text || null;
}

// "DC · 60 kW · ₹18.00/kWh", leaving out whatever the charger does not report.
export function chargerSpecs(charger: Charger): string {
  return [
    charger.powerType,
    charger.capacityKw !== null ? `${charger.capacityKw} kW` : null,
    charger.pricePerKwhPaise !== null
      ? `${formatRate(charger.pricePerKwhPaise)}${CARD_COPY.price}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
