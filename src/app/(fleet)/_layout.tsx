import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { log } from '@/core/log';
import { sessionStore, useSession } from '@/core/session';
import { useClientConfig } from '@/features/client-config';
import { useTheme } from '@/theme';

/** Fleet driver screens: fleet session only, and only while the fleet feature is on. */
export default function FleetLayout() {
  const t = useTheme();
  const mode = useSession((s) => s.mode);
  const fleetEnabled = useClientConfig().features.fleet;
  const disabledWithSession = mode === 'fleet' && !fleetEnabled;

  useEffect(() => {
    if (!disabledWithSession) return;
    // A fleet session with the feature off has nowhere to go: end it so "/" sends the user to login.
    log.info('fleet feature is off; ending the fleet session');
    void sessionStore.getState().signOut();
  }, [disabledWithSession]);

  if (mode !== 'fleet') return <Redirect href="/" />;
  if (!fleetEnabled) return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
