import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { sessionStore } from '@/core/session';
import { GuardedStack, StartRedirect } from '@/features/auth';
import { HomeScreen } from '@/features/home';
import { logout } from '@/features/auth/api';
import { markOnboardingDone } from '@/features/auth/session';

import { AppProviders } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('@/features/auth/api', () => ({
  ...jest.requireActual('@/features/auth/api'),
  getUser: jest.fn(async () => ({ id: '1', firstName: 'Asha', isFirstLogin: false })),
  logout: jest.fn(async () => undefined),
}));

async function renderSignedInHome() {
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
      '(app)/home': HomeScreen,
    },
    { initialUrl: '/home' },
  );
  expect(screen).toHavePathname('/home');
}

describe('logout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('asks first; Cancel keeps the user signed in', async () => {
    await renderSignedInHome();
    await fireEvent.press(screen.getByText('Log out'));
    expect(screen.getByText('Are you sure you want to log out of your account?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(sessionStore.getState().mode).toBe('consumer');
    expect(logout).not.toHaveBeenCalled();
    expect(screen).toHavePathname('/home');
  });

  it('Yes clears the session after the dialog closes and the guard shows Login', async () => {
    await renderSignedInHome();
    await fireEvent.press(screen.getByText('Log out'));
    await fireEvent.press(screen.getByRole('button', { name: 'Yes, log out' }));

    await waitFor(() => expect(sessionStore.getState().mode).toBe('none'));
    expect(logout).toHaveBeenCalledWith('a');
    await waitFor(() => expect(screen).toHavePathname('/login'));
    expect(screen.getByText('Login')).toBeTruthy();
  });
});
