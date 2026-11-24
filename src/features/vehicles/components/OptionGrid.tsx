import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Pressable, Skeleton, Text } from '@/ui';

export type Option = { key: string; label: string; subtitle?: string; selected: boolean };

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
              minHeight: 72,
              padding: t.space[4],
              borderRadius: t.radius.card,
              borderWidth: 1.5,
              borderColor: o.selected ? c.accent : c.border,
              backgroundColor: o.selected ? c.accentSoft : c.surface,
              gap: t.space[1],
            },
          ]}
        >
          <Text variant="headline" numberOfLines={2} style={styles.label}>
            {o.label}
          </Text>
          {o.subtitle ? (
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {o.subtitle}
            </Text>
          ) : null}
          {o.selected ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: c.accent,
                  borderRadius: t.radius.pill,
                  top: t.space[2],
                  right: t.space[2],
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
          <Skeleton height={72} radius={t.radius.card} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '47.5%', flexGrow: 1, justifyContent: 'center' },
  label: { paddingRight: 20 },
  badge: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
