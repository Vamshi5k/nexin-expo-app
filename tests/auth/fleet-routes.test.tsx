import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { brand } from '@/core/config';
import { sessionStore } from '@/core/session';
import FleetOtpRoute from '@/app/(auth)/(fleet-auth)/fleet-otp';
import { FleetLoginScreen, GuardedStack, LoginScreen, StartRedirect } from '@/features/auth';
import { markOnboardingDone } from '@/features/auth/utils/authFlow';
import {
  clientConfigApi,
  fallbackClientConfig,
} from '@/features/client-config/api/clientConfig.api';
import { fleetApi } from '@/features/fleet/api/fleet.api';

import { AppProviders } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('@/features/client-config/api/clientConfig.api', () => ({
  ...jest.requireActual('@/features/client-config/api/clientConfig.api'),
  clientConfigApi: { getConfig: jest.fn() },
}));
jest.mock('@/features/fleet/api/fleet.api', () => ({
  ...jest.requireActual('@/features/fleet/api/fleet.api'),
  fleetApi: {
    login: jest.fn(async () => 'DR-9'),
    verifyOtp: jest.fn(async () => ({ accessToken: 'fa', refreshToken: 'fr' })),
    resendOtp: jest.fn(async () => undefined),
    getDriver: jest.fn(async () => ({ id: '4', name: 'Ravi' })),
    logout: jest.fn(async () => undefined),
  },
}));

const fleetFlag = (fleet: boolean) =>
  jest.mocked(clientConfigApi.getConfig).mockResolvedValue({
    ...fallbackClientConfig(brand),
    features: { fleet, coupons: false },
  });

async function renderApp(initialUrl: string) {
  markOnboardingDone();
  await renderRouter(
    {
      _layout: () => (
        <AppProviders primeConfig>
          <Slot />
        </AppProviders>
      ),
      index: StartRedirect,
      '(auth)/_layout': () => <GuardedStack group="auth" />,
      '(auth)/login': LoginScreen,
      '(auth)/(fleet-auth)/_layout': () => <GuardedStack group="fleet-auth" />,
      '(auth)/(fleet-auth)/fleet-login': FleetLoginScreen,
      '(auth)/(fleet-auth)/fleet-otp': FleetOtpRoute,
      '(fleet)/_layout': () => <GuardedStack group="fleet" />,
      '(fleet)/fleet/index': () => <Text>Fleet home</Text>,
    },
    { initialUrl },
  );
}

describe('fleet routes', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await sessionStore.getState().signOut();
  });

  it('fleet off: a deep link to fleet login lands on Login, with no Fleet Login link', async () => {
    fleetFlag(false);
    await renderApp('/fleet-login');

    await waitFor(() => expect(screen).toHavePathname('/login'));
    await waitFor(() => expect(clientConfigApi.getConfig).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Fleet Login' })).toBeNull();
  });

  it('fleet on: Login -> Fleet Login -> Fleet OTP -> fleet home', async () => {
    fleetFlag(true);
    await renderApp('/login');

    await fireEvent.press(await screen.findByRole('button', { name: 'Fleet Login' }));
    await waitFor(() => expect(screen).toHavePathname('/fleet-login'));

    await fireEvent.changeText(screen.getByLabelText('Fleet ID'), 'FLT-2024-001');
    await fireEvent.changeText(screen.getByLabelText('Registered Mobile'), '9876543210');
    await fireEvent.press(screen.getByRole('button', { name: 'Access Fleet' }));
    await waitFor(() => expect(screen).toHavePathname('/fleet-otp'));

    await fireEvent.changeText(screen.getByLabelText('Verification code, 4 digits'), '1234');

    await waitFor(() => expect(screen).toHavePathname('/fleet'));
    expect(screen.getByText('Fleet home')).toBeTruthy();
    expect(sessionStore.getState().mode).toBe('fleet');
    await waitFor(() => expect(fleetApi.getDriver).toHaveBeenCalled());
  });
});
