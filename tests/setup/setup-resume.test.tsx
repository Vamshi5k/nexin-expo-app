import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { checkPermission, type PermissionResult } from '@/core/permissions';
import { sessionStore } from '@/core/session';
import { KV_KEYS, kv } from '@/core/storage';
import { GuardedStack, StartRedirect } from '@/features/auth';
import { authApi } from '@/features/auth/api/auth.api';
import type { User } from '@/features/auth/types/auth.types';
import { markOnboardingDone, saveSetupStep, setupStepFor } from '@/features/auth/utils/authFlow';
import { PermissionsScreen, ProfileSetupScreen, VehicleSetupScreen } from '@/features/setup';
import { vehiclesApi } from '@/features/vehicles/api/vehicles.api';

import { AppProviders } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('@/core/permissions', () => ({
  ...jest.requireActual('@/core/permissions'),
  checkPermission: jest.fn(),
  requestPermission: jest.fn(),
}));
jest.mock('@/features/auth/api/auth.api', () => ({
  ...jest.requireActual('@/features/auth/api/auth.api'),
  authApi: {
    ...jest.requireActual('@/features/auth/api/auth.api').authApi,
    getUser: jest.fn(),
    registerPushToken: jest.fn(async () => undefined),
  },
}));
jest.mock('@/features/setup/api/setup.api', () => ({
  setupApi: { updateProfile: jest.fn(async () => undefined) },
}));
jest.mock('@/features/vehicles/api/vehicles.api', () => ({
  ...jest.requireActual('@/features/vehicles/api/vehicles.api'),
  vehiclesApi: {
    getBrands: jest.fn(async () => [{ id: '2', name: 'MG' }]),
    getModels: jest.fn(async () => [{ id: '12', name: 'Windsor EV' }]),
    getCapacities: jest.fn(async () => [{ id: '3', kwh: 40, rangeKm: null }]),
    addVehicle: jest.fn(async () => undefined),
  },
}));

const USER = { id: 'u1', firstName: '', lastName: '', isFirstLogin: true } as User;

const permissions = (location: PermissionResult, notifications: PermissionResult) =>
  jest
    .mocked(checkPermission)
    .mockImplementation(async kind => (kind === 'location' ? location : notifications));

let app: Awaited<ReturnType<typeof renderRouter>> | undefined;

// A cold start: a fresh tree over the same device storage and stored session.
async function launch(initialUrl = '/') {
  await app?.unmount();
  app = await renderRouter(
    {
      _layout: () => (
        <AppProviders>
          <Slot />
        </AppProviders>
      ),
      index: StartRedirect,
      '(auth)/_layout': () => <GuardedStack group="auth" />,
      '(auth)/login': () => <Text>Login</Text>,
      '(setup)/_layout': () => <GuardedStack group="setup" />,
      '(setup)/profile': ProfileSetupScreen,
      '(setup)/vehicle': VehicleSetupScreen,
      '(setup)/permissions': PermissionsScreen,
      '(app)/_layout': () => <GuardedStack group="app" />,
      '(app)/(tabs)/home': () => <Text>Home</Text>,
    },
    { initialUrl },
  );
}

const opensOn = (path: string) => waitFor(() => expect(screen).toHavePathname(path));

async function addVehicle() {
  await fireEvent.press(await screen.findByRole('radio', { name: 'MG' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  await fireEvent.press(await screen.findByRole('radio', { name: 'Windsor EV' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  await fireEvent.press(await screen.findByRole('radio', { name: '40 kWh' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  await fireEvent.changeText(screen.getByLabelText('Registration Number *'), 'TS09AB1234');
  await fireEvent.press(screen.getByRole('button', { name: 'Add Vehicle' }));
}

describe('setup resume', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    kv.remove(KV_KEYS.setupProgress);
    kv.remove(KV_KEYS.setupDoneFor);
    markOnboardingDone();
    jest.mocked(authApi.getUser).mockResolvedValue(USER);
    permissions('denied', 'denied');
    await sessionStore.getState().signIn('consumer', { accessToken: 'a', refreshToken: 'r' });
  });

  afterEach(async () => {
    await app?.unmount();
    app = undefined;
  });

  it('1. new user closed on Profile (not saved) reopens on Profile', async () => {
    await launch();
    await opensOn('/profile');

    await launch();
    await opensOn('/profile');
  });

  it('2. Profile saved -> Vehicle; closed on Vehicle reopens on Vehicle', async () => {
    await launch();
    await opensOn('/profile');
    await fireEvent.changeText(screen.getByLabelText('Full Name'), 'Asha Rao');
    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'I accept the Terms & Conditions and Privacy Policy' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    await opensOn('/vehicle');

    await launch();
    await opensOn('/vehicle');
  });

  it('3a. vehicle added, restart -> Permissions, and no second addVehicle', async () => {
    saveSetupStep(USER.id, 'vehicle');
    await launch();
    await opensOn('/vehicle');
    await addVehicle();
    await opensOn('/permissions');
    expect(vehiclesApi.addVehicle).toHaveBeenCalledTimes(1);

    await launch();
    await opensOn('/permissions');

    // Even a deep link back to Vehicle lands on Permissions.
    await launch('/vehicle');
    await opensOn('/permissions');
    expect(vehiclesApi.addVehicle).toHaveBeenCalledTimes(1);
  });

  it('3b. Skip, restart -> Permissions', async () => {
    saveSetupStep(USER.id, 'vehicle');
    await launch();
    await opensOn('/vehicle');
    await fireEvent.press(screen.getByRole('button', { name: 'Skip' }));
    await opensOn('/permissions');

    await launch();
    await opensOn('/permissions');
    expect(vehiclesApi.addVehicle).not.toHaveBeenCalled();
  });

  it('4a. closed on Permissions with both permissions on -> setup done, straight to Home', async () => {
    saveSetupStep(USER.id, 'permissions');
    permissions('granted', 'granted');
    await launch();

    await opensOn('/home');
    expect(setupStepFor(USER)).toBe('done');
  });

  it('4b. closed on Permissions with one permission off -> Permissions again', async () => {
    saveSetupStep(USER.id, 'permissions');
    permissions('granted', 'denied');
    await launch();

    await opensOn('/permissions');
    expect(setupStepFor(USER)).toBe('permissions');
  });

  it('5. Continue with permissions off -> Home, and setup never shows again', async () => {
    saveSetupStep(USER.id, 'permissions');
    await launch();
    await opensOn('/permissions');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    await opensOn('/home');

    await launch();
    await opensOn('/home');
    await launch('/profile');
    await opensOn('/home');
  });

  it('(app) sends a user with setup unfinished back to their step', async () => {
    await launch('/home');
    await opensOn('/profile');
    expect(screen.queryByText('Home')).toBeNull();
  });

  it('two users on one phone keep their own progress', async () => {
    saveSetupStep('someone-else', 'done');
    await launch();
    await opensOn('/profile');
  });
});
