import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Appearance, Linking } from 'react-native';

import { checkPermission, requestPermission } from '@/core/permissions';
import { KV_KEYS, kv } from '@/core/storage';
import { ProfileScreen } from '@/features/profile';
import { profileApi } from '@/features/profile/api/profile.api';
import { syncPushToken } from '@/features/setup/utils/push';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/core/permissions', () => ({
  ...jest.requireActual('@/core/permissions'),
  checkPermission: jest.fn(),
  requestPermission: jest.fn(),
}));
jest.mock('@/features/setup/utils/push', () => ({ syncPushToken: jest.fn(async () => undefined) }));
jest.mock('@/features/profile/api/profile.api', () => ({
  ...jest.requireActual('@/features/profile/api/profile.api'),
  profileApi: { getStats: jest.fn() },
}));

const check = jest.mocked(checkPermission);
const request = jest.mocked(requestPermission);

beforeEach(() => {
  jest.clearAllMocks();
  kv.remove(KV_KEYS.appearance);
  jest.mocked(profileApi.getStats).mockResolvedValue({ vehicles: 0, sessions: 0, favourites: 0 });
});

describe('Settings & preferences', () => {
  it('Appearance: the choice is saved and handed to the native side', async () => {
    check.mockResolvedValue('granted');
    const setScheme = jest.spyOn(Appearance, 'setColorScheme');
    await renderWithApp(<ProfileScreen />);

    expect(screen.getByText('Settings & preferences')).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('tab', { name: 'Dark' })));

    expect(kv.getString(KV_KEYS.appearance)).toBe('dark');
    expect(setScheme).toHaveBeenLastCalledWith('dark');
    expect(screen.getByText('Always dark')).toBeTruthy();

    await act(async () => fireEvent.press(screen.getByRole('tab', { name: 'System' })));
    expect(kv.getString(KV_KEYS.appearance)).toBe('system');
    expect(setScheme).toHaveBeenLastCalledWith('unspecified');
    setScheme.mockRestore();
  });

  it('Notifications off: the switch asks, then registers the push token', async () => {
    check.mockResolvedValue('denied');
    request.mockResolvedValue('granted');
    await renderWithApp(<ProfileScreen />);

    const toggle = await screen.findByRole('switch', { name: 'Notifications' });
    await waitFor(() => expect(screen.getByText('Off · tap to turn on')).toBeTruthy());
    expect(toggle).toHaveProp('value', false);

    await act(async () => fireEvent(toggle, 'valueChange', true));
    expect(request).toHaveBeenCalledWith('notifications');
    expect(syncPushToken).toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'Notifications' })).toHaveProp('value', true);
  });

  it('Notifications on (or blocked): the switch opens the phone settings', async () => {
    check.mockResolvedValue('granted');
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    await renderWithApp(<ProfileScreen />);

    await waitFor(() => expect(screen.getByText('On · charging and wallet updates')).toBeTruthy());
    await act(async () =>
      fireEvent(screen.getByRole('switch', { name: 'Notifications' }), 'valueChange', false),
    );
    expect(openSettings).toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
    openSettings.mockRestore();
  });
});
