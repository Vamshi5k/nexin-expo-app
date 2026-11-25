import { StyleSheet, View } from 'react-native';

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/theme';

export function OnboardingProgress({
  count,
  width,
  x,
}: {
  count: number;
  width: number;
  x: SharedValue<number>;
}) {
  const t = useTheme();

  return (
    <View style={[styles.row, { gap: t.space[2] }]} accessibilityElementsHidden>
      {Array.from({ length: count }, (_, i) => (
        <Segment key={i} index={i} width={width} x={x} />
      ))}
    </View>
  );
}

function Segment({ index, width, x }: { index: number; width: number; x: SharedValue<number> }) {
  const t = useTheme();
  const fill = useAnimatedStyle(() => ({
    transform: [
      { scaleX: interpolate(x.value / width, [index - 1, index], [0, 1], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View
      style={[styles.segment, { backgroundColor: t.colors.border, borderRadius: t.radius.pill }]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: t.colors.accent, transformOrigin: 'left' },
          fill,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  segment: { flex: 1, height: 3, overflow: 'hidden' },
});
