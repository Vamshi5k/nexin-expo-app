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

import { useTheme, withAlpha } from '@/shared/theme';

type StatusDotProps = {
  color: string;
  live?: boolean;
  // A soft halo around the dot, so it reads as lit.
  glow?: boolean;
};

const PULSE_MS = 1600;
const PULSE_SCALE = 2.6;
const GLOW_BLUR = 6;
const GLOW_ALPHA = 0.7;

// A small status dot, optionally with a soft glow. When live a ring keeps radiating from it.
const StatusDot = ({ color, live, glow }: StatusDotProps) => {
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

  // A real light bleed in the dot's own colour, not a flat circle behind it.
  const lit = glow ? { boxShadow: `0 0 ${GLOW_BLUR}px 1px ${withAlpha(color, GLOW_ALPHA)}` } : null;

  return (
    <View style={{ width: size, height: size }}>
      {animate ? <Animated.View style={[StyleSheet.absoluteFill, dot, ring]} /> : null}
      <View style={[dot, lit]} />
    </View>
  );
};

export default StatusDot;
