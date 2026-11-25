import { BatteryCharging, PlugZap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  ZoomIn,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ILLUSTRATION_MIN_HEIGHT = 56;
const FULL_MIN = 160;
const FULL_MAX = 280;
const PILLS_MIN = 210;

// Everything is drawn in a 240 box centred on (120, 120).
const C = 120;
const BOLT = 'M127 82 L101 126 H120 L112 158 L140 112 H121 Z';
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const a = (i * 6 * Math.PI) / 180;
  const inner = i % 5 === 0 ? 86 : 91;
  const p = (r: number) => `${C + Math.sin(a) * r} ${C - Math.cos(a) * r}`;
  return `M${p(inner)} L${p(97)}`;
}).join(' ');

type Box = { width: number; height: number };

export function ChargingIllustration() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const charge = useSharedValue(reduceMotion ? 0.82 : 0.12);
  const spin = useSharedValue(0);
  const float = useSharedValue(0.5);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    charge.set(
      withRepeat(
        withSequence(
          withTiming(0.92, { duration: 3400, easing: Easing.inOut(Easing.cubic) }),
          withDelay(900, withTiming(0.12, { duration: 0 })),
        ),
        -1,
      ),
    );
    spin.set(withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1));
    float.set(
      withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [charge, spin, float, reduceMotion]);

  // Keyboard animation resizes this box every frame; only re-render on 8 pt steps.
  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    const height = Math.floor(e.nativeEvent.layout.height / 8) * 8;
    if (box?.width !== width || box?.height !== height) setBox({ width, height });
  };

  const full = box !== null && box.height >= FULL_MIN;
  const size = box ? Math.min(box.height, box.width * 0.78, FULL_MAX) : 0;

  return (
    <View
      style={[styles.wrap, full ? styles.center : styles.start]}
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Electric vehicle charging"
    >
      {box === null ? null : full ? (
        <Animated.View
          key="full"
          entering={ZoomIn.duration(t.motion.durationSlow)}
          exiting={FadeOut.duration(t.motion.duration)}
          style={{ width: size, height: size }}
        >
          <Orbit spin={spin} />
          <Dial charge={charge} />
          {size >= PILLS_MIN ? <Pills size={size} float={float} charge={charge} /> : null}
        </Animated.View>
      ) : (
        <Animated.View
          key="compact"
          entering={ZoomIn.duration(t.motion.duration)}
          exiting={FadeOut.duration(t.motion.duration)}
          style={styles.compact}
        >
          <Dial charge={charge} compact />
        </Animated.View>
      )}
    </View>
  );
}

function Dial({ charge, compact }: { charge: SharedValue<number>; compact?: boolean }) {
  const c = useTheme().colors;
  const r = compact ? 96 : 76;
  const stroke = compact ? 24 : 14;
  const length = 2 * Math.PI * r;
  const arc = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - charge.value) }));

  return (
    <Svg width="100%" height="100%" viewBox="0 0 240 240" style={StyleSheet.absoluteFill}>
      {compact ? null : (
        <>
          <Circle cx={C} cy={C} r={116} fill="none" stroke={c.accent} strokeOpacity={0.12} />
          <Path d={TICKS} stroke={c.borderStrong} strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}
      <Circle cx={C} cy={C} r={r} fill="none" stroke={c.accentSoft} strokeWidth={stroke} />
      <AnimatedCircle
        cx={C}
        cy={C}
        r={r}
        fill="none"
        stroke={c.accent}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={[length, length]}
        transform={`rotate(-90 ${C} ${C})`}
        animatedProps={arc}
      />
      <Circle
        cx={C}
        cy={C}
        r={compact ? 70 : 58}
        fill={compact ? c.accentSoft : c.surface}
        stroke={c.border}
        strokeWidth={compact ? 0 : 1.5}
      />
      {compact ? null : <Circle cx={C} cy={C} r={44} fill={c.accentSoft} />}
      <G
        transform={compact ? `translate(${C} ${C}) scale(1.25) translate(${-C} ${-C})` : undefined}
      >
        <Path d={BOLT} fill={c.accent} />
      </G>
    </Svg>
  );
}

function Orbit({ spin }: { spin: SharedValue<number> }) {
  const c = useTheme().colors;
  const turn = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, turn]}>
      <Svg width="100%" height="100%" viewBox="0 0 240 240">
        <Circle
          cx={C}
          cy={C}
          r={106}
          fill="none"
          stroke={c.accent}
          strokeOpacity={0.35}
          strokeDasharray={[2, 7]}
          strokeLinecap="round"
        />
        <Circle cx={C} cy={14} r={6} fill={c.accent} stroke={c.bg} strokeWidth={3} />
      </Svg>
    </Animated.View>
  );
}

function Pills({
  size,
  float,
  charge,
}: {
  size: number;
  float: SharedValue<number>;
  charge: SharedValue<number>;
}) {
  const t = useTheme();
  const c = t.colors;
  const up = useAnimatedStyle(() => ({ transform: [{ translateY: (float.value - 0.5) * 8 }] }));
  const down = useAnimatedStyle(() => ({ transform: [{ translateY: (0.5 - float.value) * 8 }] }));
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: charge.value }] }));
  const pill = {
    backgroundColor: c.surface,
    borderColor: c.border,
    borderRadius: t.radius.pill,
    padding: t.space[1],
    paddingRight: t.space[3],
    gap: t.space[2],
  };

  return (
    <>
      <Animated.View style={[styles.pill, pill, { top: size * 0.04, right: -size * 0.1 }, up]}>
        <View style={[styles.tile, { backgroundColor: c.accent }]}>
          <BatteryCharging color={c.onAccent} size={16} strokeWidth={2} />
        </View>
        <View style={[styles.track, { backgroundColor: c.accentSoft }]}>
          <Animated.View style={[styles.fill, { backgroundColor: c.accent }, fill]} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.pill, pill, { bottom: size * 0.06, left: -size * 0.1 }, down]}>
        <View style={[styles.tile, { backgroundColor: c.accentSoft }]}>
          <PlugZap color={c.accentText} size={16} strokeWidth={2} />
        </View>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: c.accent, opacity: 0.35 + i * 0.3 }]}
            />
          ))}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: '100%', minHeight: ILLUSTRATION_MIN_HEIGHT },
  center: { alignItems: 'center', justifyContent: 'center' },
  start: { alignItems: 'flex-start', justifyContent: 'flex-end' },
  compact: { width: ILLUSTRATION_MIN_HEIGHT, height: ILLUSTRATION_MIN_HEIGHT },
  pill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  tile: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  track: { width: 44, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { width: 44, height: 6, borderRadius: 3, transformOrigin: 'left' },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
