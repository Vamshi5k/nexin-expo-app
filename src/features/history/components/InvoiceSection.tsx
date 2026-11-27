import { StyleSheet, View } from 'react-native';

import Animated from 'react-native-reanimated';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

export type InvoiceLine = {
  label: string;
  value: string | null;
  strong?: boolean;
  divider?: boolean;
};

type InvoiceSectionProps = {
  title: string;
  lines: InvoiceLine[];
  step: number;
};

// A small uppercase label over one white card of label / value lines. Lines without a value
// are left out; a card with nothing to show disappears.
const InvoiceSection = ({ title, lines, step }: InvoiceSectionProps) => {
  const t = useTheme();
  const shown = lines.filter(line => line.value !== null && line.value !== '');
  if (!shown.length) return null;

  return (
    <Animated.View entering={riseIn(step)} style={{ gap: t.space[2] }}>
      <AppText
        variant="caption"
        tone="secondary"
        accessibilityRole="header"
        style={[styles.overline, { paddingHorizontal: t.space[1] }]}
      >
        {title}
      </AppText>
      <View
        style={{
          paddingHorizontal: t.space[3],
          paddingVertical: t.space[1],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        }}
      >
        {shown.map((line, index) => (
          <View
            key={line.label}
            accessible
            accessibilityLabel={`${line.label}, ${line.value}`}
            style={[
              styles.row,
              {
                gap: t.space[3],
                paddingVertical: t.space[2] + t.space[1] / 2,
                borderTopWidth: index && line.divider ? t.layout.hairline : 0,
                borderTopColor: t.colors.border,
              },
            ]}
          >
            <AppText
              variant="caption"
              tone={line.strong ? 'primary' : 'secondary'}
              style={[
                styles.label,
                line.strong ? { fontFamily: t.type.headline.fontFamily } : null,
              ]}
            >
              {line.label}
            </AppText>
            <AppText
              variant={line.strong ? 'subhead' : 'caption'}
              tabular
              style={[styles.value, { fontFamily: t.type.headline.fontFamily }]}
            >
              {line.value}
            </AppText>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

export default InvoiceSection;

const styles = StyleSheet.create({
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    flexShrink: 0,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
});
