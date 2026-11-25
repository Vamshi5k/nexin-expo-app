import { StyleSheet, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useTheme } from '@/shared/theme';

const OUTER = 216;
const INNER = 152;

export function OnboardingArt({
  icon: Icon,
  spin,
}: {
  icon: LucideIcon;
  spin: SharedValue<number>;
}) {
  const t = useTheme();
  const c = t.colors;

  return (
    <View style={[styles.center, { width: OUTER, height: OUTER }]}>
      <View
        style={[
          styles.abs,
          {
            width: OUTER,
            height: OUTER,
            borderRadius: OUTER / 2,
            borderWidth: 1,
            borderColor: c.border,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          { width: INNER, height: INNER, borderRadius: INNER / 2, backgroundColor: c.accentSoft },
        ]}
      />
      <Orbit size={OUTER} dot={8} color={c.accent} spin={spin} turns={1} />
      <Orbit size={INNER} dot={6} color={c.textPrimary} spin={spin} turns={-2} />
      <View
        style={[
          styles.center,
          { width: 76, height: 76, borderRadius: 24, backgroundColor: c.accent },
        ]}
      >
        <Icon color={c.onAccent} size={32} strokeWidth={1.75} />
      </View>
    </View>
  );
}

function Orbit({
  size,
  dot,
  color,
  spin,
  turns,
}: {
  size: number;
  dot: number;
  color: string;
  spin: SharedValue<number>;
  turns: number;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360 * turns}deg` }],
  }));

  return (
    <Animated.View style={[styles.abs, { width: size, height: size }, style]}>
      <View
        style={{
          position: 'absolute',
          top: -dot / 2,
          left: size / 2 - dot / 2,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: color,
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute' },
});
