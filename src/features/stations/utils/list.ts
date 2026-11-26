import { STATUS_LABEL, type Availability } from './status';
import { LIST_COPY } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';

// The list card's pill: "2/4 Free" while connectors are free, "Unavailable" when none are,
// and the station status when the station itself is closed or the counts are unknown.
export function listAvailability(
  station: Pick<NearbyStation, 'status' | 'availableConnectors' | 'totalConnectors'>,
): Availability {
  if (station.status === 'upcoming' || station.status === 'maintenance') {
    return { label: STATUS_LABEL[station.status], tone: 'warning' };
  }

  if (station.status === 'unavailable') {
    return { label: LIST_COPY.unavailable, tone: 'danger' };
  }

  const { availableConnectors: available, totalConnectors: total } = station;
  if (available === null || total === null || total <= 0) {
    return { label: STATUS_LABEL[station.status], tone: 'neutral' };
  }

  if (available <= 0) return { label: LIST_COPY.unavailable, tone: 'danger' };
  return { label: LIST_COPY.free(Math.min(available, total), total), tone: 'success' };
}

// Adds the next page, skipping stations already shown (pages can shift as stations change).
export function appendPage(current: NearbyStation[], next: NearbyStation[]): NearbyStation[] {
  const seen = new Set(current.map(station => station.id));
  return [...current, ...next.filter(station => !seen.has(station.id))];
}

// A full page means there may be more; a short one is the end of the list.
export const hasMorePages = (received: number, pageSize: number) => received >= pageSize;
