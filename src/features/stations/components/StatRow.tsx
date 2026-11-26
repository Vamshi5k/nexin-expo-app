import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import { useTheme, withAlpha } from '@/shared/theme';

export type Stat = { value: string; label: string };

type StatRowProps = {
  stats: Stat[];
  // Light text for use over a photo scrim.
  inverse?: boolean;
};

// Long values or a large system text size shrink a little to fit instead of being cut off.
const MIN_STAT_SCALE = 0.85;

// Figures side by side: a semibold value over a quiet label, split by hairlines.
const StatRow = ({ stats, inverse }: StatRowProps) => {
  const t = useTheme();
  const light = t.colors.surface;
  const valueColor = inverse ? light : t.colors.textPrimary;
  const labelColor = inverse ? withAlpha(light, 0.8) : t.colors.textTertiary;
  const dividerColor = inverse ? withAlpha(light, 0.35) : t.colors.borderStrong;

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
                  backgroundColor: dividerColor,
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
              style={{ fontFamily: t.type.headline.fontFamily, color: valueColor }}
            >
              {stat.value}
            </AppText>
            <AppText variant="caption" numberOfLines={1} style={{ color: labelColor }}>
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
