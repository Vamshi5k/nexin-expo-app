import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { StationsScreen } from '@/features/stations';
import { stationsApi } from '@/features/stations/api/stations.api';
import type { NearbyStation } from '@/features/stations/types/stations.types';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn(), setParams: jest.fn() },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  getLastKnownPositionAsync: jest.fn(async () => ({
    coords: { latitude: 17.43, longitude: 78.39 },
  })),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('@/features/stations/api/stations.api', () => ({
  ...jest.requireActual('@/features/stations/api/stations.api'),
  stationsApi: { searchStations: jest.fn(), getFavouriteIds: jest.fn(), setFavourite: jest.fn() },
}));

const searchStations = jest.mocked(stationsApi.searchStations);
const getFavouriteIds = jest.mocked(stationsApi.getFavouriteIds);
const setFavourite = jest.mocked(stationsApi.setFavourite);
const getPermission = jest.mocked(Location.getForegroundPermissionsAsync);

const station = (id: string, overrides: Partial<NearbyStation> = {}): NearbyStation => ({
  id,
  name: `Hub ${id}`,
  address: 'MG Road, Hyderabad',
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

const page = (from: number, count: number) =>
  Array.from({ length: count }, (_, i) => station(String(from + i)));

const lastSearch = () => searchStations.mock.calls.at(-1)?.[0];

describe('StationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPermission.mockResolvedValue({ granted: true, canAskAgain: true } as never);
    getFavouriteIds.mockResolvedValue([]);
    setFavourite.mockResolvedValue(undefined);
  });

  it('lists the nearest stations with availability, power and distance', async () => {
    searchStations.mockResolvedValue([station('1'), station('2', { availableConnectors: 0 })]);
    await renderWithApp(<StationsScreen />);

    expect(await screen.findByLabelText('Hub 1, 2/4 Free')).toBeTruthy();
    expect(screen.getByLabelText('Hub 2, Unavailable')).toBeTruthy();
    expect(lastSearch()).toMatchObject({
      center: { latitude: 17.43, longitude: 78.39 },
      search: '',
      page: 1,
      limit: 10,
    });
  });

  it('searches 500 ms after typing stops, not on every key', async () => {
    jest.useFakeTimers();
    try {
      searchStations.mockResolvedValue([station('1')]);
      await renderWithApp(<StationsScreen />);
      await screen.findByLabelText('Hub 1, 2/4 Free');
      const callsBefore = searchStations.mock.calls.length;

      const input = screen.getByLabelText('Search stations...');
      await fireEvent.changeText(input, 'h');
      await fireEvent.changeText(input, 'hu');
      await fireEvent.changeText(input, 'hub');
      await act(async () => jest.advanceTimersByTime(400));
      expect(searchStations).toHaveBeenCalledTimes(callsBefore);

      await act(async () => jest.advanceTimersByTime(100));
      expect(searchStations).toHaveBeenCalledTimes(callsBefore + 1);
      expect(lastSearch()).toMatchObject({ search: 'hub', page: 1 });
    } finally {
      jest.useRealTimers();
    }
  });

  it('loads the next page near the end and adds it below', async () => {
    searchStations.mockResolvedValueOnce(page(1, 10)).mockResolvedValueOnce(page(11, 3));
    await renderWithApp(<StationsScreen />);
    await screen.findByLabelText('Hub 1, 2/4 Free');

    await act(async () => fireEvent(screen.getByTestId('stations-list'), 'endReached'));

    // The list only draws the first rows in tests, so check its data rather than the cards.
    await waitFor(() => expect(screen.getByTestId('stations-list').props.data).toHaveLength(13));
    expect(lastSearch()).toMatchObject({ page: 2 });

    // A short page was the last one: no more requests.
    await act(async () => fireEvent(screen.getByTestId('stations-list'), 'endReached'));
    expect(searchStations).toHaveBeenCalledTimes(2);
  });

  it('no match for a search offers Clear Search, which shows everything again', async () => {
    searchStations.mockResolvedValueOnce([station('1')]).mockResolvedValueOnce([]);
    await renderWithApp(<StationsScreen />);
    await screen.findByLabelText('Hub 1, 2/4 Free');

    await fireEvent.changeText(screen.getByLabelText('Search stations...'), 'zzz');
    expect(await screen.findByText('No stations found')).toBeTruthy();

    searchStations.mockResolvedValue([station('1')]);
    await fireEvent.press(screen.getByRole('button', { name: 'Clear Search' }));
    expect(await screen.findByLabelText('Hub 1, 2/4 Free')).toBeTruthy();
  });

  it('a failed load shows the error with Retry', async () => {
    searchStations.mockRejectedValueOnce(new Error('down')).mockResolvedValue([station('1')]);
    await renderWithApp(<StationsScreen />);

    expect(await screen.findByText("Couldn't load stations")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByLabelText('Hub 1, 2/4 Free')).toBeTruthy();
  });

  it('location off explains why, and Enable location asks for it', async () => {
    getPermission.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    searchStations.mockResolvedValue([station('1')]);
    await renderWithApp(<StationsScreen />);

    expect(await screen.findByText('Location is off')).toBeTruthy();
    expect(searchStations).not.toHaveBeenCalled();

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Enable location' })));
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(await screen.findByLabelText('Hub 1, 2/4 Free')).toBeTruthy();
  });

  it('the heart flips at once and rolls back if the server refuses', async () => {
    searchStations.mockResolvedValue([station('1')]);
    await renderWithApp(<StationsScreen />);
    await screen.findByLabelText('Hub 1, 2/4 Free');

    await fireEvent.press(screen.getByRole('button', { name: 'Add to favourites, Hub 1' }));
    expect(setFavourite).toHaveBeenCalledWith('1', true);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Added to favourites'));

    setFavourite.mockRejectedValueOnce(new Error('Server said no'));
    await fireEvent.press(screen.getByRole('button', { name: 'Remove from favourites, Hub 1' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server said no'));
    expect(screen.getByRole('button', { name: 'Remove from favourites, Hub 1' })).toBeTruthy();
  });

  it('a card opens Station Details', async () => {
    searchStations.mockResolvedValue([station('7')]);
    await renderWithApp(<StationsScreen />);

    await fireEvent.press(await screen.findByLabelText('Hub 7, 2/4 Free'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/station/[stationId]',
      params: { stationId: '7' },
    });
  });

  it('opened from the map search pill, it clears the focus param', async () => {
    searchStations.mockResolvedValue([]);
    await renderWithApp(<StationsScreen focusSearch />);
    await waitFor(() => expect(router.setParams).toHaveBeenCalledWith({ focus: undefined }));
  });
});
