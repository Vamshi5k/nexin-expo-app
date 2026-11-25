import { fireEvent, screen } from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';

import { sessionStore } from '@/core/session';
import { OtpScreen } from '@/features/auth';
import { authApi } from '@/features/auth/api/auth.api';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/features/auth/api/auth.api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth.api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      verifyOtp: jest.fn(),
    },
  };
});

const { verifyOtp } = authApi;

function unauthorized() {
  const headers = new AxiosHeaders();
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', { headers }, undefined, {
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config: { headers },
    data: {},
  });
}

describe('OtpScreen', () => {
  it('a wrong code shows the error, clears the boxes and keeps the user signed out', async () => {
    jest.mocked(verifyOtp).mockRejectedValue(unauthorized());
    await renderWithApp(<OtpScreen type="phone" value="9876543210" />);

    const input = screen.getByLabelText('Verification code, 4 digits');
    await fireEvent.changeText(input, '1234');

    expect(verifyOtp).toHaveBeenCalledWith('1234');
    expect(toast.error).toHaveBeenCalledWith('Invalid OTP. Please try again.');
    expect(input.props.value).toBe('');
    expect(sessionStore.getState().mode).toBe('none');
  });
});
