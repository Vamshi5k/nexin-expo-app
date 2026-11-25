import type { ConnectorStatus } from '@brand/schema';

import type { Charger, Connector, ConnectorState } from '../types/stations.types';

const STATE_BY_KEY: Record<string, ConnectorState> = {
  available: 'available',
  preparing: 'preparing',
  charging: 'charging',
  suspendedev: 'charging',
  suspendedevse: 'charging',
  finishing: 'finishing',
  reserved: 'reserved',
  occupied: 'charging',
  unavailable: 'unavailable',
  inoperative: 'unavailable',
  faulted: 'faulted',
};

export const CONNECTOR_LABEL: Record<ConnectorState, string> = {
  available: 'Available',
  preparing: 'Preparing',
  charging: 'Charging',
  finishing: 'Finishing',
  reserved: 'Reserved',
  unavailable: 'Unavailable',
  faulted: 'Faulted',
  unknown: 'Unknown',
};

const COLOR_KEY: Record<ConnectorState, ConnectorStatus> = {
  available: 'Available',
  preparing: 'Reserved',
  charging: 'Charging',
  finishing: 'Charging',
  reserved: 'Reserved',
  unavailable: 'Unavailable',
  faulted: 'Faulted',
  unknown: 'Unknown',
};

const key = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');

// OCPP statuses arrive raw ("SuspendedEVSE", "Faulted - Door Open"); drivers see a plain word.
export function toConnectorState(raw: string | null | undefined): ConnectorState {
  const text = (raw ?? '').trim();
  const direct = STATE_BY_KEY[key(text)];
  if (direct) return direct;

  const prefix = text.split(/\s+-\s+|:/)[0] ?? '';
  return STATE_BY_KEY[key(prefix)] ?? 'unknown';
}

export function connectorColorKey(state: ConnectorState): ConnectorStatus {
  return COLOR_KEY[state];
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
