import { useEffect } from 'react';

import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useTheme, withAlpha } from '@/shared/theme';

type StationsHeaderArtProps = {
  size: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Drawn in a 120 x 120 viewBox: a slim rounded pillar with a charge ring, a plug resting in
// its side holster and the cable coiling down to the ground.
const RING = { cx: 58, cy: 48, r: 14 };
const RING_LENGTH = 2 * Math.PI * RING.r;
const BOLT = 'M60.5 39 L53 50 H58 L56.5 57 L64 46 H59 Z';
const CABLE = 'M90 84 C92 98 104 100 106 90 C108 80 98 76 94 84 C90 92 96 104 108 106';
const PULSE = { dash: 8, gap: 40 };
const SPARK = 'M101 22 L103 28 L109 30 L103 32 L101 38 L99 32 L93 30 L99 28 Z';

const FILL_MS = 2400;
const FLOW_MS = 1300;
const GLOW_MS = 2200;
const TWINKLE_MS = 900;

// The Stations header's illustration. The ring fills like a charge, energy runs down the
// cable, the halo breathes and a spark twinkles. Still (and full) with Reduce Motion on.
const StationsHeaderArt = ({ size }: StationsHeaderArtProps) => {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const charge = useSharedValue(reduceMotion ? 1 : 0.1);
  const flow = useSharedValue(0);
  const glow = useSharedValue(0);
  const twinkle = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;

    charge.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: FILL_MS, easing: Easing.inOut(Easing.cubic) }),
          withTiming(1, { duration: FILL_MS / 3 }),
          withTiming(0.1, { duration: 0 }),
        ),
        -1,
      ),
    );
    flow.set(withRepeat(withTiming(1, { duration: FLOW_MS, easing: Easing.linear }), -1));
    glow.set(
      withRepeat(withTiming(1, { duration: GLOW_MS, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    twinkle.set(
      withRepeat(
        withTiming(1, { duration: TWINKLE_MS, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );

    return () => {
      cancelAnimation(charge);
      cancelAnimation(flow);
      cancelAnimation(glow);
      cancelAnimation(twinkle);
    };
  }, [charge, flow, glow, twinkle, reduceMotion]);

  const ring = useAnimatedProps(() => ({ strokeDashoffset: RING_LENGTH * (1 - charge.value) }));
  const led = useAnimatedProps(() => ({ opacity: 0.45 + charge.value * 0.55 }));
  const energy = useAnimatedProps(() => ({
    strokeDashoffset: (PULSE.dash + PULSE.gap) * (1 - flow.value),
  }));
  const halo = useAnimatedProps(() => ({
    r: 44 + glow.value * 6,
    opacity: 0.7 + glow.value * 0.3,
  }));
  const spark = useAnimatedProps(() => ({ opacity: 0.25 + twinkle.value * 0.75 }));

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessible={false}>
      <AnimatedCircle cx={60} cy={62} fill={withAlpha(c.accent, 0.16)} animatedProps={halo} />
      <AnimatedPath d={SPARK} fill={c.accent} animatedProps={spark} />

      {/* Pillar */}
      <Rect
        x={36}
        y={12}
        width={44}
        height={96}
        rx={22}
        fill={c.surface}
        stroke={withAlpha(c.textPrimary, 0.12)}
        strokeWidth={1.5}
      />
      <AnimatedRect
        x={48}
        y={21}
        width={20}
        height={4}
        rx={2}
        fill={c.accent}
        animatedProps={led}
      />

      {/* Charge ring around the bolt */}
      <Circle cx={RING.cx} cy={RING.cy} r={RING.r + 5} fill={c.textPrimary} />
      <Circle
        cx={RING.cx}
        cy={RING.cy}
        r={RING.r}
        fill="none"
        stroke={withAlpha(c.surface, 0.18)}
        strokeWidth={3}
      />
      <AnimatedCircle
        cx={RING.cx}
        cy={RING.cy}
        r={RING.r}
        fill="none"
        stroke={c.accent}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={[RING_LENGTH, RING_LENGTH]}
        transform={`rotate(-90 ${RING.cx} ${RING.cy})`}
        animatedProps={ring}
      />
      <Path d={BOLT} fill={c.accent} />

      <Rect x={47} y={74} width={22} height={3} rx={1.5} fill={withAlpha(c.textPrimary, 0.2)} />
      <Rect x={47} y={81} width={14} height={3} rx={1.5} fill={withAlpha(c.textPrimary, 0.12)} />

      {/* Base */}
      <Rect x={30} y={106} width={56} height={6} rx={3} fill={c.textPrimary} />

      {/* Cable coiling from the plug to the ground, with energy running along it */}
      <Path d={CABLE} stroke={c.textPrimary} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <AnimatedPath
        d={CABLE}
        stroke={c.accent}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={[PULSE.dash, PULSE.gap]}
        animatedProps={energy}
      />

      {/* Plug resting in its holster on the pillar's side */}
      <G>
        <Rect x={78} y={56} width={6} height={20} rx={2} fill={c.textPrimary} />
        <Rect x={82} y={60} width={16} height={24} rx={7} fill={c.textPrimary} />
        <Circle cx={87} cy={67} r={2} fill={c.accent} />
        <Circle cx={93} cy={67} r={2} fill={c.accent} />
        <Circle cx={90} cy={75} r={2.5} fill={withAlpha(c.surface, 0.5)} />
      </G>
    </Svg>
  );
};

export default StationsHeaderArt;
