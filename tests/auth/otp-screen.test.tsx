import { fireEvent, screen } from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';

import { sessionStore } from '@/core/session';
import { OtpScreen } from '@/features/auth';
import { verifyOtp } from '@/features/auth/api';
import { toast } from '@/ui/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
jest.mock('@/features/auth/api', () => ({
  ...jest.requireActual('@/features/auth/api'),
  verifyOtp: jest.fn(),
}));

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
