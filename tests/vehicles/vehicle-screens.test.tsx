import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { apiError } from '@/core/api';
import { AddVehicleScreen, EditVehicleScreen, MyVehiclesScreen } from '@/features/vehicles';
import { vehiclesApi } from '@/features/vehicles/api/vehicles.api';
import type { Vehicle } from '@/features/vehicles/types/vehicles.types';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
  useNavigation: () => ({ dispatch: jest.fn() }),
  usePreventRemove: jest.fn(),
}));
jest.mock('@/features/vehicles/api/vehicles.api', () => ({
  ...jest.requireActual('@/features/vehicles/api/vehicles.api'),
  vehiclesApi: {
    getBrands: jest.fn(async () => [{ id: '2', name: 'MG' }]),
    getModels: jest.fn(async () => [{ id: '21', name: 'ZS EV' }]),
    getCapacities: jest.fn(async () => [{ id: '9', kwh: 50.3, rangeKm: 461 }]),
    addVehicle: jest.fn(async () => undefined),
    getVehicles: jest.fn(),
    updateVehicle: jest.fn(async () => undefined),
    setAutoCharge: jest.fn(async () => undefined),
    setPrimary: jest.fn(async () => undefined),
    deleteVehicle: jest.fn(async () => undefined),
  },
}));

const api = jest.mocked(vehiclesApi);

const NEXON: Vehicle = {
  id: '1',
  regNo: 'KA01AB1234',
  macId: 'AA:BB:CC:DD:EE:FF',
  maxAmountRupees: 500,
  autoCharge: false,
  isPrimary: true,
  capacityId: '3',
  capacityKwh: 40.5,
  rangeKm: 312,
  modelId: '12',
  modelName: 'Nexon EV',
  brandId: '1',
  brandName: 'Tata',
};
const KONA: Vehicle = {
  ...NEXON,
  id: '2',
  regNo: 'TS09XY4321',
  macId: null,
  isPrimary: false,
  capacityId: null,
  capacityKwh: 39.2,
  rangeKm: null,
  modelId: '30',
  modelName: 'Kona',
  brandName: 'Hyundai',
};

beforeEach(() => {
  jest.clearAllMocks();
  api.getVehicles.mockResolvedValue([KONA, NEXON]);
});

