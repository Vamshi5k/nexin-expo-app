import { StyleSheet, View } from 'react-native';

import { Check } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

export type Option = {
  key: string;
  label: string;
  subtitle?: string;
  monogram?: boolean;
  selected: boolean;
};

type OptionGridProps = {
  options: Option[];
  onSelect: (key: string) => void;
};

// Flat cards: sunken at rest; tinted with an accent border and check when selected.
const OptionGrid = ({ options, onSelect }: OptionGridProps) => {
  const t = useTheme();
  const c = t.colors;

  return (
    <View style={[styles.grid, { gap: t.space[2] }]} accessibilityRole="radiogroup">
      {options.map(o => (
        <AppPressable
          key={o.key}
          onPress={() => onSelect(o.key)}
          haptic="selection"
          accessibilityRole="radio"
          accessibilityState={{ selected: o.selected }}
          accessibilityLabel={o.subtitle ? `${o.label}, ${o.subtitle}` : o.label}
          style={[
            styles.cell,
            {
              minHeight: o.monogram ? 84 : 64,
              padding: t.space[3],
              borderRadius: t.radius.card,
              borderWidth: 1.5,
              borderColor: o.selected ? c.accent : 'transparent',
              backgroundColor: o.selected ? c.accentSoft : c.surfaceSunken,
              gap: t.space[2],
            },
          ]}
        >
          {o.monogram ? (
            <View
              style={[
                styles.monogram,
                {
                  borderRadius: t.radius.control,
                  backgroundColor: o.selected ? c.accent : c.surface,
                },
              ]}
            >
              <AppText
                variant="subhead"
                style={{
                  fontFamily: t.type.headline.fontFamily,
                  color: o.selected ? c.onAccent : c.accentText,
                }}
              >
                {o.label.trim().charAt(0).toUpperCase()}
              </AppText>
            </View>
          ) : null}
          <View style={{ gap: 2 }}>
            <AppText
              variant="subhead"
              numberOfLines={2}
              style={[styles.label, { fontFamily: t.type.headline.fontFamily }]}
            >
              {o.label}
            </AppText>
            {o.subtitle ? (
              <AppText variant="caption" tone="secondary" numberOfLines={1}>
                {o.subtitle}
              </AppText>
            ) : null}
          </View>
          {o.selected ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: c.accent,
                  borderRadius: t.radius.pill,
                  top: t.space[3],
                  right: t.space[3],
                },
              ]}
            >
              <Check color={c.onAccent} size={12} strokeWidth={3} />
            </View>
          ) : null}
        </AppPressable>
      ))}
    </View>
  );
};

export default OptionGrid;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '47%', flexGrow: 1, justifyContent: 'flex-start' },
  label: { paddingRight: 24 },
  monogram: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
