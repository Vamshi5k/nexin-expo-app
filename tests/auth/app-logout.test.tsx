import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { sessionStore } from '@/core/session';
import { authApi } from '@/features/auth/api/auth.api';
import { markOnboardingDone } from '@/features/auth/utils/authFlow';

// The real src/app tree: guards, groups and the root "/" StartRedirect together.
const mockSecureMap = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: async (k: string) => mockSecureMap.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => void mockSecureMap.set(k, v),
  deleteItemAsync: async (k: string) => void mockSecureMap.delete(k),
}));
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: () => () => undefined,
    fetch: async () => ({ isConnected: true }),
    refresh: async () => ({ isConnected: true }),
  },
  useNetInfo: () => ({ isConnected: true }),
}));
jest.mock('@/core/log');
jest.mock('@/shared/theme/fonts', () => ({ useBrandFonts: () => ({ loaded: true, error: null }) }));
jest.mock('@/features/client-config/api/clientConfig.api', () => {
  const actual = jest.requireActual('@/features/client-config/api/clientConfig.api');
  return {
    ...actual,
    clientConfigApi: {
      ...actual.clientConfigApi,
      getConfig: jest.fn(async () => {
        throw new Error('offline');
      }),
    },
  };
});
jest.mock('@/features/stations/api/stations.api', () => ({
  ...jest.requireActual('@/features/stations/api/stations.api'),
  stationsApi: { getLocations: jest.fn(async () => []), getNearby: jest.fn(async () => []) },
}));
jest.mock('@/features/auth/api/auth.api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth.api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      getUser: jest.fn(),
      logout: jest.fn(async () => undefined),
    },
  };
});

const { getUser, logout } = authApi;

async function settle(rounds = 20) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
  }
}

it('a signed-in user logs out from Profile and lands on Login (no redirect loop)', async () => {
  const errors: string[] = [];
  const spy = jest.spyOn(console, 'error').mockImplementation((...a) => {
    errors.push(a.map(String).join(' '));
  });
  markOnboardingDone();
  jest.mocked(getUser).mockResolvedValue({
    id: '7',
    userId: null,
    firstName: 'Asha',
    lastName: '',
    email: null,
    phone: '9876543210',
    isFirstLogin: false,
    walletBalancePaise: 0,
    isEmailVerified: false,
    isPhoneVerified: true,
    gst: null,
  });
  await sessionStore.getState().signIn('consumer', { accessToken: 'a', refreshToken: 'r' });

  await renderRouter('./src/app', { initialUrl: '/' });
  await settle();
  expect(screen).toHavePathname('/home');
  expect(screen.getByTestId('station-map')).toBeTruthy();

  await fireEvent.press(screen.getByRole('tab', { name: 'Profile' }));
  await settle();
  await fireEvent.press(screen.getByText('Log out'));
  await fireEvent.press(screen.getByRole('button', { name: 'Yes, log out' }));
  await settle();

  expect(errors.filter(e => e.includes('Maximum update depth'))).toEqual([]);
  expect(sessionStore.getState().mode).toBe('none');
  expect(logout).toHaveBeenCalledWith('a');
  expect(screen).toHavePathname('/login');
  spy.mockRestore();
}, 30000);
