import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { apiError } from '@/core/api';
import { FavouriteSpotsScreen } from '@/features/stations';
import { stationsApi, toFavouriteStation } from '@/features/stations/api/stations.api';
import type { FavouriteStation } from '@/features/stations/types/stations.types';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

// Lets a test bring the screen back into focus, as when the driver returns to it.
const mockFocus: { effects: Set<() => void> } = { effects: new Set() };

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useFocusEffect: (effect: () => void) => {
    mockFocus.effects.add(effect);
    jest.requireActual('react').useEffect(effect, [effect]);
  },
}));
jest.mock('@/features/stations/api/stations.api', () => ({
  ...jest.requireActual('@/features/stations/api/stations.api'),
  stationsApi: { getFavourites: jest.fn(), setFavourite: jest.fn(async () => undefined) },
}));

const api = jest.mocked(stationsApi);

const station = (id: string, name: string, coords = true): FavouriteStation => ({
  id,
  name,
  address: 'Madhapur, Hyderabad',
  coordinates: coords ? { latitude: 17.44, longitude: 78.38 } : null,
});
const page = (items: FavouriteStation[], current = 1, totalPages = 1) => ({
  items,
  page: current,
  totalPages,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFocus.effects.clear();
  api.getFavourites.mockResolvedValue(
    page([station('1', 'Hub One'), station('2', 'Hub Two', false)]),
  );
});

describe('toFavouriteStation', () => {
  it('reads the station inside each favourite, with its place and location', () => {
    expect(
      toFavouriteStation({
        stationId: 9,
        station: {
          name: ' Hub One ',
          stationLocation: {
            address: 'MG Road',
            city: 'Hyderabad',
            latitude: '17.4',
            longitude: 78.3,
          },
        },
      }),
    ).toEqual({
      id: '9',
      name: 'Hub One',
      address: 'MG Road, Hyderabad',
      coordinates: { latitude: 17.4, longitude: 78.3 },
    });
    expect(toFavouriteStation({ stationId: 3 })).toMatchObject({ name: '', coordinates: null });
    expect(toFavouriteStation({ station: { name: 'x' } })).toBeNull();
  });
});

describe('Favourite Spots', () => {
  it('lists saved stations with a filled heart; directions only when there is a location', async () => {
    await renderWithApp(<FavouriteSpotsScreen />);

    expect(await screen.findByText('Hub One')).toBeTruthy();
    expect(api.getFavourites).toHaveBeenCalledWith(1, '');
    expect(screen.getByText('2 saved stations')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove Hub One from favourites' })).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByRole('button', { name: 'Directions to Hub One' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Directions to Hub Two' })).toBeNull();

    await fireEvent.press(screen.getByLabelText('Hub One, Madhapur, Hyderabad'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/station/[stationId]',
      params: { stationId: '1' },
    });
  });

  it('a station hearted elsewhere shows up when the screen is opened again', async () => {
    await renderWithApp(<FavouriteSpotsScreen />);
    await screen.findByText('Hub One');

    api.getFavourites.mockResolvedValue(
      page([station('3', 'New Spot'), station('1', 'Hub One'), station('2', 'Hub Two')]),
    );
    await act(async () => [...mockFocus.effects].forEach(effect => effect()));

    expect(await screen.findByText('New Spot')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove New Spot from favourites' })).toBeTruthy();
  });

  it('the heart removes at once and puts it back if the server refuses', async () => {
    await renderWithApp(<FavouriteSpotsScreen />);
    await screen.findByText('Hub One');

    await act(async () =>
      fireEvent.press(screen.getByRole('button', { name: 'Remove Hub One from favourites' })),
    );
    expect(api.setFavourite).toHaveBeenCalledWith('1', false);
    expect(screen.queryByText('Hub One')).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('Removed from favourites');

    api.setFavourite.mockRejectedValueOnce(new Error('Nope'));
    await act(async () =>
      fireEvent.press(screen.getByRole('button', { name: 'Remove Hub Two from favourites' })),
    );
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Nope'));
    expect(screen.getByText('Hub Two')).toBeTruthy();
  });

  it('searches the server and offers Clear Search when nothing matches', async () => {
    await renderWithApp(<FavouriteSpotsScreen />);
    await screen.findByText('Hub One');

    api.getFavourites.mockResolvedValue(page([]));
    await fireEvent.changeText(screen.getByLabelText('Search favourites...'), 'zzz');
    expect(await screen.findByText('No favourites found')).toBeTruthy();
    expect(api.getFavourites).toHaveBeenLastCalledWith(1, 'zzz');
  });

  it('loads the next page at the end of the list', async () => {
    api.getFavourites.mockResolvedValueOnce(page([station('1', 'Hub One')], 1, 2));
    await renderWithApp(<FavouriteSpotsScreen />);
    await screen.findByText('Hub One');

    api.getFavourites.mockResolvedValueOnce(page([station('5', 'Hub Five')], 2, 2));
    await act(async () => fireEvent(screen.getByTestId('favourites-list'), 'endReached'));
    expect(api.getFavourites).toHaveBeenLastCalledWith(2, '');
    expect(await screen.findByText('Hub Five')).toBeTruthy();
  });

  it('empty and error states', async () => {
    api.getFavourites.mockResolvedValueOnce(page([]));
    const empty = await renderWithApp(<FavouriteSpotsScreen />);
    expect(await screen.findByText('No favourites yet')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Find stations' }));
    expect(router.navigate).toHaveBeenCalledWith('/(app)/(tabs)/home');
    await empty.unmount();

    api.getFavourites.mockRejectedValueOnce(apiError('down', 'network'));
    await renderWithApp(<FavouriteSpotsScreen />);
    expect(await screen.findByText("Couldn't load your favourites")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByText('Hub One')).toBeTruthy();
  });
});
