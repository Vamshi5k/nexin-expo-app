import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { StationDetailsScreen } from '@/features/stations';
import { stationsApi, toStationDetails } from '@/features/stations/api/stations.api';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('expo-linking', () => ({ createURL: (path: string) => `cruzeev://${path}` }));
jest.mock('expo-image', () => ({ Image: () => null }));
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
  stationLocation: { latitude: 17.4, longitude: 78.3, address: 'MG Road' },
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

describe('StationDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDetails.mockResolvedValue(STATION);
    getFavouriteIds.mockResolvedValue([]);
    setFavourite.mockResolvedValue(undefined);
  });

  it('shows the station, its chargers and no Call button without a phone number', async () => {
    await renderWithApp(<StationDetailsScreen stationId="9" />);

    expect(await screen.findByText('Hub One')).toBeTruthy();
    expect(screen.getByText('Charger 1')).toBeTruthy();
    expect(screen.getByText('1/2 free')).toBeTruthy();
    expect(screen.getByLabelText('1 of 2 connectors free')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Get Directions' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Call station' })).toBeNull();
    expect(getDetails).toHaveBeenCalledWith('9');
  });

  it('About this station lists address, help line, connector types and amenities', async () => {
    getDetails.mockResolvedValueOnce({ ...STATION, amenities: ['Wifi'] });
    await renderWithApp(<StationDetailsScreen stationId="9" />);

    expect(await screen.findByText('About this station')).toBeTruthy();
    expect(screen.getAllByText('MG Road')).toHaveLength(2);
    expect(screen.getByText('Not available')).toBeTruthy();
    expect(screen.getByText('Connector types')).toBeTruthy();
    expect(screen.getAllByText('CCS2')).toHaveLength(3);
    expect(screen.getByText('Wifi')).toBeTruthy();
  });

  it('a free connector opens charging; a busy one explains why not', async () => {
    await renderWithApp(<StationDetailsScreen stationId="9" />);

    await fireEvent.press(await screen.findByLabelText('Connector 1, CCS2, Charging'));
    expect(toast.info).toHaveBeenCalledWith('Connector is currently Charging');
    expect(router.push).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText('Connector 2, CCS2, Available'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/charging-summary',
      params: { stationId: '9', chargerId: 'CRZ_01', connectorId: '2' },
    });
  });

  it('the heart adds a favourite with the new state, and rolls back if it fails', async () => {
    await renderWithApp(<StationDetailsScreen stationId="9" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Add to favourites' }));
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
    getDetails.mockRejectedValueOnce(new Error('down'));
    await renderWithApp(<StationDetailsScreen stationId="9" />);

    expect(await screen.findByText("Couldn't load this station")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByText('Hub One')).toBeTruthy();
    expect(getDetails).toHaveBeenCalledTimes(2);
  });
});
