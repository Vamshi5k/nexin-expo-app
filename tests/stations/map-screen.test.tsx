import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { usePermissionBlocked } from '@/core/permissions';
import { MapScreen, useStationFilters } from '@/features/stations';
import { stationsApi } from '@/features/stations/api/stations.api';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: true })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: false })),
  getLastKnownPositionAsync: jest.fn(async () => null),
  getCurrentPositionAsync: jest.fn(),
}));

const pin = (id: string, name: string, latitude: number, longitude: number) => ({
  id,
  name,
  latitude,
  longitude,
  status: 'available' as const,
});

const nearby = (id: string, name: string, latitude: number, longitude: number) => ({
  id,
  name,
  address: 'MG Road, Hyderabad',
  latitude,
  longitude,
  distanceKm: 1.2,
  availableConnectors: 2,
  totalConnectors: 4,
  connectorTypes: ['CCS2'],
  maxPowerKw: 60,
  pricePerKwhPaise: 1800,
  status: 'available' as const,
});

jest.mock('@/features/stations/api/stations.api', () => ({
  ...jest.requireActual('@/features/stations/api/stations.api'),
  stationsApi: { getLocations: jest.fn(), getNearby: jest.fn() },
}));

const getLocations = jest.mocked(stationsApi.getLocations);
const getNearby = jest.mocked(stationsApi.getNearby);

// Far enough apart that none of them cluster at the brand's default zoom.
const PINS = [
  pin('1', 'Hub One', 17.42, 78.37),
  pin('2', 'Hub Two', 17.44, 78.39),
  pin('3', 'Far Hub', 17.4, 78.355),
];
const NEARBY = [nearby('1', 'Hub One', 17.42, 78.37), nearby('2', 'Hub Two', 17.44, 78.39)];

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStationFilters.getState().clear();
    getLocations.mockResolvedValue(PINS);
    getNearby.mockResolvedValue(NEARBY);
  });

  it('shows pins and the nearby cards without asking for location', async () => {
    await renderWithApp(<MapScreen />);

    expect(await screen.findByLabelText('Hub One, 2 Available')).toBeTruthy();
    expect(screen.getByLabelText('Far Hub, Available')).toBeTruthy();
    expect(screen.getByText('View all stations')).toBeTruthy();
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(getLocations).toHaveBeenCalledWith({
      minPowerKw: null,
      access: 'any',
      connectorTypes: [],
    });
  });

  it('a pin outside the nearby list shows its own card; that card opens the station', async () => {
    await renderWithApp(<MapScreen />);
    await screen.findByLabelText('Hub One, 2 Available');

    await fireEvent.press(screen.getByLabelText('Far Hub, Available'));
    const peek = screen.getByLabelText('Far Hub, Available. View details');

    await fireEvent.press(peek);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/station/[stationId]',
      params: { stationId: '3' },
    });
  });

  it('a pin in the nearby list highlights its card instead of leaving the map', async () => {
    await renderWithApp(<MapScreen />);
    await screen.findByLabelText('Hub One, 2 Available');

    await fireEvent.press(screen.getByLabelText('Hub Two, Available'));
    expect(screen.queryByText('View details')).toBeNull();
    expect(router.push).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText('Hub Two, 2 Available'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/station/[stationId]',
      params: { stationId: '2' },
    });
  });

  it('a failed load shows a toast and Retry loads again', async () => {
    getLocations.mockRejectedValueOnce(new Error('down'));
    await renderWithApp(<MapScreen />);

    const retry = await screen.findByRole('button', { name: 'Retry' });
    expect(toast.error).toHaveBeenCalledWith("Couldn't load charging stations. Please try again.");

    await fireEvent.press(retry);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull());
    expect(getLocations).toHaveBeenCalledTimes(2);
  });

  it('my-location asks only on tap, and a denial explains how to turn it on', async () => {
    await renderWithApp(<MapScreen />);
    await screen.findByLabelText('Hub One, 2 Available');

    await fireEvent.press(screen.getByRole('button', { name: 'Go to my location' }));

    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(usePermissionBlocked.getState().kind).toBe('location'));
    await act(async () => usePermissionBlocked.getState().close(false));
    expect(screen.getByRole('button', { name: 'Go to my location' })).not.toBeDisabled();
  });

  it('applied filters reload the map and show a count on the filter button', async () => {
    await renderWithApp(<MapScreen />);
    await screen.findByLabelText('Hub One, 2 Available');

    await act(async () =>
      useStationFilters.getState().apply({ minPowerKw: 50, access: 'public', connectorTypes: [] }),
    );

    await waitFor(() =>
      expect(getLocations).toHaveBeenLastCalledWith({
        minPowerKw: 50,
        access: 'public',
        connectorTypes: [],
      }),
    );
    expect(screen.getByRole('button', { name: 'Filters, 2 active' })).toBeTruthy();
  });

  it('no stations nearby with filters on offers to clear them', async () => {
    useStationFilters.getState().apply({ minPowerKw: 120, access: 'any', connectorTypes: [] });
    getNearby.mockResolvedValue([]);
    await renderWithApp(<MapScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Clear filters' }));
    expect(useStationFilters.getState().filters.minPowerKw).toBeNull();
  });
});
