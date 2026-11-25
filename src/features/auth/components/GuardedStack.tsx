import { View } from 'react-native';

import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/shared/theme';

import { useRouteGuard } from '../hooks/useRouteGuard';
import type { RouteGroup } from '../types/auth.types';

type GuardedStackProps = { group: RouteGroup };

const GuardedStack = ({ group }: GuardedStackProps) => {
  const t = useTheme();
  const decision = useRouteGuard(group);

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
};

export default GuardedStack;
