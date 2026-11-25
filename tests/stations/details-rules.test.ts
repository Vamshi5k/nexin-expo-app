import { toFavouriteIds, toStationDetails } from '@/features/stations/api/stations.api';
import type { Charger } from '@/features/stations/types/stations.types';
import {
  canStartCharging,
  chargingProgress,
  sortChargers,
  toConnectorState,
} from '@/features/stations/utils/connector';
import { mapsAppUrls } from '@/features/stations/utils/directions';
import { shareMessage } from '@/features/stations/utils/share';

describe('toConnectorState', () => {
  it.each([
    ['Available', 'available'],
    ['Preparing', 'preparing'],
    ['SuspendedEVSE', 'charging'],
    ['Faulted - Door Open', 'faulted'],
    ['Unavailable', 'unavailable'],
    ['something new', 'unknown'],
    [null, 'unknown'],
  ])('%s -> %s', (raw, expected) => {
    expect(toConnectorState(raw)).toBe(expected);
  });

  it('only available and preparing connectors can start a session', () => {
    expect(canStartCharging('available')).toBe(true);
    expect(canStartCharging('preparing')).toBe(true);
    expect(canStartCharging('charging')).toBe(false);
    expect(canStartCharging('faulted')).toBe(false);
  });
});

describe('toStationDetails', () => {
  const dto = {
    id: 9,
    name: ' Hub ',
    status: 'Available',
    helpNumber: ' ',
    amenities: [{ name: 'Wifi' }, { name: '' }],
    stationMedia: [],
    stationLocation: { latitude: '17.4', longitude: 78.3, address: 'MG Road', city: 'Hyd' },
    chargers: [
      {
        id: 1,
        chargerId: 'CRZ_01',
        capacity: '60',
        powerType: 'dc',
        tariff: [{ price: '18' }],
        connectors: [
          { id: 11, connectorId: 1, portType: 'CCS2', status: 'Charging', currentSoc: 45 },
        ],
      },
      { id: 2, chargerId: 'CRZ_02', capacity: 22, powerType: 'AC', tariff: [], connectors: [] },
    ],
  };

  it('maps chargers with paise and keeps a charger without a tariff (the old app crashed)', () => {
    const station = toStationDetails(dto);

    expect(station).toMatchObject({
      id: '9',
      name: 'Hub',
      address: 'MG Road, Hyd',
      phone: null,
      amenities: ['Wifi'],
      imageUrl: null,
      status: 'available',
    });
    expect(station.chargers[0]).toMatchObject({
      chargerId: 'CRZ_01',
      capacityKw: 60,
      powerType: 'DC',
      pricePerKwhPaise: 1800,
    });
    expect(station.chargers[0]?.connectors[0]).toMatchObject({
      connectorId: '1',
      state: 'charging',
      socPercent: 45,
      minutesToFull: null,
    });
    expect(station.chargers[1]?.pricePerKwhPaise).toBeNull();
  });

  it('favourite ids are strings and skip rows without one', () => {
    expect(toFavouriteIds([{ stationId: 9 }, { stationId: null }, { stationId: '12' }])).toEqual([
      '9',
      '12',
    ]);
  });
});

describe('chargers', () => {
  const charger = (id: string, states: string[]): Charger => ({
    id,
    chargerId: id,
    capacityKw: 60,
    powerType: 'DC',
    pricePerKwhPaise: 1800,
    connectors: states.map((state, index) => ({
      id: `${id}-${index}`,
      connectorId: String(index + 1),
      portType: 'CCS2',
      state: toConnectorState(state),
      socPercent: null,
      minutesToFull: null,
    })),
  });

  it('chargers with a free connector come first, otherwise server order', () => {
    const sorted = sortChargers([
      charger('busy', ['Charging']),
      charger('free', ['Available']),
      charger('down', ['Faulted']),
    ]);
    expect(sorted.map(item => item.id)).toEqual(['free', 'busy', 'down']);
  });

  it('charging progress shows SOC and time to full when the server sends them', () => {
    const base = charger('c', ['Charging']).connectors[0]!;
    expect(chargingProgress({ ...base, socPercent: 45, minutesToFull: 30 })).toBe(
      '45% · 30 min to full',
    );
    expect(chargingProgress(base)).toBeNull();
    expect(chargingProgress({ ...base, state: 'available', socPercent: 45 })).toBeNull();
  });
});

describe('share and directions', () => {
  const station = toStationDetails({
    id: 9,
    name: 'Hub',
    stationLocation: { latitude: 17.4, longitude: 78.3, address: 'MG Road' },
  });

  it("share text uses this brand's links, never another client's", () => {
    const message = shareMessage(station, {
      appUrl: 'cruzeev://station/9',
      webDomain: 'cruzeev.com',
    });
    expect(message).toContain('Open in app: cruzeev://station/9');
    expect(message).toContain('View online: https://cruzeev.com/station/9');
    expect(message).toContain('query=17.4,78.3');
    expect(message).not.toContain('lekha');

    expect(shareMessage(station, { appUrl: 'x://station/9', webDomain: null })).not.toContain(
      'View online',
    );
  });

  it('maps apps and the web fallback point at the station', () => {
    expect(mapsAppUrls(station)).toEqual({
      apple: 'maps://?daddr=17.4,78.3',
      googleIos: 'comgooglemaps://?daddr=17.4,78.3&directionsmode=driving',
      googleAndroid: 'google.navigation:q=17.4,78.3',
      web: 'https://www.google.com/maps/dir/?api=1&destination=17.4,78.3',
    });
  });
});
