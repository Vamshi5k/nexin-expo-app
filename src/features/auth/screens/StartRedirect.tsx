import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { sessionStore, useSession } from '@/core/session';
import { useTheme } from '@/theme';

import { classifySessionError } from '../boot';
import { useMe } from '../hooks';
import { isOnboardingDone, resolveStartRoute, START_HREF } from '../routes';

import { BootErrorScreen } from './BootErrorScreen';

/**
 * The root route ("/"): renders nothing, only redirects by session (BLUEPRINT A1).
 * Also reached after OTP: the (auth) guard sends a new session here, and this loads the
 * user and picks setup or home.
 */
export function StartRedirect() {
  const t = useTheme();
  const mode = useSession((s) => s.mode);
  const me = useMe();
  const expired = me.isError && classifySessionError(me.error) === 'expired';

  useEffect(() => {
    if (expired) void sessionStore.getState().signOut();
  }, [expired]);

  const route = resolveStartRoute({ mode, user: me.data, onboardingDone: isOnboardingDone() });
  if (route) return <Redirect href={START_HREF[route]} />;
  if (me.isError && !expired) {
    return <BootErrorScreen onRetry={() => void me.refetch()} retrying={me.isFetching} />;
  }
  // Consumer user loading: plain background (the native splash is already gone).
  return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
}
