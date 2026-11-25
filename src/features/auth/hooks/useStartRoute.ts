import { useEffect } from 'react';

import { type Href } from 'expo-router';

import { sessionStore } from '@/core/session';

import { useAuth } from './useAuth';
import { START_HREF } from '../constants/auth.constants';
import {
  classifySessionError,
  isOnboardingDone,
  isSetupDone,
  resolveStartRoute,
} from '../utils/authFlow';

// Where "/" sends the user, or null while the user is still loading.
export const useStartRoute = (): Href | null => {
  const { mode, user, userStatus, userError, loadUser } = useAuth();
  const expired = userStatus === 'error' && classifySessionError(userError) === 'expired';

  // After OTP sign-in the user isn't loaded yet; boot already loaded it for a restored session.
  useEffect(() => {
    if (mode === 'consumer' && userStatus === 'idle') void loadUser().catch(() => undefined);
  }, [mode, userStatus, loadUser]);

  useEffect(() => {
    if (expired) void sessionStore.getState().signOut();
  }, [expired]);

  const route = resolveStartRoute({
    mode,
    user,
    onboardingDone: isOnboardingDone(),
    setupDone: user ? isSetupDone(user.id) : false,
  });

  return route ? START_HREF[route] : null;
};
