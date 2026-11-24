import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

const RINGS = 11;
const POINTS = 48;

type Point = [number, number];

// Wobbly closed ring as a smooth Catmull-Rom curve. Neighbouring rings use close phases so they never cross.
function ring(cx: number, cy: number, r: number, phase: number): string {
  const pts: Point[] = Array.from({ length: POINTS }, (_, i) => {
    const a = (i / POINTS) * Math.PI * 2;
    const k = 1 + 0.07 * (0.6 * Math.sin(3 * a + phase) + 0.4 * Math.sin(5 * a - phase * 1.3));
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
  });
  const at = (i: number) => pts[(i + POINTS) % POINTS];
  let d = `M${at(0)[0].toFixed(1)},${at(0)[1].toFixed(1)}`;
  for (let i = 0; i < POINTS; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

// Flat topographic lines from the top-right corner; they slowly turn and breathe, and fade out by mid screen.
export function ContourBackground() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);
  const radius = width * 1.15;
  const half = radius * 1.1;
  const size = half * 2;

  const paths = useMemo(
    () =>
      Array.from({ length: RINGS }, (_, i) => {
        const r = radius * (0.12 + (0.88 * i) / (RINGS - 1));
        return { d: ring(half, half, r, i * 0.38), opacity: 0.5 - (0.36 * i) / (RINGS - 1) };
      }),
    [radius, half],
  );

  useEffect(() => {
    if (reduceMotion) return;
    spin.set(withRepeat(withTiming(1, { duration: 120000, easing: Easing.linear }), -1, false));
    breathe.set(
      withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [spin, breathe, reduceMotion]);

  const field = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }, { scale: 1 + 0.035 * breathe.value }],
  }));

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.bg }]}>
      <Animated.View
        style={[
          styles.field,
          { width: size, height: size, left: width * 0.92 - half, top: height * 0.04 - half },
          field,
        ]}
      >
        <Svg width={size} height={size}>
          {paths.map((p, i) => (
            <Path
              key={i}
              d={p.d}
              fill="none"
              stroke={t.colors.accent}
              strokeOpacity={p.opacity}
              strokeWidth={1}
            />
          ))}
        </Svg>
      </Animated.View>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="contourFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.12" stopColor={t.colors.bg} stopOpacity={0} />
            <Stop offset="0.6" stopColor={t.colors.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#contourFade)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { position: 'absolute' },
});
