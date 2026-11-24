import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from '@/ui';

import { SETUP_STEP_COUNT } from '../constants';

// "Step n of 3" across the whole setup (profile, vehicle, permissions), with an optional action.
export function SetupHeader({ step, right }: { step: number; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space[2], paddingTop: t.space[3] }}>
      <View style={[styles.row, { minHeight: 44 }]}>
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bar: { flex: 1, height: 4 },
});
