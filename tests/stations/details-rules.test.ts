import { toFavouriteIds, toStationDetails } from '@/features/stations/api/stations.api';
import type { Charger } from '@/features/stations/types/stations.types';
import {
  canStartCharging,
  chargingProgress,
  sortChargers,
  toConnectorStatus,
} from '@/features/stations/utils/connector';
import { mapsAppUrls } from '@/features/stations/utils/directions';
import { shareMessage } from '@/features/stations/utils/share';
import { buildTheme } from '@/shared/theme';

describe('toConnectorStatus (CruzeEV labels and colours)', () => {
  const { colors } = buildTheme('light');

  // [raw OCPP code, state, CruzeEV label, main colour, card tint]
  it.each([
    ['Available', 'available', 'Available', '#16A34A', '#22C55E'],
    ['Preparing', 'preparing', 'Preparing', '#F59E0B', '#F59E0B'],
    ['Charging', 'charging', 'Charging', '#0DD5E3', '#00C8D0'],
    ['SuspendedEV', 'suspendedEv', 'Suspended EV', '#F59E0B', '#F59E0B'],
    ['SuspendedEVSE', 'suspendedEvse', 'Suspended EVSE', '#F59E0B', '#F59E0B'],
    ['Finishing', 'finishing', 'Finishing', '#1A8F99', '#00C8D0'],
    ['Reserved', 'reserved', 'Reserved', '#F59E0B', '#F59E0B'],
    ['Engaged', 'engaged', 'Engaged', '#1A8F99', '#00C8D0'],
    ['Unavailable', 'unavailable', 'Unavailable', '#EF4444', '#D32F2F'],
    ['Faulted', 'faulted', 'Faulted', '#D32F2F', '#D32F2F'],
    ['Offline', 'offline', 'Unavailable', '#D32F2F', '#D32F2F'],
  ])('%s -> %s "%s"', (raw, state, label, main, tint) => {
    const status = toConnectorStatus(raw);
    expect(status).toEqual({ state, label });
    expect(colors.status.connector[status.state]).toEqual({ main, tint });
  });

  it('spelling and case do not matter', () => {
    expect(toConnectorStatus(' suspended_evse ').state).toBe('suspendedEvse');
    expect(toConnectorStatus('FAULTED').state).toBe('faulted');
  });

  it('"Faulted - Door Open" keeps its full text with the Faulted colours', () => {
    expect(toConnectorStatus('Faulted - Door Open')).toEqual({
      state: 'faulted',
      label: 'Faulted - Door Open',
    });
  });

  it('unknown codes show their raw text in the unknown grey, never crash', () => {
    expect(toConnectorStatus('Exploded')).toEqual({ state: 'unknown', label: 'Exploded' });
    expect(toConnectorStatus(null)).toEqual({ state: 'unknown', label: 'Unknown' });
    expect(colors.status.connector.unknown).toEqual({ main: '#9CA3AF', tint: '#9CA3AF' });
  });

  it('only available and preparing connectors can start a session', () => {
    expect(canStartCharging('available')).toBe(true);
    expect(canStartCharging('preparing')).toBe(true);
    expect(canStartCharging('charging')).toBe(false);
    expect(canStartCharging('offline')).toBe(false);
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
      imageUrls: [],
      status: 'available',
      rawStatus: 'Available',
      accessType: null,
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

  it('groups connectors under their own charger with the real ids from the API', () => {
    const station = toStationDetails({
      id: 19,
      status: 'Available',
      stationType: 'Public',
      stationLocation: { latitude: 17.39, longitude: 77.83 },
      chargers: [
        {
          id: 58,
          chargerId: 'CRZ_60kW_01',
          capacity: 60,
          powerType: 'DC',
          connectors: [
            { id: 164, connectorId: '1', portType: 'CCS2', status: 'Unavailable' },
            { id: 165, connectorId: '2', portType: 'CCS2', status: 'Charging' },
          ],
        },
        {
          id: 59,
          chargerId: 'CRZ_22kW_02',
          capacity: 22,
          powerType: 'AC',
          connectors: [{ id: 170, connectorId: '1', portType: 'Type 2', status: 'Available' }],
        },
      ],
    });

    expect(station.accessType).toBe('Public');
    expect(
      station.chargers.map(charger => ({
        id: charger.chargerId,
        connectors: charger.connectors.map(item => `${item.connectorId}:${item.label}`),
      })),
    ).toEqual([
      { id: 'CRZ_60kW_01', connectors: ['1:Unavailable', '2:Charging'] },
      { id: 'CRZ_22kW_02', connectors: ['1:Available'] },
    ]);
  });

  it('keeps only real image links, in order, and the station status as sent', () => {
    const station = toStationDetails({
      id: 1,
      status: 'Up-Coming',
      stationLocation: { latitude: 1, longitude: 2 },
      stationMedia: [
        { url: 'https://cdn.example/a.jpg' },
        { url: '' },
        { url: 'not a url' },
        { url: null },
        { url: 'https://cdn.example/b.jpg' },
      ],
    });

    expect(station.imageUrls).toEqual(['https://cdn.example/a.jpg', 'https://cdn.example/b.jpg']);
    expect(station.rawStatus).toBe('Up-Coming');
    expect(station.status).toBe('upcoming');
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
      ...toConnectorStatus(state),
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
    expect(chargingProgress({ ...base, state: 'suspendedEv', socPercent: 45 })).toBeNull();
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
