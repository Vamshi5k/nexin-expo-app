import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { LoginScreen } from '@/features/auth';
import { authApi } from '@/features/auth/api/auth.api';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
jest.mock('@/features/auth/api/auth.api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth.api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      requestOtp: jest.fn(async () => undefined),
    },
  };
});

const { requestOtp } = authApi;

describe('LoginScreen', () => {
  it('submits a valid number and opens OTP with it', async () => {
    await renderWithApp(<LoginScreen />);

    await fireEvent.changeText(screen.getByLabelText('Mobile number'), '9876543210');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(requestOtp).toHaveBeenCalledWith('9876543210');
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(auth)/otp',
      params: { type: 'phone', value: '9876543210' },
    });
  });
});
