import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { sessionStore } from '@/core/session';
import { GuardedStack, StartRedirect, TempHomeScreen } from '@/features/auth';
import { logout } from '@/features/auth/api';
import { markOnboardingDone } from '@/features/auth/session';

import { AppProviders } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('@/features/auth/api', () => ({
  ...jest.requireActual('@/features/auth/api'),
  getUser: jest.fn(async () => ({ id: '1', firstName: 'Asha', isFirstLogin: false })),
  logout: jest.fn(async () => undefined),
}));

describe('logout', () => {
  it('clears the session and the guard sends the user to Login', async () => {
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
        '(app)/home': TempHomeScreen,
      },
      { initialUrl: '/home' },
    );
    expect(screen).toHavePathname('/home');

    await fireEvent.press(screen.getByText('Log out'));

    expect(sessionStore.getState().mode).toBe('none');
    expect(logout).toHaveBeenCalledWith('a');
    expect(screen).toHavePathname('/login');
    expect(screen.getByText('Login')).toBeTruthy();
  });
});
