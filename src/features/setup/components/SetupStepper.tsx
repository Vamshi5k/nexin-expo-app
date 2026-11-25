import { StyleSheet, View } from 'react-native';

import { Check } from 'lucide-react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { SETUP_STEPS } from '../constants';

// Profile · Vehicle · Permissions: done steps show a check, the current one is accent.
export function SetupStepper({ current }: { current: number }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View
      style={[styles.row, { gap: t.space[2] }]}
      accessible
      accessibilityLabel={`Step ${current} of ${SETUP_STEPS.length}, ${SETUP_STEPS[current - 1]}`}
    >
      {SETUP_STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <View key={label} style={[styles.item, { gap: t.space[2] }]}>
            <View
              style={[
                styles.track,
                {
                  borderRadius: t.radius.pill,
                  backgroundColor: done || active ? c.accent : c.border,
                },
              ]}
            />
            <View style={[styles.labelRow, { gap: t.space[1] }]}>
              {done ? (
                <Check color={c.accentText} size={14} strokeWidth={2.5} />
              ) : (
                <AppText variant="caption" tone={active ? 'accent' : 'tertiary'} tabular>
                  {n}
                </AppText>
              )}
              <AppText
                variant="caption"
                tone={active ? 'primary' : done ? 'secondary' : 'tertiary'}
                numberOfLines={1}
              >
                {label}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  item: { flex: 1 },
  track: { height: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
});
