import { router, Slot } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { sessionStore } from '@/core/session';
import { GuardedStack, StartRedirect } from '@/features/auth';
import { ProfileScreen } from '@/features/profile';
import { authApi } from '@/features/auth/api/auth.api';
import { markOnboardingDone } from '@/features/auth/utils/authFlow';

import { AppProviders } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('@/features/auth/api/auth.api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth.api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      getUser: jest.fn(async () => ({ id: '1', firstName: 'Asha', isFirstLogin: false })),
      logout: jest.fn(async () => undefined),
    },
  };
});

const { logout } = authApi;

async function renderSignedInProfile() {
  markOnboardingDone();
  await sessionStore.getState().signIn('consumer', { accessToken: 'a', refreshToken: 'r' });
  await renderRouter(
    {
      _layout: () => (
        <AppProviders>
          <Slot />
        </AppProviders>
      ),
      index: StartRedirect,
      '(auth)/_layout': () => <GuardedStack group="auth" />,
      '(auth)/login': () => <Text>Login</Text>,
      '(app)/_layout': () => <GuardedStack group="app" />,
      '(app)/(tabs)/home': () => <Text>Map</Text>,
      '(app)/(tabs)/profile': ProfileScreen,
    },
    { initialUrl: '/home' },
  );
  // (app) waits for the user via "/" (boot loads it first in the app), then opens the map.
  await waitFor(() => expect(screen).toHavePathname('/home'));
  await act(async () => router.push('/profile'));
  await waitFor(() => expect(screen).toHavePathname('/profile'));
}

describe('logout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('asks first; Cancel keeps the user signed in', async () => {
    await renderSignedInProfile();
    await fireEvent.press(screen.getByText('Log out'));
    expect(screen.getByText('Are you sure you want to log out of your account?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(sessionStore.getState().mode).toBe('consumer');
    expect(logout).not.toHaveBeenCalled();
    expect(screen).toHavePathname('/profile');
  });

  it('Yes clears the session after the dialog closes and the guard shows Login', async () => {
    await renderSignedInProfile();
    await fireEvent.press(screen.getByText('Log out'));
    await fireEvent.press(screen.getByRole('button', { name: 'Yes, log out' }));

    await waitFor(() => expect(sessionStore.getState().mode).toBe('none'));
    expect(logout).toHaveBeenCalledWith('a');
    await waitFor(() => expect(screen).toHavePathname('/login'));
    expect(screen.getByText('Login')).toBeTruthy();
  });
});
