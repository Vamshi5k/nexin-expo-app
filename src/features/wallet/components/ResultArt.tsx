import { useEffect } from 'react';

import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme, withAlpha } from '@/shared/theme';

type ResultArtProps = {
  kind: 'success' | 'failed' | 'unconfirmed';
  size: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// 120 x 120 viewBox. The ring draws itself, then the mark inside does.
const RING_R = 34;
const RING_LENGTH = 2 * Math.PI * RING_R;
const MARK_LENGTH = 70;
const MARKS = {
  success: ['M45 61 L56 72 L77 50'],
  failed: ['M49 49 L71 71', 'M71 49 L49 71'],
  unconfirmed: ['M60 44 V61 L70 68'],
};
// Little sparks that burst out once the payment lands.
const SPARKS = [
  { x: 60, y: 14 },
  { x: 100, y: 32 },
  { x: 104, y: 78 },
  { x: 20, y: 34 },
  { x: 16, y: 80 },
  { x: 60, y: 108 },
];

const DRAW_MS = 520;

// The payment result: a ring and a check (green), a cross (red) or a clock (amber, the payment
// is still being confirmed). Drawn once on open; shown complete with Reduce Motion on.
const ResultArt = ({ kind, size }: ResultArtProps) => {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const ring = useSharedValue(reduceMotion ? 1 : 0);
  const mark = useSharedValue(reduceMotion ? 1 : 0);
  const burst = useSharedValue(reduceMotion ? 1 : 0);
  const spin = useSharedValue(0);

  const tones = { success: c.success, failed: c.danger, unconfirmed: c.warning };
  const tone = tones[kind];

  useEffect(() => {
    if (reduceMotion) return;

    const ease = Easing.out(Easing.cubic);
    ring.set(withTiming(1, { duration: DRAW_MS, easing: ease }));
    mark.set(withDelay(DRAW_MS * 0.7, withTiming(1, { duration: DRAW_MS, easing: ease })));
    burst.set(withDelay(DRAW_MS * 1.2, withTiming(1, { duration: DRAW_MS * 1.4, easing: ease })));
    if (kind === 'unconfirmed') {
      spin.set(withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1));
    }
  }, [burst, kind, mark, reduceMotion, ring, spin]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: RING_LENGTH * (1 - ring.value) }));
  const markProps = useAnimatedProps(() => ({ strokeDashoffset: MARK_LENGTH * (1 - mark.value) }));
  const halo = useAnimatedProps(() => ({ r: 40 + ring.value * 8 }));
  const sparkProps = useAnimatedProps(() => ({
    // Fades in and out once.
    opacity: Math.sin(Math.PI * burst.value),
    r: 2 + burst.value * 2,
  }));
  const pulse = useAnimatedProps(() => ({
    strokeDashoffset: RING_LENGTH * (1 - spin.value),
    opacity: 0.35,
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessible={false}>
      <AnimatedCircle cx={60} cy={60} fill={withAlpha(tone, 0.14)} animatedProps={halo} />
      <Circle cx={60} cy={60} r={RING_R} fill={c.surface} />
      <AnimatedCircle
        cx={60}
        cy={60}
        r={RING_R}
        fill="none"
        stroke={tone}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={[RING_LENGTH, RING_LENGTH]}
        transform="rotate(-90 60 60)"
        animatedProps={ringProps}
      />
      {kind === 'unconfirmed' ? (
        <AnimatedCircle
          cx={60}
          cy={60}
          r={RING_R + 9}
          fill="none"
          stroke={tone}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={[RING_LENGTH * 0.25, RING_LENGTH]}
          transform="rotate(-90 60 60)"
          animatedProps={pulse}
        />
      ) : null}
      {MARKS[kind].map(d => (
        <AnimatedPath
          key={d}
          d={d}
          fill="none"
          stroke={tone}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[MARK_LENGTH, MARK_LENGTH]}
          animatedProps={markProps}
        />
      ))}
      {kind === 'success'
        ? SPARKS.map(spark => (
            <AnimatedCircle
              key={`${spark.x}-${spark.y}`}
              cx={spark.x}
              cy={spark.y}
              fill={tone}
              animatedProps={sparkProps}
            />
          ))
        : null}
    </Svg>
  );
};

export default ResultArt;
