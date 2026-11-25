import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { sessionStore } from '@/core/session';
import { getUser } from '@/features/auth/api';
import { markOnboardingDone } from '@/features/auth/session';
import type { User } from '@/features/auth/types';

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
jest.mock('@/features/client-config/api', () => ({
  ...jest.requireActual('@/features/client-config/api'),
  getClientConfig: jest.fn(async () => {
    throw new Error('offline');
  }),
}));
jest.mock('@/features/auth/api', () => ({
  ...jest.requireActual('@/features/auth/api'),
  getUser: jest.fn(),
  logout: jest.fn(async () => undefined),
}));

const USER: User = {
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
};

async function settle(rounds = 20) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
  }
}

beforeEach(async () => {
  markOnboardingDone();
  jest.mocked(getUser).mockReset();
  await sessionStore.getState().signOut();
});

it('a restored session whose startup check fails shows Try Again, then Home', async () => {
  jest.mocked(getUser).mockRejectedValueOnce(new Error('network down'));
  await sessionStore.getState().signIn('consumer', { accessToken: 'a', refreshToken: 'r' });

  await renderRouter('./src/app', { initialUrl: '/' });
  await settle();
  expect(screen.getByText("Can't connect right now")).toBeTruthy();

  jest.mocked(getUser).mockResolvedValue(USER);
  await fireEvent.press(screen.getByText('Try Again'));
  await settle();
  expect(screen.getByText('Signed in as')).toBeTruthy();
}, 30000);

it('a user load that fails right after sign-in shows Try Again, then Home', async () => {
  await renderRouter('./src/app', { initialUrl: '/' });
  await settle();
  expect(screen).toHavePathname('/login');

  jest.mocked(getUser).mockRejectedValueOnce(new Error('network down'));
  await act(() =>
    sessionStore.getState().signIn('consumer', { accessToken: 'a', refreshToken: 'r' }),
  );
  await settle();
  expect(screen.getByText("Can't connect right now")).toBeTruthy();

  jest.mocked(getUser).mockResolvedValue(USER);
  await fireEvent.press(screen.getByText('Try Again'));
  await settle();
  expect(screen.getByText('Signed in as')).toBeTruthy();
}, 30000);
