import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { sessionStore, useSession } from '@/core/session';
import { useTheme } from '@/theme';

import { classifySessionError, useMe } from '../hooks';
import { isOnboardingDone, resolveStartRoute, START_HREF } from '../utils';

import { BootErrorScreen } from './BootErrorScreen';

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
  return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
}
