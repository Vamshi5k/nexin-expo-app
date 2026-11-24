import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Pressable, Skeleton, Text } from '@/ui';

export type Option = {
  key: string;
  label: string;
  subtitle?: string;
  monogram?: boolean;
  selected: boolean;
};

// Flat cards: sunken at rest; tinted with an accent border and check when selected.
export function OptionGrid({
  options,
  onSelect,
}: {
  options: Option[];
  onSelect: (key: string) => void;
}) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={[styles.grid, { gap: t.space[3] }]} accessibilityRole="radiogroup">
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onSelect(o.key)}
          haptic="selection"
          accessibilityRole="radio"
          accessibilityState={{ selected: o.selected }}
          accessibilityLabel={o.subtitle ? `${o.label}, ${o.subtitle}` : o.label}
          style={[
            styles.cell,
            {
              minHeight: o.monogram ? 104 : 80,
              padding: t.space[4],
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
              <Text variant="headline" style={{ color: o.selected ? c.onAccent : c.accentText }}>
                {o.label.trim().charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : null}
          <View style={{ gap: 2 }}>
            <Text variant="headline" numberOfLines={2} style={styles.label}>
              {o.label}
            </Text>
            {o.subtitle ? (
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {o.subtitle}
              </Text>
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
        </Pressable>
      ))}
    </View>
  );
}

export function OptionGridSkeleton() {
  const t = useTheme();
  return (
    <View style={[styles.grid, { gap: t.space[3] }]} accessibilityLabel="Loading">
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.cell}>
          <Skeleton height={104} radius={t.radius.card} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '47%', flexGrow: 1, justifyContent: 'flex-start' },
  label: { paddingRight: 24 },
  monogram: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
