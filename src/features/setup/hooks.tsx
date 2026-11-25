import { zodResolver } from '@hookform/resolvers/zod';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AppState, Keyboard, Linking, Platform } from 'react-native';

import { getErrorMessage } from '@/core/api';
import { log } from '@/core/log';
import { checkPermission, requestPermission, type PermissionResult } from '@/core/permissions';
import { useAction } from '@/core/request';
import { markSetupDone, openLegal, registerPushToken, useAuth } from '@/features/auth';
import { useClientConfig } from '@/features/client-config';
import { useVehicleWizard } from '@/features/vehicles';
import { toast } from '@/ui';

import { updateProfile } from './api';
import { SETUP_HREF } from './constants';
import { initialsOf, profileFormSchema, type ProfileForm } from './profile';
import type { SetupPermission } from './types';

function useFinishSetup() {
  const { user } = useAuth();
  return useCallback(() => {
    if (user) markSetupDone(user.id);
    router.replace(SETUP_HREF.home);
  }, [user]);
}

export function useProfileSetup() {
  const { user, loadUser } = useAuth();
  const config = useClientConfig();
  const [accepted, setAccepted] = useState(false);
  const save = useAction(updateProfile);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user?.firstName ?? '' },
    mode: 'onTouched',
  });
  const name = useWatch({ control: form.control, name: 'name' });
  const valid = profileFormSchema.safeParse({ name }).success && accepted;

  const submit = form.handleSubmit(async (values) => {
    if (!accepted) {
      toast.error('Please accept the Terms & Conditions and Privacy Policy to continue');
      return;
    }
    Keyboard.dismiss();
    try {
      await save.run(values.name.trim());
      toast.success('Profile updated successfully');
      // Picks up the saved name and, if the server cleared it, isFirstLogin.
      void loadUser().catch(() => undefined);
      router.replace(SETUP_HREF.vehicle);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return {
    control: form.control,
    initials: initialsOf(name ?? ''),
    accepted,
    toggleAccepted: () => setAccepted((a) => !a),
    valid,
    saving: save.isPending,
    submit: () => void submit(),
    openTerms: () => void openLegal(config.termsUrl),
    openPrivacy: () => void openLegal(config.privacyUrl),
  };
}

export function useVehicleSetup() {
  const toPermissions = useCallback(() => router.replace(SETUP_HREF.permissions), []);
  return { wizard: useVehicleWizard({ onAdded: toPermissions }), skip: toPermissions };
}

async function syncPushToken() {
  try {
    const token = await Notifications.getDevicePushTokenAsync();
    if (typeof token.data === 'string' && token.data) await registerPushToken(token.data);
  } catch (error) {
    log.warn('push token sync failed', { error: String(error) });
  }
}

type Statuses = Record<SetupPermission, PermissionResult | null>;

export function usePermissionsSetup() {
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
    const sub = AppState.addEventListener('change', (s) => {
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
      setStatus((s) => ({ ...s, [kind]: result }));
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
}
