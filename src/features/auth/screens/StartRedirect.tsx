import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { useStartRoute } from '../routing';

import { BootErrorScreen } from './BootErrorScreen';

export function StartRedirect() {
  const t = useTheme();
  const start = useStartRoute();
  if (start.href) return <Redirect href={start.href} />;
  if (start.failed) return <BootErrorScreen onRetry={start.retry} />;
  return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
}
