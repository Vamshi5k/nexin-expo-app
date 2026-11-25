import type { ConnectorStatus } from '@brand/schema';

import type { NearbyStation, StationStatus } from '../types/stations.types';

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

export type BadgeKind = 'free' | 'busy' | 'online' | 'soon' | 'service' | 'offline' | 'unknown';

export type Badge =
  | { kind: 'free'; free: number; total: number }
  | { kind: 'busy'; total: number }
  | { kind: Exclude<BadgeKind, 'free' | 'busy'> };

type StatusBadge = Exclude<BadgeKind, 'free' | 'busy' | 'online'>;

const BADGE_BY_STATUS: Record<Exclude<StationStatus, 'available'>, StatusBadge> = {
  upcoming: 'soon',
  maintenance: 'service',
  unavailable: 'offline',
  unknown: 'unknown',
};

// What the status strip on a card shows. A full station is busy, not offline.
export function badgeOf(
  station: Pick<NearbyStation, 'status' | 'availableConnectors' | 'totalConnectors'>,
): Badge {
  if (station.status !== 'available') return { kind: BADGE_BY_STATUS[station.status] };

  const { availableConnectors: free, totalConnectors: total } = station;
  if (free === null || total === null || total <= 0) return { kind: 'online' };
  if (free <= 0) return { kind: 'busy', total };
  return { kind: 'free', free: Math.min(free, total), total };
}
