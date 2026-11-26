import { appendPage, hasMorePages, listAvailability } from '@/features/stations/utils/list';
import type { NearbyStation } from '@/features/stations/types/stations.types';

const station = (id: string, overrides: Partial<NearbyStation> = {}): NearbyStation => ({
  id,
  name: `Hub ${id}`,
  address: 'MG Road',
  latitude: 17.4,
  longitude: 78.4,
  distanceKm: 1.2,
  availableConnectors: 2,
  totalConnectors: 4,
  connectorTypes: ['CCS2'],
  maxPowerKw: 60,
  pricePerKwhPaise: 1800,
  status: 'available',
  ...overrides,
});

describe('listAvailability', () => {
  it('free connectors read as "x/y Free"', () => {
    expect(listAvailability(station('1'))).toEqual({ label: '2/4 Free', tone: 'success' });
  });

  it('never claims more free than there are', () => {
    expect(listAvailability(station('1', { availableConnectors: 6 })).label).toBe('4/4 Free');
  });

  it('none free, or the station closed, reads "Unavailable" in red', () => {
    expect(listAvailability(station('1', { availableConnectors: 0 }))).toEqual({
      label: 'Unavailable',
      tone: 'danger',
    });
    expect(listAvailability(station('1', { status: 'unavailable' })).tone).toBe('danger');
  });

  it('maintenance and upcoming show the status as a warning', () => {
    expect(listAvailability(station('1', { status: 'maintenance' })).tone).toBe('warning');
    expect(listAvailability(station('1', { status: 'upcoming' })).tone).toBe('warning');
  });

  it('unknown counts fall back to the station status', () => {
    expect(listAvailability(station('1', { totalConnectors: null })).tone).toBe('neutral');
  });
});

describe('paging', () => {
  it('appends the next page without repeating stations', () => {
    const merged = appendPage([station('1'), station('2')], [station('2'), station('3')]);
    expect(merged.map(s => s.id)).toEqual(['1', '2', '3']);
  });

  it('a full page means there may be more; a short one is the end', () => {
    expect(hasMorePages(10, 10)).toBe(true);
    expect(hasMorePages(4, 10)).toBe(false);
  });
});
