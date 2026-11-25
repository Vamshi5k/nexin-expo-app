import { View } from 'react-native';

import AppSkeleton from './AppSkeleton';

import { useTheme } from '@/shared/theme';

type AppSkeletonTextProps = {
  lines?: number;
  lineHeight?: number;
};

const AppSkeletonText = ({ lines = 3, lineHeight = 14 }: AppSkeletonTextProps) => {
  const t = useTheme();

  return (
    <View style={{ gap: t.space[2] }} accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: lines }, (_, i) => (
        <AppSkeleton key={i} height={lineHeight} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </View>
  );
};

export default AppSkeletonText;
