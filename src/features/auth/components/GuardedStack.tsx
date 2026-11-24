import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { log } from '@/core/log';
import { sessionStore, useSession } from '@/core/session';
import { useClientConfig } from '@/features/client-config';
import { useTheme } from '@/theme';

import { guardRoute, type RouteGroup } from '../utils';

export function GuardedStack({ group }: { group: RouteGroup }) {
  const t = useTheme();
  const mode = useSession((s) => s.mode);
  const fleetEnabled = useClientConfig().features.fleet;
  const decision = guardRoute(group, { mode, fleetEnabled });

  useEffect(() => {
    if (decision !== 'end-session') return;
    log.info('fleet feature is off; ending the fleet session');
    void sessionStore.getState().signOut();
  }, [decision]);

  if (decision === 'redirect') return <Redirect href="/" />;
  if (decision === 'end-session') return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: group === 'auth' ? 'ios_from_right' : 'default',
        contentStyle: group === 'auth' ? { backgroundColor: t.colors.bg } : undefined,
      }}
    />
  );
}
