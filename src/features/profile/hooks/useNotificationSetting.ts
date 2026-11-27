import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { syncPushToken } from '@/features/setup';

import { log } from '@/core/log';
import { checkPermission, requestPermission, type PermissionResult } from '@/core/permissions';
import { toast } from '@/shared/utils/toast';

import { SETTINGS_COPY } from '../constants/profile.constants';

const openSettings = () =>
  Linking.openSettings().catch((error: unknown) =>
    log.warn('could not open settings', { error: String(error) }),
  );

// The notification switch mirrors the real permission. On asks for it (and registers the push
// token, as setup does); once blocked, or to turn it off, the phone's settings are the only
// place to change it. Coming back from Settings re-checks it.
export const useNotificationSetting = () => {
  const [status, setStatus] = useState<PermissionResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const next = await checkPermission('notifications');
        if (alive) setStatus(next);
      } catch (error) {
        log.warn('notification permission check failed', { error: String(error) });
      }
    };

    void check();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') void check();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  const toggle = async () => {
    if (busy || status === null) return;

    if (status === 'granted' || status === 'blocked') {
      await openSettings();
      return;
    }

    setBusy(true);
    try {
      const result = await requestPermission('notifications');
      setStatus(result);
      if (result === 'granted') {
        toast.success(SETTINGS_COPY.notificationsOn);
        void syncPushToken();
      }
    } finally {
      setBusy(false);
    }
  };

  return {
    enabled: status === 'granted',
    known: status !== null,
    busy,
    subtitle:
      status === 'granted'
        ? SETTINGS_COPY.notificationsOnHint
        : status === 'blocked'
          ? SETTINGS_COPY.notificationsBlocked
          : SETTINGS_COPY.notificationsOffHint,
    toggle: () => void toggle(),
  };
};
