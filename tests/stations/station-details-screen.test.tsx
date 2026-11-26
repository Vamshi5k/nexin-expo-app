import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Linking } from 'react-native';

import { StationDetailsScreen } from '@/features/stations';
import { stationsApi, toStationDetails } from '@/features/stations/api/stations.api';
import type { StationDetails } from '@/features/stations/types/stations.types';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('expo-linking', () => ({ createURL: (path: string) => `cruzeev://${path}` }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));
// A plain view that keeps onError, so a test can make one photo fail to load.
jest.mock('expo-image', () => {
  const { View } = jest.requireActual('react-native');
  return {
    Image: ({ onError, testID }: { onError: () => void; testID: string }) =>
      jest.requireActual('react').createElement(View, { onError, testID }),
  };
});
// The library's mock never animates; make dismiss() report back like the real sheet does.
jest.mock('@gorhom/bottom-sheet', () => {
  const mock = jest.requireActual('@gorhom/bottom-sheet/mock');
  class BottomSheetModal extends mock.BottomSheetModal {
    dismiss() {
      super.dismiss();
      this.props.onDismiss?.();
    }
  }
  return { ...mock, BottomSheetModal };
});
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: true })),
}));
jest.mock('@/features/stations/api/stations.api', () => ({
  ...jest.requireActual('@/features/stations/api/stations.api'),
  stationsApi: { getDetails: jest.fn(), getFavouriteIds: jest.fn(), setFavourite: jest.fn() },
}));

const getDetails = jest.mocked(stationsApi.getDetails);
const getFavouriteIds = jest.mocked(stationsApi.getFavouriteIds);
const setFavourite = jest.mocked(stationsApi.setFavourite);

const STATION = toStationDetails({
  id: 9,
  name: 'Hub One',
  status: 'Available',
  helpNumber: null,
  stationType: 'Public',
  stationLocation: { latitude: 17.4, longitude: 78.3, address: 'MG Road' },
  amenities: [
    { name: 'Wifi' },
    { name: 'Restaurant' },
    { name: 'Parking' },
    { name: 'Lounge area' },
    { name: 'Play Zone' },
  ],
  chargers: [
    {
      id: 1,
      chargerId: 'CRZ_01',
      capacity: 60,
      powerType: 'DC',
      tariff: [{ price: 18 }],
      connectors: [
        { id: 11, connectorId: 1, portType: 'CCS2', status: 'Charging' },
        { id: 12, connectorId: 2, portType: 'CCS2', status: 'Available' },
      ],
    },
  ],
});

const withImages = (urls: string[]): StationDetails => ({ ...STATION, imageUrls: urls });

const renderStation = async (station: StationDetails = STATION) => {
  getDetails.mockResolvedValue(station);
  await renderWithApp(<StationDetailsScreen stationId="9" />);
  await screen.findByRole('header', { name: 'Hub One' });
};

