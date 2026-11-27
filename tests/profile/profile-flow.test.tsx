import { router, Slot } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import * as WebBrowser from 'expo-web-browser';
import { Text } from 'react-native';

import { apiError } from '@/core/api';
import { brand } from '@/core/config';
import { sessionStore } from '@/core/session';
import { GuardedStack, StartRedirect } from '@/features/auth';
import { authApi } from '@/features/auth/api/auth.api';
import { markOnboardingDone } from '@/features/auth/utils/authFlow';
import {
  COMING_SOON_COPY,
  ComingSoonScreen,
  EditProfileScreen,
  ProfileScreen,
} from '@/features/profile';
import { profileApi } from '@/features/profile/api/profile.api';
import type { ProfileStats } from '@/features/profile/types/profile.types';
import { toast } from '@/shared/utils/toast';

import { AppProviders } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(async () => ({})) }));
jest.mock('@/features/auth/api/auth.api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth.api');
  return { ...actual, authApi: { ...actual.authApi, getUser: jest.fn() } };
});
jest.mock('@/features/profile/api/profile.api', () => ({
  ...jest.requireActual('@/features/profile/api/profile.api'),
  profileApi: {
    getStats: jest.fn(),
    update: jest.fn(),
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));

const getUser = jest.mocked(authApi.getUser);
const getStats = jest.mocked(profileApi.getStats);
const update = jest.mocked(profileApi.update);
const sendOtp = jest.mocked(profileApi.sendOtp);
const verifyOtp = jest.mocked(profileApi.verifyOtp);
const openBrowser = jest.mocked(WebBrowser.openBrowserAsync);

const USER = {
  id: '1',
  userId: 'CRZ1042',
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

const STATS: ProfileStats = { vehicles: 2, sessions: 1, favourites: 0 };

async function renderProfile() {
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
      '(app)/_layout': () => <GuardedStack group="app" />,
      '(app)/(tabs)/home': () => <Text>Map</Text>,
      '(app)/(tabs)/profile': ProfileScreen,
      '(app)/profile/edit': EditProfileScreen,
      '(app)/notifications': () => <ComingSoonScreen title={COMING_SOON_COPY.notifications} />,
      '(app)/vehicles/index': () => <ComingSoonScreen title={COMING_SOON_COPY.vehicles} />,
    },
    { initialUrl: '/home' },
  );
  await waitFor(() => expect(screen).toHavePathname('/home'));
  await act(async () => router.push('/profile'));
  await waitFor(() => expect(screen).toHavePathname('/profile'));
}

beforeEach(() => {
  jest.clearAllMocks();
  getUser.mockResolvedValue(USER);
  getStats.mockResolvedValue(STATS);
  update.mockResolvedValue(undefined);
  sendOtp.mockResolvedValue(undefined);
  verifyOtp.mockResolvedValue(undefined);
});

describe('Profile tab', () => {
  it('shows the account, friendly counts and the version line', async () => {
    await renderProfile();

    expect(await screen.findByText('2 vehicles')).toBeTruthy();
    expect(screen.getByText('1 session')).toBeTruthy();
    expect(screen.getByText('No favourites yet')).toBeTruthy();
    expect(screen.getAllByText('Asha').length).toBeGreaterThan(0);
    expect(screen.getByText('ID CRZ1042')).toBeTruthy();
    expect(screen.getByText('No email provided')).toBeTruthy();
    expect(screen.getByText(/^Cruze EV v/)).toBeTruthy();
    expect(screen.queryByText(/undefined|null|NaN/)).toBeNull();
  });

  it('while counts load, no count text (and never "undefined") is shown', async () => {
    getStats.mockReturnValue(new Promise(() => undefined));
    await renderProfile();

    expect(screen.getByText('My Vehicles')).toBeTruthy();
    expect(screen.queryByText(/vehicle(s)? *$|No vehicles yet/)).toBeNull();
    expect(screen.queryByText(/undefined/)).toBeNull();
  });

  it('a failed load explains it, and Retry brings the counts', async () => {
    getStats.mockRejectedValueOnce(new Error('down'));
    await renderProfile();

    expect(await screen.findByText("Couldn't load your account details")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByText('2 vehicles')).toBeTruthy();
    expect(screen.queryByText("Couldn't load your account details")).toBeNull();
  });

  it('rows and the bell open their screens', async () => {
    await renderProfile();

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Notifications' })));
    await waitFor(() => expect(screen).toHavePathname('/notifications'));
    expect(screen.getByText('Coming soon')).toBeTruthy();
  });

  it("Delete Account confirms, then opens this brand's own page", async () => {
    await renderProfile();

    await fireEvent.press(screen.getByText('Delete Account'));
    expect(screen.getByText('Delete your account?')).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Continue' })));

    expect(openBrowser).toHaveBeenCalledWith(brand.deleteAccountUrl);
  });
});

describe('Edit Profile', () => {
  const openEdit = async () => {
    await renderProfile();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Edit profile' })));
    await waitFor(() => expect(screen).toHavePathname('/profile/edit'));
  };

  it('edit → verify the new phone with OTP → save → Profile shows the new name', async () => {
    await openEdit();
    const save = screen.getByRole('button', { name: 'Save Changes' });
    expect(save).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Last name (optional)'), 'Rao');
    await fireEvent.changeText(screen.getByLabelText('Phone'), '9123456789');
    expect(screen.getByText('Verify your new phone number to save')).toBeTruthy();
    expect(save).toBeDisabled();

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Verify Phone' })));
    expect(sendOtp).toHaveBeenCalledWith('9123456789');
    expect(await screen.findByText('Verify phone')).toBeTruthy();

    await act(async () =>
      fireEvent.changeText(screen.getByLabelText('Verification code, 4 digits'), '1234'),
    );
    expect(verifyOtp).toHaveBeenCalledWith('9123456789', '1234');
    await waitFor(() => expect(save).toBeEnabled());

    getUser.mockResolvedValue({ ...USER, lastName: 'Rao', phone: '9123456789' });
    await act(async () => fireEvent.press(save));

    expect(update).toHaveBeenCalledWith({ last_name: 'Rao', phone: '9123456789' });
    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
    await waitFor(() => expect(screen).toHavePathname('/profile'));
    expect(screen.getByText('Asha Rao')).toBeTruthy();
  });

  it('an account that signed up by email can save without adding a phone', async () => {
    getUser.mockResolvedValue({ ...USER, phone: null, email: 'asha@example.com' });
    await openEdit();

    expect(screen.getByLabelText('Phone (optional)')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('First name'), 'Asha R');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Save Changes' })));

    expect(update).toHaveBeenCalledWith({ first_name: 'Asha R' });
    expect(sendOtp).not.toHaveBeenCalled();
  });

  it('a wrong code says so and keeps Save off', async () => {
    verifyOtp.mockRejectedValueOnce(apiError('Invalid OTP', 'http', 400));
    await openEdit();

    await fireEvent.changeText(screen.getByLabelText('Phone'), '9123456789');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Verify Phone' })));
    await act(async () =>
      fireEvent.changeText(screen.getByLabelText('Verification code, 4 digits'), '0000'),
    );

    expect(await screen.findByText('Wrong or expired code. Try again or resend.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('shows a server error under its field', async () => {
    update.mockRejectedValueOnce(
      apiError('Email already in use', 'http', 409, {
        message: 'Email already in use',
      }),
    );
    await openEdit();

    await fireEvent.changeText(screen.getByLabelText('Email (optional)'), 'taken@example.com');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Save Changes' })));

    expect(await screen.findByText('Email already in use')).toBeTruthy();
    expect(screen).toHavePathname('/profile/edit');
  });

  it('a GSTIN is checked on blur and saved in capitals', async () => {
    await openEdit();
    const gst = screen.getByLabelText('GSTIN (optional)');

    await fireEvent.changeText(gst, '22aaaaa0000a1z');
    await act(async () => fireEvent(gst, 'blur'));
    expect(await screen.findByText('Enter a valid 15-character GSTIN')).toBeTruthy();

    await fireEvent.changeText(gst, '22aaaaa0000a1z5');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Save Changes' })));
    expect(update).toHaveBeenCalledWith({ gst: '22AAAAA0000A1Z5' });
  });

  it('going back with edits asks first; Discard leaves', async () => {
    await openEdit();

    await fireEvent.changeText(screen.getByLabelText('First name'), 'Ash');
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Back' })));
    expect(screen.getByText('Discard changes?')).toBeTruthy();
    expect(screen).toHavePathname('/profile/edit');

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Discard' })));
    await waitFor(() => expect(screen).toHavePathname('/profile'));
    expect(update).not.toHaveBeenCalled();
  });
});
