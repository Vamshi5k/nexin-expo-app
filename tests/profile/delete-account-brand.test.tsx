import { act, renderHook } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import { Linking } from 'react-native';

import { useDeleteAccount } from '@/features/profile/hooks/useDeleteAccount';

import { AppProviders } from '../helpers/render';

// Each test plays a different white-label client.
const mockBrand: { deleteAccountUrl?: string } = {};

jest.mock('@/core/log');
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(async () => ({})) }));
jest.mock('@/core/config', () => {
  const actual = jest.requireActual('@/core/config');
  return {
    ...actual,
    brand: new Proxy(actual.brand, {
      get: (target, key) =>
        key === 'deleteAccountUrl'
          ? mockBrand.deleteAccountUrl
          : target[key as keyof typeof target],
    }),
  };
});

const openBrowser = jest.mocked(WebBrowser.openBrowserAsync);
const wrapper = ({ children }: { children: ReactNode }) => <AppProviders>{children}</AppProviders>;

const confirmDelete = async () => {
  const { result } = await renderHook(() => useDeleteAccount(), { wrapper });
  await act(async () => result.current.ask());
  await act(async () => result.current.confirm());
  return result;
};

describe('Delete Account per brand', () => {
  beforeEach(() => jest.clearAllMocks());

  it("opens the current brand's own deletion page", async () => {
    mockBrand.deleteAccountUrl = 'https://voltcharge.example/delete-account';
    await confirmDelete();

    expect(openBrowser).toHaveBeenCalledWith('https://voltcharge.example/delete-account');
    expect(JSON.stringify(openBrowser.mock.calls)).not.toContain('cruzeev');
  });

  it('a brand without a page offers support instead, never cruzeev.in', async () => {
    mockBrand.deleteAccountUrl = undefined;
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

    const result = await confirmDelete();

    expect(result.current.confirmLabel).toBe('Contact support');
    const opened = JSON.stringify([...openBrowser.mock.calls, ...openURL.mock.calls]);
    expect(opened).not.toContain('cruzeev');
    openURL.mockRestore();
  });
});
