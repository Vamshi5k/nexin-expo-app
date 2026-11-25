import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { sessionStore } from '@/core/session';
import { FleetLoginScreen, FleetOtpScreen } from '@/features/auth';
import { fleetApi } from '@/features/fleet/api/fleet.api';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/features/fleet/api/fleet.api', () => ({
  ...jest.requireActual('@/features/fleet/api/fleet.api'),
  fleetApi: {
    login: jest.fn(async () => 'DR-9'),
    verifyOtp: jest.fn(async () => ({ accessToken: 'fa', refreshToken: 'fr' })),
    resendOtp: jest.fn(async () => undefined),
    getDriver: jest.fn(),
    logout: jest.fn(async () => undefined),
  },
}));

describe('FleetLoginScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps Access Fleet disabled and shows the old error for a bad Fleet ID', async () => {
    await renderWithApp(<FleetLoginScreen />);
    const fleetId = screen.getByLabelText('Fleet ID');

    await fireEvent.changeText(fleetId, 'FL');
    await fireEvent(fleetId, 'blur');
    await fireEvent.changeText(screen.getByLabelText('Registered Mobile'), '9876543210');

    expect(screen.getByText('Fleet ID must be at least 4 characters')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Access Fleet' })).toBeDisabled();
  });

  it('sends Fleet ID + mobile, then opens Fleet OTP with the driver id', async () => {
    await renderWithApp(<FleetLoginScreen />);

    await fireEvent.changeText(screen.getByLabelText('Fleet ID'), 'FLT-2024-001');
    await fireEvent.changeText(screen.getByLabelText('Registered Mobile'), '9876543210');
    await fireEvent.press(screen.getByRole('button', { name: 'Access Fleet' }));

    expect(fleetApi.login).toHaveBeenCalledWith('FLT-2024-001', '9876543210');
    expect(toast.success).toHaveBeenCalledWith('Verification code sent successfully');
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(auth)/(fleet-auth)/fleet-otp',
      params: { fleetId: 'FLT-2024-001', contact: '9876543210', driverId: 'DR-9' },
    });
  });
});

describe('FleetOtpScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await sessionStore.getState().signOut();
  });

  it('a 4-digit code verifies and stores the tokens as a fleet session', async () => {
    await renderWithApp(<FleetOtpScreen fleetId="FLT-1" contact="9876543210" driverId="DR-9" />);
    expect(screen.getByText('Fleet ID: FLT-1')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Verification code, 4 digits'), '1234');

    expect(fleetApi.verifyOtp).toHaveBeenCalledWith('1234');
    expect(sessionStore.getState().mode).toBe('fleet');
    expect(sessionStore.getState().tokens).toEqual({ accessToken: 'fa', refreshToken: 'fr' });
  });

  it('Resend unlocks after 30 s and sends the driver id', async () => {
    jest.useFakeTimers();
    try {
      await renderWithApp(<FleetOtpScreen fleetId={null} contact="9876543210" driverId="DR-9" />);
      expect(screen.getByText('Resend in 30s')).toBeTruthy();

      await act(async () => {
        jest.advanceTimersByTime(30_000);
      });
      await fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));

      expect(fleetApi.resendOtp).toHaveBeenCalledWith('DR-9');
      expect(toast.success).toHaveBeenCalledWith('New OTP sent successfully');
      expect(screen.getByText('Resend in 30s')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});
