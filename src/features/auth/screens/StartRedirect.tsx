import { View } from 'react-native';

import { Redirect } from 'expo-router';

import { useTheme } from '@/shared/theme';

import { useStartRoute } from '../hooks/useStartRoute';

const StartRedirect = () => {
  const t = useTheme();
  const href = useStartRoute();
  if (href) return <Redirect href={href} />;

  return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
};

export default StartRedirect;
