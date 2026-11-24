import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from '@/ui';

import { SETUP_STEP_COUNT } from '../constants';

// "Step n of 3" across the whole setup (profile, vehicle, permissions); sits in the top bar.
export function SetupHeader({ step, right }: { step: number; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.flex, { gap: t.space[2] }]}>
      <View style={[styles.row, { minHeight: 36 }]}>
        <Text variant="subhead" tone="secondary" tabular>
          Step {step} of {SETUP_STEP_COUNT}
        </Text>
        {right}
      </View>
      <View style={[styles.row, { gap: t.space[1] }]} accessibilityElementsHidden>
        {Array.from({ length: SETUP_STEP_COUNT }, (_, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                borderRadius: t.radius.pill,
                backgroundColor: i < step ? t.colors.accent : t.colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bar: { flex: 1, height: 4 },
});
