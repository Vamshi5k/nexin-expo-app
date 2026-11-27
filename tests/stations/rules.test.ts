import { toNearbyStation, toStationPin } from '@/features/stations/api/stations.api';
import {
  clusterExpansionRegion,
  createClusterIndex,
  mapItemsInRegion,
} from '@/features/stations/utils/clusters';
import { directionsUrls } from '@/features/stations/utils/directions';
import { countActiveFilters, toFilterParams } from '@/features/stations/utils/filters';
import {
  distanceKm,
  formatDistance,
  formatEta,
  regionToBounds,
  regionToZoom,
} from '@/features/stations/utils/geo';
import {
  availabilityOf,
  pinColorKey,
  toStationStatus,
  withNearbyStatus,
} from '@/features/stations/utils/status';

describe('toStationStatus', () => {
  it.each([
    ['Available', 'available'],
    ['Up-Coming', 'upcoming'],
    ['Under_Maintenance', 'maintenance'],
    ['under maintainance', 'maintenance'],
    ['Inactive', 'unavailable'],
    ['Faulted', 'unavailable'],
    ['something new', 'unknown'],
    [null, 'unknown'],
  ])('%s -> %s', (raw, expected) => {
    expect(toStationStatus(raw)).toBe(expected);
  });

  it('pins use the brand connector colours by status', () => {
    expect(pinColorKey('available')).toBe('Available');
    expect(pinColorKey('upcoming')).toBe('Reserved');
    expect(pinColorKey('maintenance')).toBe('Faulted');
    expect(pinColorKey('unavailable')).toBe('Unavailable');
    expect(pinColorKey('unknown')).toBe('Unknown');
  });
});

describe('availabilityOf', () => {
  const station = { status: 'available' as const, availableConnectors: 2, totalConnectors: 4 };

  it('shows the free count when connectors are free', () => {
    expect(availabilityOf(station)).toEqual({ label: '2 Available', tone: 'success' });
  });

  it('shows Unavailable when nothing is free', () => {
    expect(availabilityOf({ ...station, availableConnectors: 0 })).toEqual({
      label: 'Unavailable',
      tone: 'danger',
    });
  });

  it('offline statuses win over counts', () => {
    expect(availabilityOf({ ...station, status: 'maintenance' }).label).toBe('Under Maintenance');
    expect(availabilityOf({ ...station, status: 'upcoming' }).tone).toBe('warning');
  });

  it('missing counts are not shown as busy', () => {
    expect(availabilityOf({ ...station, totalConnectors: null })).toEqual({
      label: 'Available',
      tone: 'neutral',
    });
  });
});

describe('filters', () => {
  it('no filters by default: nothing is sent and nothing is counted', () => {
    const none = { minPowerKw: null, access: 'any' as const, connectorTypes: [] };
    expect(toFilterParams(none)).toEqual({});
    expect(countActiveFilters(none)).toBe(0);
  });

  it('maps every filter to the old query names', () => {
    const filters = {
      minPowerKw: 22,
      access: 'private' as const,
      connectorTypes: ['CCS2' as const, 'Type 2' as const],
    };
    expect(toFilterParams(filters)).toEqual({
      min_power_output: 22,
      stationType: 'Private',
      connectorTypes: 'CCS2,Type 2',
    });
    expect(countActiveFilters(filters)).toBe(4);
  });
});

describe('mappers', () => {
  it('toStationPin reads status or stationStatus and drops rows without coordinates', () => {
    expect(
      toStationPin({
        id: 7,
        name: ' Hub ',
        stationStatus: 'Available',
        stationLocation: { latitude: '12.5', longitude: 77.1 },
      }),
    ).toEqual({ id: '7', name: 'Hub', latitude: 12.5, longitude: 77.1, status: 'available' });

    expect(toStationPin({ id: 8, stationLocation: { latitude: null, longitude: 77 } })).toBeNull();
  });

  it('toNearbyStation keeps money in paise and missing numbers as null', () => {
    expect(
      toNearbyStation({
        id: 3,
        name: 'Mall',
        distance: '2.456',
        totalConnectors: 4,
        availableConnectors: '1',
        connectorTypes: 'CCS2, Type 2,',
        maxPowerOutput: 60,
        minStartingPrice: '18.5',
        status: 'Up-Coming',
        stationLocation: { latitude: 12, longitude: 77, address: 'MG Road', city: 'Bengaluru' },
      }),
    ).toEqual({
      id: '3',
      name: 'Mall',
      address: 'MG Road, Bengaluru',
      latitude: 12,
      longitude: 77,
      distanceKm: 2.456,
      availableConnectors: 1,
      totalConnectors: 4,
      connectorTypes: ['CCS2', 'Type 2'],
      maxPowerKw: 60,
      pricePerKwhPaise: 1850,
      status: 'upcoming',
    });

    const bare = toNearbyStation({ id: 4, stationLocation: { latitude: 1, longitude: 2 } });
    expect(bare).toMatchObject({
      distanceKm: null,
      totalConnectors: null,
      pricePerKwhPaise: null,
      maxPowerKw: null,
      address: '',
    });
  });
});

