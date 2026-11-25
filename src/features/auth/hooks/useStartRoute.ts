import { useEffect, useState } from 'react';

import { type Href } from 'expo-router';

import { useFleet } from '@/features/fleet';

import { sessionStore } from '@/core/session';

import { useAuth } from './useAuth';
import { START_HREF } from '../constants/auth.constants';
import {
  classifySessionError,
  isOnboardingDone,
  resolveStartRoute,
  saveSetupStep,
  setupPermissionsGranted,
  setupStepFor,
} from '../utils/authFlow';

type PermissionCheck = { userId: string; granted: boolean };

// Where "/" sends the user, or null while the user (or a permissions check) is still loading.
export const useStartRoute = (): Href | null => {
  const { mode, user, userStatus, userError, loadUser } = useAuth();
  const { driverStatus, driverError, loadDriver } = useFleet();
  const [check, setCheck] = useState<PermissionCheck | null>(null);
  const expired =
    (mode === 'consumer' &&
      userStatus === 'error' &&
      classifySessionError(userError) === 'expired') ||
    (mode === 'fleet' &&
      driverStatus === 'error' &&
      classifySessionError(driverError) === 'expired');

  // After OTP sign-in the user isn't loaded yet; boot already loaded it for a restored session.
  useEffect(() => {
    if (mode === 'consumer' && userStatus === 'idle') void loadUser().catch(() => undefined);
  }, [mode, userStatus, loadUser]);

  // Same for the driver after fleet OTP sign-in.
  useEffect(() => {
    if (mode === 'fleet' && driverStatus === 'idle') void loadDriver().catch(() => undefined);
  }, [mode, driverStatus, loadDriver]);

  useEffect(() => {
    if (expired) void sessionStore.getState().signOut();
  }, [expired]);

  const setupStep = mode === 'consumer' && user ? setupStepFor(user) : null;
  const userId = user?.id;

  useEffect(() => {
    if (setupStep !== 'permissions' || !userId) return;
    let alive = true;
    void setupPermissionsGranted().then(granted => {
      if (!alive) return;
      if (granted) saveSetupStep(userId, 'done');
      setCheck({ userId, granted });
    });
    return () => {
      alive = false;
    };
  }, [setupStep, userId]);

  const route = resolveStartRoute({
    mode,
    user,
    onboardingDone: isOnboardingDone(),
    setupStep,
    permissionsGranted: check && check.userId === userId ? check.granted : null,
  });

  return route ? START_HREF[route] : null;
};
