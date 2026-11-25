import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

export type Stat = { value: string; label: string };

type StatRowProps = {
  stats: Stat[];
};

// Long values or a large system text size shrink a little to fit instead of being cut off.
const MIN_STAT_SCALE = 0.85;

// Figures side by side: a semibold value over a quiet label, split by hairlines.
const StatRow = ({ stats }: StatRowProps) => {
  const t = useTheme();

  return (
    <View style={styles.row}>
      {stats.map((stat, index) => (
        <View key={stat.label} style={styles.row}>
          {index > 0 ? (
            <View
              style={[
                styles.divider,
                {
                  height: t.space[6],
                  marginHorizontal: t.space[3],
                  backgroundColor: t.colors.borderStrong,
                },
              ]}
            />
          ) : null}
          <View style={styles.stat}>
            <AppText
              variant="subhead"
              tabular
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={MIN_STAT_SCALE}
              style={{ fontFamily: t.type.headline.fontFamily }}
            >
              {stat.value}
            </AppText>
            <AppText variant="caption" tone="tertiary" numberOfLines={1}>
              {stat.label}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
};

export default StatRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexShrink: 1,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
  },
});