describe('My Vehicles', () => {
  it('lists the primary first, with the plate once and battery / range chips', async () => {
    await renderWithApp(<MyVehiclesScreen />);

    expect(await screen.findByText('Tata Nexon EV')).toBeTruthy();
    const titles = screen.getAllByText(/^(Tata Nexon EV|Hyundai Kona)$/).map(n => n.props.children);
    expect(titles).toEqual(['Tata Nexon EV', 'Hyundai Kona']);
    expect(screen.getAllByText('KA01AB1234')).toHaveLength(1);
    expect(screen.getByText('Primary')).toBeTruthy();
    expect(screen.getByText('40.5 kWh')).toBeTruthy();
    expect(screen.getByText('312 km')).toBeTruthy();
    expect(screen.getAllByText('Battery').length).toBeGreaterThan(0);
    expect(screen.getByText('2 vehicles')).toBeTruthy();
  });

  it('auto-charge is off without a MAC ID, and toggles with rollback on failure', async () => {
    await renderWithApp(<MyVehiclesScreen />);
    await screen.findByText('Hyundai Kona');

    expect(screen.getByText('Add a MAC ID to use auto-charge')).toBeTruthy();
    expect(screen.getByLabelText('Auto-charge, Hyundai Kona')).toBeDisabled();

    api.setAutoCharge.mockRejectedValueOnce(new Error('Server said no'));
    await act(async () =>
      fireEvent(screen.getByLabelText('Auto-charge, Tata Nexon EV'), 'valueChange', true),
    );
    expect(api.setAutoCharge).toHaveBeenCalledWith('1', true);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server said no'));
    expect(screen.getByLabelText('Auto-charge, Tata Nexon EV')).toHaveProp('value', false);
  });

  it('Make primary from ⋯ moves the badge at once and rolls back if refused', async () => {
    await renderWithApp(<MyVehiclesScreen />);
    await screen.findByText('Hyundai Kona');

    await fireEvent.press(screen.getByRole('button', { name: 'More actions for Hyundai Kona' }));
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Make primary' })));
    expect(api.setPrimary).toHaveBeenCalledWith('2');
    expect(toast.success).toHaveBeenCalledWith('Hyundai Kona is now your primary vehicle');
    const first = screen.getAllByText(/^(Tata Nexon EV|Hyundai Kona)$/)[0];
    expect(first?.props.children).toBe('Hyundai Kona');

    api.setPrimary.mockRejectedValueOnce(new Error('Nope'));
    await fireEvent.press(screen.getByRole('button', { name: 'More actions for Tata Nexon EV' }));
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Make primary' })));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Nope'));
    expect(screen.getAllByText(/^(Tata Nexon EV|Hyundai Kona)$/)[0]?.props.children).toBe(
      'Hyundai Kona',
    );
  });

  it('Delete warns about the primary vehicle, then removes it', async () => {
    await renderWithApp(<MyVehiclesScreen />);
    await screen.findByText('Tata Nexon EV');

    await fireEvent.press(screen.getByRole('button', { name: 'More actions for Tata Nexon EV' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Delete vehicle' }));
    expect(screen.getByText(/It is your primary vehicle/)).toBeTruthy();

    api.getVehicles.mockResolvedValue([KONA]);
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Remove' })));
    expect(api.deleteVehicle).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith('Vehicle removed');
    await waitFor(() => expect(screen.queryByText('Tata Nexon EV')).toBeNull());
  });

  it('empty and error states', async () => {
    api.getVehicles.mockResolvedValueOnce([]);
    const empty = await renderWithApp(<MyVehiclesScreen />);
    expect(await screen.findByText('No vehicles yet')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Add Vehicle' }));
    expect(router.push).toHaveBeenCalledWith('/(app)/vehicles/add');
    await empty.unmount();

    api.getVehicles.mockRejectedValueOnce(apiError('down', 'network'));
    await renderWithApp(<MyVehiclesScreen />);
    expect(await screen.findByText("Couldn't load vehicles")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByText('Tata Nexon EV')).toBeTruthy();
  });

  it('tapping a card opens Edit for that vehicle', async () => {
    await renderWithApp(<MyVehiclesScreen />);
    await fireEvent.press(await screen.findByLabelText('Hyundai Kona, TS09XY4321'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/vehicles/[vehicleId]/edit',
      params: { vehicleId: '2' },
    });
  });
});

describe('Add Vehicle', () => {
  it('runs the wizard without Skip, adds, then goes back', async () => {
    await renderWithApp(<AddVehicleScreen />);
    expect(screen.queryByRole('button', { name: 'Skip' })).toBeNull();
    expect(screen.getByText('Step 1 of 4')).toBeTruthy();

    await fireEvent.press(await screen.findByRole('radio', { name: 'MG' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    await fireEvent.press(await screen.findByRole('radio', { name: 'ZS EV' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    await fireEvent.press(await screen.findByRole('radio', { name: /50.3 kWh/ }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    await fireEvent.changeText(screen.getByLabelText('Registration Number *'), 'ka05mn7788');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Add Vehicle' })));

    expect(api.addVehicle).toHaveBeenCalledWith(
      expect.objectContaining({ model: { id: '21', name: 'ZS EV' } }),
    );
    expect(router.back).toHaveBeenCalled();
  });
});

describe('Edit Vehicle', () => {
  it('loads by id, keeps Save off until a change, and saves only this vehicle', async () => {
    await renderWithApp(<EditVehicleScreen vehicleId="1" />);
    expect(await screen.findByText('Tata Nexon EV')).toBeTruthy();
    expect(screen.getByText('Battery · 40.5 kWh')).toBeTruthy();
    const save = screen.getByRole('button', { name: 'Save Changes' });
    expect(save).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Max amount per session'), '800');
    await waitFor(() => expect(save).toBeEnabled());
    await act(async () => fireEvent.press(save));

    expect(api.updateVehicle).toHaveBeenCalledWith('1', {
      model: { id: '12', name: 'Nexon EV' },
      capacity: { kind: 'preset', capacity: { id: '3', kwh: 40.5, rangeKm: 312 } },
      details: { regNo: 'KA01AB1234', macId: 'AA:BB:CC:DD:EE:FF', maxAmount: '800' },
    });
    expect(toast.success).toHaveBeenCalledWith('Vehicle updated successfully');
    await waitFor(() => expect(router.back).toHaveBeenCalled());
  });

  it('Change swaps brand, model and battery through the pickers', async () => {
    await renderWithApp(<EditVehicleScreen vehicleId="1" />);
    await act(async () => fireEvent.press(await screen.findByRole('button', { name: 'Change' })));

    await fireEvent.press(await screen.findByRole('radio', { name: 'MG' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    await fireEvent.press(await screen.findByRole('radio', { name: 'ZS EV' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    await fireEvent.press(await screen.findByRole('radio', { name: /50.3 kWh/ }));
    await act(async () =>
      fireEvent.press(screen.getByRole('button', { name: 'Use this vehicle' })),
    );

    expect(await screen.findByText('MG ZS EV')).toBeTruthy();
    expect(screen.getByText('Battery · 50.3 kWh')).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Save Changes' })));
    expect(api.updateVehicle).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        model: { id: '21', name: 'ZS EV' },
        capacity: { kind: 'preset', capacity: { id: '9', kwh: 50.3, rangeKm: 461 } },
      }),
    );
  });

  it('an unknown id says so and offers the list', async () => {
    await renderWithApp(<EditVehicleScreen vehicleId="99" />);
    expect(await screen.findByText("Couldn't find this vehicle")).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Back to My Vehicles' }));
    expect(router.replace).toHaveBeenCalledWith('/(app)/vehicles');
  });
});
