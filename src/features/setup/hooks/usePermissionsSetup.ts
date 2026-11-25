import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { authApi, saveSetupStep, useAuth } from '@/features/auth';

import { log } from '@/core/log';
import { checkPermission, requestPermission, type PermissionResult } from '@/core/permissions';

import { SETUP_HREF } from '../constants/setup.constants';
import type { SetupPermission } from '../types/setup.types';

const useFinishSetup = () => {
  const { user } = useAuth();

  return useCallback(() => {
    if (user) saveSetupStep(user.id, 'done');
    router.replace(SETUP_HREF.home);
  }, [user]);
};

async function syncPushToken() {
  try {
    const token = await Notifications.getDevicePushTokenAsync();
    if (typeof token.data === 'string' && token.data) await authApi.registerPushToken(token.data);
  } catch (error) {
    log.warn('push token sync failed', { error: String(error) });
  }
}

type Statuses = Record<SetupPermission, PermissionResult | null>;

export const usePermissionsSetup = () => {
  const [status, setStatus] = useState<Statuses>({ location: null, notifications: null });
  const [pending, setPending] = useState<SetupPermission | null>(null);
  const finish = useFinishSetup();

  // Check now, and again whenever the user comes back from Settings.
  useEffect(() => {
    let alive = true;
    const check = async () => {
      const [location, notifications] = await Promise.all([
        checkPermission('location'),
        checkPermission('notifications'),
      ]);
      if (alive) setStatus({ location, notifications });
    };
    void check();
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') void check();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  const allow = async (kind: SetupPermission) => {
    if (status[kind] === 'blocked') {
      void Linking.openSettings();
      return;
    }
    setPending(kind);
    try {
      const result = await requestPermission(kind);
      setStatus(s => ({ ...s, [kind]: result }));
      if (result !== 'granted') return;
      if (kind === 'notifications') void syncPushToken();
      // Android: offer to turn on GPS so the map has a fix straight away.
      if (kind === 'location' && Platform.OS === 'android') {
        await Location.enableNetworkProviderAsync().catch(() => undefined);
      }
    } catch (error) {
      log.warn('permission request failed', { kind, error: String(error) });
    } finally {
      setPending(null);
    }
  };

  return { status, pending, allow: (kind: SetupPermission) => void allow(kind), finish };
};
