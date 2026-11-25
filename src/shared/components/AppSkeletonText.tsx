import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import AppSkeleton from './AppSkeleton';

export default function AppSkeletonText({
  lines = 3,
  lineHeight = 14,
}: {
  lines?: number;
  lineHeight?: number;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space[2] }} accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: lines }, (_, i) => (
        <AppSkeleton key={i} height={lineHeight} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </View>
  );
}
