import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CABLE = 'M88 104 C108 104 102 162 126 162 C142 162 140 132 153 129';
const PULSE = 8;
const GAP = 140;
const STRIP = { x: 59, bottom: 150, height: 62 };
const BAR = 36;

const BODY =
  'M150 150 C148 138 153 128 167 125 L197 120 C213 104 229 95 253 95 C273 95 287 105 299 119 C305 126 307 134 307 142 V148 C307 152 304 155 300 155 H156 C152 155 150 153 150 150 Z';
const GLASS = 'M206 119 C218 107 232 101 251 101 C266 101 278 108 288 119 Z';

// Flat, token-only EV-at-charger scene: a pulse runs down the cable while the charger strip
// and the battery chip fill together.
export function ChargingIllustration() {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const charge = useSharedValue(reduceMotion ? 1 : 0.2);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1));
    charge.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.cubic) }),
          withTiming(1, { duration: 900 }),
          withTiming(0.2, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, [pulse, charge, reduceMotion]);

  const energy = useAnimatedProps(() => ({
    strokeDashoffset: (PULSE + GAP) * (1 - pulse.value),
  }));
  const strip = useAnimatedProps(() => {
    const h = STRIP.height * charge.value;
    return { y: STRIP.bottom - h, height: h };
  });
  const bar = useAnimatedProps(() => ({ width: BAR * charge.value }));

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Electric car charging at a station"
    >
      <Svg width="100%" height="100%" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet">
        <Circle cx={230} cy={118} r={76} fill={c.accentSoft} />
        <Ellipse cx={176} cy={174} rx={140} ry={6} fill={c.surfaceSunken} />

        <Rect
          x={44}
          y={58}
          width={36}
          height={116}
          rx={18}
          fill={c.surface}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <Circle cx={62} cy={74} r={5} fill={c.accent} />
        <Rect
          x={STRIP.x}
          y={STRIP.bottom - STRIP.height}
          width={6}
          height={STRIP.height}
          rx={3}
          fill={c.accentSoft}
        />
        <AnimatedRect x={STRIP.x} width={6} rx={3} fill={c.accent} animatedProps={strip} />
        <Rect x={78} y={96} width={10} height={16} rx={4} fill={c.textPrimary} />

        <Path d={CABLE} fill="none" stroke={c.textPrimary} strokeWidth={3} strokeLinecap="round" />
        <AnimatedPath
          d={CABLE}
          fill="none"
          stroke={c.accent}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={[PULSE, GAP]}
          animatedProps={energy}
        />

        <Path d={BODY} fill={c.textPrimary} />
        <Path d={GLASS} fill={c.surface} opacity={0.22} />
        <Path d="M245 101 V119" stroke={c.textPrimary} strokeWidth={3} />
        <Path d="M172 139 H292" stroke={c.accent} strokeWidth={2} strokeLinecap="round" />
        <Rect x={291} y={127} width={16} height={3} rx={1.5} fill={c.accent} />
        <Rect x={150} y={131} width={8} height={3} rx={1.5} fill={c.accent} />
        <Circle cx={153} cy={129} r={3} fill={c.accent} />
        {[185, 271].map((cx) => (
          <Wheel key={cx} cx={cx} ring={c.bg} hub={c.surface} ink={c.textPrimary} dot={c.accent} />
        ))}

        <Rect
          x={204}
          y={52}
          width={80}
          height={28}
          rx={14}
          fill={c.surface}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <Circle cx={219} cy={66} r={9} fill={c.accent} />
        <Path d="M220.5 60 L215 67.5 H219 L217.5 72 L223 64.5 H219 Z" fill={c.onAccent} />
        <Rect x={234} y={63} width={BAR} height={6} rx={3} fill={c.accentSoft} />
        <AnimatedRect x={234} y={63} height={6} rx={3} fill={c.accent} animatedProps={bar} />
      </Svg>
    </View>
  );
}

function Wheel({
  cx,
  ring,
  hub,
  ink,
  dot,
}: {
  cx: number;
  ring: string;
  hub: string;
  ink: string;
  dot: string;
}) {
  return (
    <>
      <Circle cx={cx} cy={156} r={17} fill={ring} />
      <Circle cx={cx} cy={156} r={14} fill={ink} />
      <Circle cx={cx} cy={156} r={8} fill={hub} opacity={0.9} />
      <Circle cx={cx} cy={156} r={2.5} fill={dot} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: '100%', maxWidth: 340, minHeight: 0, alignSelf: 'center' },
});
