import { StyleSheet, View } from 'react-native';

import { AppSkeleton } from '@/shared/components';

import { useTheme } from '@/shared/theme';

const OptionGridSkeleton = () => {
  const t = useTheme();

  return (
    <View style={[styles.grid, { gap: t.space[3] }]} accessibilityLabel="Loading">
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.cell}>
          <AppSkeleton height={104} radius={t.radius.card} />
        </View>
      ))}
    </View>
  );
};

export default OptionGridSkeleton;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '47%', flexGrow: 1, justifyContent: 'flex-start' },
});
