import type { ConnectorStatus } from '@brand/schema';

import type { NearbyStation, StationPin, StationStatus } from '../types/stations.types';

const STATUS_BY_KEY: Record<string, StationStatus> = {
  available: 'available',
  active: 'available',
  operational: 'available',
  upcoming: 'upcoming',
  comingsoon: 'upcoming',
  planned: 'upcoming',
  undermaintenance: 'maintenance',
  undermaintainance: 'maintenance',
  maintenance: 'maintenance',
  unavailable: 'unavailable',
  notavailable: 'unavailable',
  inactive: 'unavailable',
  offline: 'unavailable',
  outoforder: 'unavailable',
  faulted: 'unavailable',
};

export const STATUS_LABEL: Record<StationStatus, string> = {
  available: 'Available',
  upcoming: 'Upcoming',
  maintenance: 'Under Maintenance',
  unavailable: 'Unavailable',
  unknown: 'Unknown',
};

// Pins reuse the brand's connector colours so every client gets its own palette.
const PIN_COLOR_KEY: Record<StationStatus, ConnectorStatus> = {
  available: 'Available',
  upcoming: 'Reserved',
  maintenance: 'Faulted',
  unavailable: 'Unavailable',
  unknown: 'Unknown',
};

export function toStationStatus(raw: string | null | undefined): StationStatus {
  const key = (raw ?? '').toLowerCase().replace(/[\s_-]/g, '');
  return STATUS_BY_KEY[key] ?? 'unknown';
}

export function pinColorKey(status: StationStatus): ConnectorStatus {
  return PIN_COLOR_KEY[status];
}

export type Availability = {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
};

export function availabilityOf(
  station: Pick<NearbyStation, 'status' | 'availableConnectors' | 'totalConnectors'>,
): Availability {
  if (station.status === 'upcoming' || station.status === 'maintenance') {
    return { label: STATUS_LABEL[station.status], tone: 'warning' };
  }

  if (station.status === 'unavailable') {
    return { label: STATUS_LABEL.unavailable, tone: 'danger' };
  }

  const { availableConnectors: available, totalConnectors: total } = station;
  if (available === null || total === null || total <= 0) {
    return { label: STATUS_LABEL[station.status], tone: 'neutral' };
  }

  if (available <= 0) return { label: 'Unavailable', tone: 'danger' };
  return { label: `${Math.min(available, total)} Available`, tone: 'success' };
}

// /station/locations and /station can disagree on a station's status. The nearby list is the
// fresher of the two, so its status wins for pins it covers and a pin always matches its card.
export function withNearbyStatus(pins: StationPin[], nearby: NearbyStation[]): StationPin[] {
  if (!nearby.length) return pins;

  const statusById = new Map(nearby.map(station => [station.id, station.status]));
  return pins.map(pin => {
    const status = statusById.get(pin.id);
    return status && status !== pin.status ? { ...pin, status } : pin;
  });
}