describe('StationDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFavouriteIds.mockResolvedValue([]);
    setFavourite.mockResolvedValue(undefined);
  });

  it('summary figures, then the Chargers tab with each charger and its connectors', async () => {
    await renderStation();

    expect(screen.getByLabelText('1 of 2 Connectors free')).toBeTruthy();
    expect(screen.getByText('Max power')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Get Directions' })).toBeTruthy();

    expect(screen.getByRole('tab', { name: 'Chargers', selected: true })).toBeTruthy();
    expect(screen.getByText('Charger 01')).toBeTruthy();
    expect(screen.getByText('DC · 60 kW · ₹18.00/kWh')).toBeTruthy();
    expect(screen.getByText('1/2 free')).toBeTruthy();
    expect(screen.getByLabelText('Connector 1, CCS2, Charging')).toBeTruthy();
    expect(screen.getByLabelText('Connector 2, CCS2, Available')).toBeTruthy();
    expect(screen.getByText('Tap a connector to start charging')).toBeTruthy();
  });

  describe('hero photos', () => {
    it('no photos: the brand illustration', async () => {
      await renderStation(withImages([]));
      expect(screen.getByTestId('station-hero-fallback')).toBeTruthy();
      expect(screen.queryByTestId('station-hero-image')).toBeNull();
    });

    it('one photo: no slider indicator', async () => {
      await renderStation(withImages(['https://cdn.example/a.jpg']));
      expect(screen.getAllByTestId('station-hero-image')).toHaveLength(1);
      expect(screen.queryByText('01 / 01')).toBeNull();
      expect(screen.queryByTestId('station-hero-fallback')).toBeNull();
    });

    it('many photos: a page indicator, and a broken one is skipped', async () => {
      await renderStation(
        withImages([
          'https://cdn.example/a.jpg',
          'https://cdn.example/b.jpg',
          'https://cdn.example/c.jpg',
        ]),
      );
      expect(screen.getByText('01 / 03')).toBeTruthy();

      await act(async () => fireEvent(screen.getAllByTestId('station-hero-image')[0]!, 'error'));
      expect(screen.getByText('01 / 02')).toBeTruthy();
    });

    it('every photo broken: falls back to the illustration', async () => {
      await renderStation(withImages(['https://cdn.example/a.jpg', 'https://cdn.example/b.jpg']));

      while (screen.queryAllByTestId('station-hero-image').length) {
        await act(async () => fireEvent(screen.getAllByTestId('station-hero-image')[0]!, 'error'));
      }
      expect(screen.getByTestId('station-hero-fallback')).toBeTruthy();
    });
  });

  it('Info tab lists every detail and amenity, and hides empty rows', async () => {
    await renderStation();
    expect(screen.queryByText('Lounge area')).toBeNull();

    await fireEvent.press(screen.getByRole('tab', { name: 'Info' }));

    expect(await screen.findByText('Lounge area')).toBeTruthy();
    expect(screen.getByText('Wifi')).toBeTruthy();
    expect(screen.getByText('Public')).toBeTruthy();
    expect(screen.getByText('Connector type')).toBeTruthy();
    expect(screen.getByText('Connectors')).toBeTruthy();
    expect(screen.getByText('02')).toBeTruthy();
    expect(screen.queryByText('Help line')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Call station' })).toBeNull();
    expect(screen.queryByText('Charger 1')).toBeNull();
  });

  it('with a phone number: help line with Call, and Copy address', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderStation({ ...STATION, phone: '+91 98765 43210' });
    await fireEvent.press(screen.getByRole('tab', { name: 'Info' }));

    expect(await screen.findByText('Help line')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Call station' }));
    expect(openURL).toHaveBeenCalledWith('tel:+91 98765 43210');

    await fireEvent.press(screen.getByRole('button', { name: 'Copy Address' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Address copied'));
  });

  it('a free connector opens charging; a busy one explains why not', async () => {
    await renderStation();

    await fireEvent.press(screen.getByLabelText('Connector 1, CCS2, Charging'));
    expect(toast.info).toHaveBeenCalledWith('Connector is currently Charging');
    expect(router.push).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText('Connector 2, CCS2, Available'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/charging-summary',
      params: { stationId: '9', chargerId: 'CRZ_01', connectorId: '2' },
    });
  });

  it('nothing free or charging: the charger shows as a quiet row', async () => {
    await renderStation({
      ...STATION,
      chargers: STATION.chargers.map(charger => ({
        ...charger,
        connectors: charger.connectors.map(connector => ({
          ...connector,
          state: 'unavailable' as const,
          label: 'Unavailable',
        })),
      })),
    });

    expect(screen.getByText('Charger 01')).toBeTruthy();
    expect(screen.getByText('DC · 60 kW · 2 × CCS2')).toBeTruthy();
    expect(screen.queryByText('Tap a connector to start charging')).toBeNull();
  });

  it('the heart adds a favourite with the new state, and rolls back if it fails', async () => {
    await renderStation();

    await fireEvent.press(screen.getByRole('button', { name: 'Add to favourites' }));
    expect(setFavourite).toHaveBeenCalledWith('9', true);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Added to favourites'));
    expect(screen.getByRole('button', { name: 'Remove from favourites' })).toBeTruthy();

    setFavourite.mockRejectedValueOnce(new Error('Server said no'));
    await fireEvent.press(screen.getByRole('button', { name: 'Remove from favourites' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server said no'));
    expect(setFavourite).toHaveBeenLastCalledWith('9', false);
    expect(screen.getByRole('button', { name: 'Remove from favourites' })).toBeTruthy();
  });

  it('a failed load shows the error with Retry', async () => {
    getDetails.mockRejectedValueOnce(new Error('down')).mockResolvedValue(STATION);
    await renderWithApp(<StationDetailsScreen stationId="9" />);

    expect(await screen.findByText("Couldn't load this station")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByRole('header', { name: 'Hub One' })).toBeTruthy();
    expect(getDetails).toHaveBeenCalledTimes(2);
  });
});
