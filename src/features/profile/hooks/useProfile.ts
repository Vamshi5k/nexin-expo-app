import { useCallback, useRef, useState } from 'react';

import { router, useFocusEffect } from 'expo-router';

import { formatContact, openLegal, useAuth, useLogoutConfirm } from '@/features/auth';
import { useClientConfig } from '@/features/client-config';
import { isDevToolsEnabled } from '@/features/dev';

import { useAppearance } from '@/shared/theme';

import { APP_ENV, brand } from '@/core/config';
import { useRequest } from '@/core/request';

import { useDeleteAccount } from './useDeleteAccount';
import { useNotificationSetting } from './useNotificationSetting';
import { profileApi } from '../api/profile.api';
import { PROFILE_COPY, PROFILE_HREF } from '../constants/profile.constants';
import { initialsOf } from '../utils/form';
import { countLabel } from '../utils/profile';
import { readAppVersion } from '../utils/version';

// Identity comes from the signed-in user; the counts come from GET /profile. Coming back to
// the tab refreshes the counts quietly behind what is already on screen.
export const useProfile = () => {
  const config = useClientConfig();
  const { user } = useAuth();
  const logout = useLogoutConfirm();
  const deletion = useDeleteAccount();
  const { appearance, setAppearance } = useAppearance();
  const notifications = useNotificationSetting();
  const stats = useRequest(profileApi.getStats);
  const [refreshing, setRefreshing] = useState(false);
  const [appVersion] = useState(readAppVersion);
  const firstFocus = useRef(true);
  const { refetch } = stats;

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void refetch();
    }, [refetch]),
  );

  const refresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ');
  const counts = stats.data ?? null;
  const supportUrl = config.links.support;

  return {
    name: name || PROFILE_COPY.newUser,
    initials: initialsOf(firstName, lastName),
    userId: user?.userId ?? null,
    email: user?.email ?? null,
    phone: user?.phone ? formatContact('phone', user.phone, brand.phoneCountryCode) : null,
    countsLoading: !counts && stats.loading,
    countsFailed: !counts && !stats.loading && !!stats.error,
    vehicles: countLabel('vehicles', counts?.vehicles ?? null),
    sessions: countLabel('sessions', counts?.sessions ?? null),
    favourites: countLabel('favourites', counts?.favourites ?? null),
    refreshing,
    refresh: () => void refresh(),
    retry: () => void refetch(),
    hasSupport: !!supportUrl,
    openSupport: () => void openLegal(supportUrl),
    openEdit: () => router.push(PROFILE_HREF.edit),
    openVehicles: () => router.push(PROFILE_HREF.vehicles),
    openHistory: () => router.push(PROFILE_HREF.history),
    openFavourites: () => router.push(PROFILE_HREF.favourites),
    openNotifications: () => router.push(PROFILE_HREF.notifications),
    versionLabel: PROFILE_COPY.version(config.brandName, appVersion.version, appVersion.build),
    showDevTools: isDevToolsEnabled(APP_ENV),
    openUiKit: () => router.push('/dev/ui'),
    openCookieCheck: () => router.push('/dev/cookie-check'),
    appearance,
    setAppearance,
    notifications,
    logout,
    deletion,
  };
};
