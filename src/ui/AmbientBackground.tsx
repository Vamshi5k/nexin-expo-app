import { useEffect, useId } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

type Orb = { x: number; y: number; size: number; dx: number; dy: number; opacity: number };

// Positions are fractions of the window; drift is in points. Only transforms animate (UI thread).
const ORBS: Orb[] = [
  { x: 0.85, y: 0.05, size: 1.1, dx: -36, dy: 28, opacity: 0.22 },
  { x: 0.05, y: 0.75, size: 1.0, dx: 30, dy: -34, opacity: 0.14 },
];

export function AmbientBackground() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, reduceMotion]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.bg }]}>
      {ORBS.map((orb, i) => (
        <OrbView key={i} orb={orb} drift={drift} color={t.colors.accent} />
      ))}
    </View>
  );
}

function OrbView({ orb, drift, color }: { orb: Orb; drift: SharedValue<number>; color: string }) {
  const { width, height } = useWindowDimensions();
  const id = useId();
  const size = width * orb.size;
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: orb.dx * drift.value },
      { translateY: orb.dy * drift.value },
      { scale: 1 + 0.06 * drift.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          width: size,
          height: size,
          left: width * orb.x - size / 2,
          top: height * orb.y - size / 2,
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={orb.opacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}
