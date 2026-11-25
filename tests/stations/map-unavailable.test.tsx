import { screen } from '@testing-library/react-native';

import { MapScreen } from '@/features/stations';
import { stationsApi } from '@/features/stations/api/stations.api';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('@/core/maps', () => ({ mapsSupport: 'needs-key' }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: true })),
}));
jest.mock('@/features/stations/api/stations.api', () => ({
  ...jest.requireActual('@/features/stations/api/stations.api'),
  stationsApi: { getLocations: jest.fn(async () => []), getNearby: jest.fn(async () => []) },
}));

it('a build without the Google Maps key shows a notice instead of crashing', async () => {
  await renderWithApp(<MapScreen />);

  expect(await screen.findByText("Map isn't available in this build")).toBeTruthy();
  expect(
    screen.getByText('This build has no Google Maps key. Stations still show below.'),
  ).toBeTruthy();
  expect(screen.queryByTestId('station-map')).toBeNull();
  expect(stationsApi.getNearby).toHaveBeenCalled();
});
