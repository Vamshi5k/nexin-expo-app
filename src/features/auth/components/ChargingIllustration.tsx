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
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// The viewBox is cropped tight around the scene so it fills the space it is given.
const VIEW_BOX = '8 30 330 152';

const CABLE = 'M78 114 C100 114 96 162 122 162 C140 162 140 130 153 126';
const PULSE = { dash: 9, gap: 60 };
const RING = { cx: 45, cy: 72, r: 14 };
const RING_LENGTH = 2 * Math.PI * RING.r;
const BAR = 50;

const BODY =
  'M150 146 C148 132 154 122 170 119 L204 113 C222 95 240 86 266 86 C290 86 306 97 318 113 C326 121 330 130 330 139 V145 C330 150 326 153 321 153 H156 C152 153 150 150 150 146 Z';
const GLASS = 'M212 112 C226 99 242 92 264 92 C282 92 296 100 306 112 Z';
const BOLT_SMALL = 'M46.5 64 L40 73.5 H45 L43.5 80 L50 70.5 H45 Z';
const BOLT_CHIP = 'M228.5 49 L222 58 H227 L225.5 63 L232 54 H227 Z';

// Flat, token-only EV-at-charger scene: pulses run down the cable while the charger's ring
// and the battery chip fill together. Static under Reduce Motion.
export function ChargingIllustration() {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const charge = useSharedValue(reduceMotion ? 1 : 0.15);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.set(withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1));
    charge.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.cubic) }),
          withTiming(1, { duration: 900 }),
          withTiming(0.15, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, [pulse, charge, reduceMotion]);

  const energy = useAnimatedProps(() => ({
    strokeDashoffset: (PULSE.dash + PULSE.gap) * (1 - pulse.value),
  }));
  const ring = useAnimatedProps(() => ({ strokeDashoffset: RING_LENGTH * (1 - charge.value) }));
  const bar = useAnimatedProps(() => ({ width: BAR * charge.value }));

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Electric car charging at a station"
    >
      <Svg width="100%" height="100%" viewBox={VIEW_BOX} preserveAspectRatio="xMidYMid meet">
        <Circle cx={236} cy={110} r={80} fill={c.accentSoft} />
        <Rect x={10} y={168} width={326} height={8} rx={4} fill={c.surfaceSunken} />

        <Rect
          x={22}
          y={40}
          width={46}
          height={132}
          rx={23}
          fill={c.surface}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <Circle
          cx={RING.cx}
          cy={RING.cy}
          r={RING.r}
          fill="none"
          stroke={c.accentSoft}
          strokeWidth={4}
        />
        <AnimatedCircle
          cx={RING.cx}
          cy={RING.cy}
          r={RING.r}
          fill="none"
          stroke={c.accent}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={[RING_LENGTH, RING_LENGTH]}
          transform={`rotate(-90 ${RING.cx} ${RING.cy})`}
          animatedProps={ring}
        />
        <Path d={BOLT_SMALL} fill={c.accent} />
        <Rect x={36} y={104} width={18} height={4} rx={2} fill={c.border} />
        <Rect x={36} y={114} width={12} height={4} rx={2} fill={c.border} />
        <Rect x={64} y={104} width={14} height={20} rx={6} fill={c.textPrimary} />

        <Path d={CABLE} fill="none" stroke={c.textPrimary} strokeWidth={3} strokeLinecap="round" />
        <AnimatedPath
          d={CABLE}
          fill="none"
          stroke={c.accent}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={[PULSE.dash, PULSE.gap]}
          animatedProps={energy}
        />

        <Path d={BODY} fill={c.textPrimary} />
        <Path d={GLASS} fill={c.surface} opacity={0.22} />
        <Path d="M258 92 V112" stroke={c.textPrimary} strokeWidth={3} />
        <Path d="M176 134 H314" stroke={c.accent} strokeWidth={2} strokeLinecap="round" />
        <Rect x={310} y={120} width={20} height={3} rx={1.5} fill={c.accent} />
        <Rect x={150} y={124} width={10} height={3} rx={1.5} fill={c.accent} />
        <Circle cx={153} cy={126} r={3.5} fill={c.accent} />
        {[188, 292].map((cx) => (
          <Wheel key={cx} cx={cx} ring={c.bg} hub={c.surface} ink={c.textPrimary} dot={c.accent} />
        ))}

        <Rect
          x={208}
          y={40}
          width={100}
          height={32}
          rx={16}
          fill={c.surface}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <Circle cx={227} cy={56} r={10} fill={c.accent} />
        <Path d={BOLT_CHIP} fill={c.onAccent} />
        <Rect x={244} y={53} width={BAR} height={6} rx={3} fill={c.accentSoft} />
        <AnimatedRect x={244} y={53} height={6} rx={3} fill={c.accent} animatedProps={bar} />
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
      <Circle cx={cx} cy={153} r={20} fill={ring} />
      <Circle cx={cx} cy={153} r={17} fill={ink} />
      <Circle cx={cx} cy={153} r={10} fill={hub} opacity={0.9} />
      <Circle cx={cx} cy={153} r={6} fill="none" stroke={ink} strokeWidth={1.5} opacity={0.35} />
      <Circle cx={cx} cy={153} r={2.5} fill={dot} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: '100%', minHeight: 0, alignSelf: 'center' },
});
