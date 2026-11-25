import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { brand } from '@/core/config';
import { LoginScreen } from '@/features/auth';
import {
  clientConfigApi,
  fallbackClientConfig,
} from '@/features/client-config/api/clientConfig.api';
import type { ClientConfig } from '@/features/client-config';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/features/client-config/api/clientConfig.api', () => ({
  ...jest.requireActual('@/features/client-config/api/clientConfig.api'),
  clientConfigApi: { getConfig: jest.fn() },
}));

const withConfig = (patch: Partial<ClientConfig>) =>
  jest.mocked(clientConfigApi.getConfig).mockResolvedValue({
    ...fallbackClientConfig(brand),
    ...patch,
  });

describe('Login links from /client/info', () => {
  beforeEach(() => jest.clearAllMocks());

  it('phone login + fleet on: shows "Use email instead" and "Fleet Login"', async () => {
    withConfig({ loginType: 'phone', features: { fleet: true, coupons: false } });
    await renderWithApp(<LoginScreen />, { primeConfig: true });

    expect(await screen.findByRole('button', { name: 'Fleet Login' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Use email instead' })).toBeTruthy();
    expect(screen.getByLabelText('Mobile number')).toBeTruthy();
  });

  it('"Fleet Login" opens the fleet login route', async () => {
    withConfig({ features: { fleet: true, coupons: false } });
    await renderWithApp(<LoginScreen />, { primeConfig: true });

    await fireEvent.press(await screen.findByRole('button', { name: 'Fleet Login' }));
    expect(router.push).toHaveBeenCalledWith('/(auth)/(fleet-auth)/fleet-login');
  });

  it('fleet off: no "Fleet Login" link', async () => {
    withConfig({ loginType: 'phone', features: { fleet: false, coupons: false } });
    await renderWithApp(<LoginScreen />, { primeConfig: true });

    expect(await screen.findByRole('button', { name: 'Use email instead' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Fleet Login' })).toBeNull();
  });

  it('email login: email field only, no switch link; fleet link can still show', async () => {
    withConfig({ loginType: 'email', features: { fleet: true, coupons: false } });
    await renderWithApp(<LoginScreen />, { primeConfig: true });

    expect(await screen.findByLabelText('Email')).toBeTruthy();
    expect(screen.queryByLabelText('Mobile number')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Use email instead' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Use phone instead' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Fleet Login' })).toBeTruthy();
  });
});
