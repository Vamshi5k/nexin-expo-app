import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Pattern, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

const CELL = 24;

// Flat dot grid that fades out down the screen and drifts one cell at a time (seamless loop).
export function AmbientBackground() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.set(withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false));
  }, [drift, reduceMotion]);

  const grid = useAnimatedStyle(() => ({
    transform: [{ translateY: -CELL + CELL * drift.value }],
  }));

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.bg }]}>
      <Animated.View style={grid}>
        <Svg width={width} height={height + CELL}>
          <Defs>
            <Pattern id="dots" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
              <Circle cx={CELL / 2} cy={CELL / 2} r={1.1} fill={t.colors.borderStrong} />
            </Pattern>
          </Defs>
          <Rect width={width} height={height + CELL} fill="url(#dots)" />
        </Svg>
      </Animated.View>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.colors.bg} stopOpacity={0.15} />
            <Stop offset="0.55" stopColor={t.colors.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#fade)" />
      </Svg>
    </View>
  );
}
