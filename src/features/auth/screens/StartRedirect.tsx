import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { useStartRoute } from '../routing';

export function StartRedirect() {
  const t = useTheme();
  const href = useStartRoute();
  if (href) return <Redirect href={href} />;
  return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
}
