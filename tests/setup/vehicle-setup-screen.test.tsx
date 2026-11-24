import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { VehicleSetupScreen } from '@/features/setup';
import { getBrands, getModels } from '@/features/vehicles/api';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
jest.mock('@/features/vehicles/api', () => ({
  ...jest.requireActual('@/features/vehicles/api'),
  getBrands: jest.fn(async () => [
    { id: '1', name: 'Tata' },
    { id: '2', name: 'MG' },
  ]),
  getModels: jest.fn(async () => [{ id: '12', name: 'Nexon EV' }]),
  getCapacities: jest.fn(async () => []),
}));

describe('VehicleSetupScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('picks a brand, then shows that brand’s models', async () => {
    await renderWithApp(<VehicleSetupScreen />);
    expect(await screen.findByText('Select your brand')).toBeTruthy();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    await fireEvent.press(await screen.findByRole('radio', { name: 'MG' }));
    await fireEvent.press(continueButton);

    expect(getModels).toHaveBeenCalledWith('2');
    expect(await screen.findByText('Pick your MG model')).toBeTruthy();
    expect(await screen.findByRole('radio', { name: 'Nexon EV' })).toBeTruthy();
  });

  it('Custom capacity opens an inline kWh field, validated as you type', async () => {
    await renderWithApp(<VehicleSetupScreen />);
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    await fireEvent.press(await screen.findByRole('radio', { name: 'MG' }));
    await fireEvent.press(continueButton);
    await fireEvent.press(await screen.findByRole('radio', { name: 'Nexon EV' }));
    await fireEvent.press(continueButton);

    expect(screen.queryByLabelText('Battery capacity (kWh)')).toBeNull();
    await fireEvent.press(await screen.findByRole('radio', { name: 'Custom, Enter manually' }));
    const field = screen.getByLabelText('Battery capacity (kWh)');

    await fireEvent.changeText(field, '9');
    expect(screen.getByText('Minimum 10 kWh')).toBeTruthy();
    expect(continueButton).toBeDisabled();

    await fireEvent.changeText(field, '40');
    expect(screen.queryByText('Minimum 10 kWh')).toBeNull();
    expect(continueButton).toBeEnabled();
  });

  it('shows an empty state with Retry when there are no brands', async () => {
    jest.mocked(getBrands).mockResolvedValueOnce([]);
    await renderWithApp(<VehicleSetupScreen />);
    expect(await screen.findByText('No brands available')).toBeTruthy();
  });

  it('long brand lists get a search field that filters the grid', async () => {
    jest.mocked(getBrands).mockResolvedValueOnce(
      ['Tata', 'MG', 'Hyundai', 'Mahindra', 'BYD', 'Kia', 'Volvo'].map((name, i) => ({
        id: String(i),
        name,
      })),
    );
    await renderWithApp(<VehicleSetupScreen />);
    await fireEvent.changeText(await screen.findByLabelText('Search brands'), 'hy');
    expect(screen.getByRole('radio', { name: 'Hyundai' })).toBeTruthy();
    expect(screen.queryByRole('radio', { name: 'Tata' })).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Search brands'), 'zzz');
    expect(screen.getByText('No matches')).toBeTruthy();
  });

  it('the picked brand shows as a chip that jumps back to the brand step', async () => {
    await renderWithApp(<VehicleSetupScreen />);
    await fireEvent.press(await screen.findByRole('radio', { name: 'MG' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Pick your MG model')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Change MG' }));
    expect(await screen.findByText('Select your brand')).toBeTruthy();
  });

  it('Skip goes to the permissions step', async () => {
    await renderWithApp(<VehicleSetupScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Skip' }));
    expect(router.replace).toHaveBeenCalledWith('/(setup)/permissions');
  });
});
