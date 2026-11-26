import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/theme';

type StatusDotProps = {
  color: string;
  live?: boolean;
};

const PULSE_MS = 1600;
const PULSE_SCALE = 2.6;

// A small status dot. When live (a connector charging) a soft ring keeps radiating from it.
const StatusDot = ({ color, live }: StatusDotProps) => {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const animate = live && !reduceMotion;

  useEffect(() => {
    if (!animate) return;
    pulse.set(
      withRepeat(withTiming(1, { duration: PULSE_MS, easing: Easing.out(Easing.quad) }), -1),
    );
    return () => cancelAnimation(pulse);
  }, [animate, pulse]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * (PULSE_SCALE - 1) }],
  }));

  const size = t.space[2];
  const dot = { width: size, height: size, borderRadius: t.radius.pill, backgroundColor: color };

  return (
    <View style={{ width: size, height: size }}>
      {animate ? <Animated.View style={[StyleSheet.absoluteFill, dot, ring]} /> : null}
      <View style={dot} />
    </View>
  );
};

export default StatusDot;
