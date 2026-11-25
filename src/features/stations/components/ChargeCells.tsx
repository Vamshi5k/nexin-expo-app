import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import type { Badge } from '../utils/status';

type ChargeCellsProps = {
  badge: Badge;
};

// More cells than this stop reading as single connectors.
const MAX_CELLS = 6;

// One cell per connector, like a battery gauge: free ones filled green, all amber when busy.
const ChargeCells = ({ badge }: ChargeCellsProps) => {
  const t = useTheme();
  if (badge.kind !== 'free' && badge.kind !== 'busy') return null;

  const cells = Math.min(badge.total, MAX_CELLS);
  const filled = badge.kind === 'free' ? Math.round((badge.free / badge.total) * cells) : cells;
  const fill = badge.kind === 'free' ? t.colors.success : t.colors.warning;

  return (
    <View style={[styles.row, { gap: t.space[1] }]} accessibilityElementsHidden>
      {Array.from({ length: cells }, (_, index) => (
        <View
          key={index}
          style={{
            width: t.space[2],
            height: t.space[4],
            borderRadius: t.space[1],
            backgroundColor: index < filled ? fill : t.colors.surfaceSunken,
          }}
        />
      ))}
    </View>
  );
};

export default ChargeCells;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
