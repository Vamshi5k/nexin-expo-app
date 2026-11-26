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
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme, withAlpha } from '@/shared/theme';

type StationsHeaderArtProps = {
  size: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Drawn in a 120 x 120 viewBox: a charger with its cable curling to a plug on the right.
const CABLE = 'M80 54 C98 54 104 68 102 82 C100 96 106 102 114 102';
const PULSE = { dash: 10, gap: 46 };
const BAR = { x: 39, y: 78, width: 34 };
const BOLT = 'M58 48 L50 58 H56 L54 66 L62 56 H56 Z';

const FLOW_MS = 1400;
const FILL_MS = 2600;
const GLOW_MS = 2200;

// The Stations header's illustration: a brand-coloured charger with energy running down its
// cable, the charge bar filling and a soft breathing glow. Still when Reduce Motion is on.
const StationsHeaderArt = ({ size }: StationsHeaderArtProps) => {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const flow = useSharedValue(0);
  const fill = useSharedValue(reduceMotion ? 1 : 0.2);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    flow.set(withRepeat(withTiming(1, { duration: FLOW_MS, easing: Easing.linear }), -1));
    fill.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: FILL_MS, easing: Easing.inOut(Easing.cubic) }),
          withTiming(1, { duration: FILL_MS / 3 }),
          withTiming(0.2, { duration: 0 }),
        ),
        -1,
      ),
    );
    glow.set(
      withRepeat(withTiming(1, { duration: GLOW_MS, easing: Easing.inOut(Easing.sin) }), -1, true),
    );

    return () => {
      cancelAnimation(flow);
      cancelAnimation(fill);
      cancelAnimation(glow);
    };
  }, [fill, flow, glow, reduceMotion]);

  const energy = useAnimatedProps(() => ({
    strokeDashoffset: (PULSE.dash + PULSE.gap) * (1 - flow.value),
  }));
  const bar = useAnimatedProps(() => ({ width: BAR.width * fill.value }));
  const halo = useAnimatedProps(() => ({
    r: 46 + glow.value * 6,
    opacity: 0.7 + glow.value * 0.3,
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessible={false}>
      <AnimatedCircle cx={64} cy={64} fill={withAlpha(c.accent, 0.16)} animatedProps={halo} />

      <Rect
        x={28}
        y={18}
        width={52}
        height={88}
        rx={12}
        fill={c.surface}
        stroke={withAlpha(c.textPrimary, 0.12)}
        strokeWidth={1.5}
      />
      <Rect x={28} y={18} width={52} height={18} rx={12} fill={c.accent} />
      <Rect x={28} y={30} width={52} height={6} fill={c.accent} />
      <Rect x={37} y={44} width={34} height={26} rx={6} fill={c.textPrimary} />
      <Path d={BOLT} fill={c.accent} />
      <Rect x={BAR.x} y={BAR.y} width={BAR.width} height={4} rx={2} fill={c.border} />
      <AnimatedRect x={BAR.x} y={BAR.y} height={4} rx={2} fill={c.accent} animatedProps={bar} />
      <Rect x={39} y={86} width={22} height={4} rx={2} fill={withAlpha(c.textPrimary, 0.2)} />
      <Rect x={22} y={104} width={64} height={6} rx={3} fill={c.textPrimary} />

      <Path d={CABLE} stroke={c.textPrimary} strokeWidth={4} strokeLinecap="round" fill="none" />
      <AnimatedPath
        d={CABLE}
        stroke={c.accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={[PULSE.dash, PULSE.gap]}
        animatedProps={energy}
      />
      <Rect x={108} y={96} width={10} height={12} rx={3} fill={c.textPrimary} />
    </Svg>
  );
};

export default StationsHeaderArt;