describe('geo', () => {
  it('distance and ETA', () => {
    const km = distanceKm(
      { latitude: 17.385, longitude: 78.4867 },
      { latitude: 17.4239, longitude: 78.3772 },
    );
    expect(km).toBeGreaterThan(12);
    expect(km).toBeLessThan(13);
    expect(formatDistance(2.456)).toBe('2.5 km');
    expect(formatDistance(12.4)).toBe('12 km');
    expect(formatEta(1)).toBe('2 min');
    expect(formatEta(45)).toBe('1h 30m');
  });

  it('region -> bounds and zoom', () => {
    const region = { latitude: 10, longitude: 20, latitudeDelta: 2, longitudeDelta: 4 };
    expect(regionToBounds(region)).toEqual({ west: 18, south: 9, east: 22, north: 11 });
    expect(regionToZoom(region)).toBe(6);
  });
});

describe('clusters', () => {
  const pin = (id: string, latitude: number, longitude: number) => ({
    id,
    name: id,
    latitude,
    longitude,
    status: 'available' as const,
  });
  const pins = [pin('a', 17.4, 78.4), pin('b', 17.4001, 78.4001), pin('far', 18.5, 79.5)];

  it('groups close pins when zoomed out and splits them when zoomed in', () => {
    const index = createClusterIndex(pins);

    const wide = mapItemsInRegion(index, {
      latitude: 17.9,
      longitude: 78.9,
      latitudeDelta: 3,
      longitudeDelta: 3,
    });
    expect(wide.filter(item => item.kind === 'cluster')).toHaveLength(1);
    expect(wide.filter(item => item.kind === 'pin').map(item => item.key)).toEqual(['pin-far']);

    const close = mapItemsInRegion(index, {
      latitude: 17.4,
      longitude: 78.4,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    });
    expect(close.map(item => item.key).sort()).toEqual(['pin-a', 'pin-b']);
  });

  it('a cluster tap zooms in past the clustering level of that group', () => {
    const index = createClusterIndex(pins);
    const [cluster] = mapItemsInRegion(index, {
      latitude: 17.4,
      longitude: 78.4,
      latitudeDelta: 1,
      longitudeDelta: 1,
    }).filter(item => item.kind === 'cluster');
    if (cluster?.kind !== 'cluster') throw new Error('expected a cluster');

    const region = clusterExpansionRegion(index, cluster.clusterId, cluster.coordinate);
    expect(region.longitudeDelta).toBeLessThan(1);
  });
});

describe('directions', () => {
  const point = { latitude: 17.42, longitude: 78.37 };

  it('opens the native maps app, with a Google Maps web fallback', () => {
    expect(directionsUrls(point, 'ios')).toEqual({
      app: 'maps://?daddr=17.42,78.37',
      web: 'https://www.google.com/maps/dir/?api=1&destination=17.42,78.37',
    });
    expect(directionsUrls(point, 'android').app).toBe('google.navigation:q=17.42,78.37');
  });
});

describe('withNearbyStatus', () => {
  const pin = { id: '7', name: 'Hub', latitude: 1, longitude: 2, status: 'unavailable' as const };

  it('a pin takes the status of its nearby card, so both show the same colour', () => {
    const near = { ...toNearbyStation({ id: 7, stationLocation: { latitude: 1, longitude: 2 } })! };
    const [merged] = withNearbyStatus([pin], [{ ...near, status: 'available' }]);
    expect(merged.status).toBe('available');
  });

  it('pins outside the nearby list keep their own status', () => {
    expect(withNearbyStatus([pin], [])).toEqual([pin]);
  });
});
