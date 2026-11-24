import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { sessionStore } from '@/core/session';
import { useTheme } from '@/theme';

import { useAuth } from '../AuthContext';
import { classifySessionError } from '../hooks';
import { isOnboardingDone, resolveStartRoute, START_HREF } from '../utils';

import { BootErrorScreen } from './BootErrorScreen';

export function StartRedirect() {
  const t = useTheme();
  const { mode, user, userStatus, userError, loadUser } = useAuth();
  const failed = userStatus === 'error';
  const expired = failed && classifySessionError(userError) === 'expired';

  // After OTP sign-in the user isn't loaded yet; boot already loaded it for a restored session.
  useEffect(() => {
    if (mode === 'consumer' && userStatus === 'idle') void loadUser().catch(() => undefined);
  }, [mode, userStatus, loadUser]);

  useEffect(() => {
    if (expired) void sessionStore.getState().signOut();
  }, [expired]);

  const route = resolveStartRoute({ mode, user, onboardingDone: isOnboardingDone() });
  if (route) return <Redirect href={START_HREF[route]} />;
  if (failed && !expired) {
    return <BootErrorScreen onRetry={() => void loadUser().catch(() => undefined)} />;
  }
  return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
}
