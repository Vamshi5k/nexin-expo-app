import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';
import { useKeyboardOpen } from '@/ui';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// The car is drawn past the right edge (x > 360): the viewBox crops its rear half on purpose.
const VIEW_BOX = '0 30 360 150';

const CABLE = 'M99 136 C112 172 160 178 178 160 C188 150 191 136 196 130';
const PULSE = { dash: 9, gap: 60 };
const RING = { cx: 65, cy: 91, r: 9 };
const RING_LENGTH = 2 * Math.PI * RING.r;
const LED = 46;
const BAR = 50;

// Side profile facing left (nose at the charger). Sill at y=152, front arch around the wheel.
const BODY =
  'M172 148 C168 142 168 133 172 128 C177 122 187 119 199 118 L252 112 C268 97 287 85 311 81 L430 78 V152 H251 A29 29 0 0 0 193 152 H180 C175 152 172 151 172 148 Z';
const SIDE_GLASS = 'M263 111 C277 99 293 90 313 87 L370 86 V111 Z';
const MIRROR = 'M250 112 L258 105 H266 L263 112 Z';
const WHEELS = [222, 400];
const SPOKES = [0, 72, 144, 216, 288];

const BOLT_SCREEN = 'M66.5 85 L61.5 92 H65.5 L64.5 97 L69.5 90 H65.5 Z';
const BOLT_CHIP = 'M227.5 54 L221 63 H226 L224.5 68 L231 59 H226 Z';

// Hidden while the keyboard is up, so the form gets the space.
export function ChargingIllustration() {
  const t = useTheme();
  const keyboardOpen = useKeyboardOpen();
  if (keyboardOpen) return null;
  return (
    <Animated.View entering={FadeIn.duration(t.motion.durationSlow)} style={styles.wrap}>
      <ChargingScene />
    </Animated.View>
  );
}

function ChargingScene() {
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
  const led = useAnimatedProps(() => ({ width: LED * charge.value }));
  const bar = useAnimatedProps(() => ({ width: BAR * charge.value }));

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Electric car charging at a station"
    >
      <Svg width="100%" height="100%" viewBox={VIEW_BOX} preserveAspectRatio="xMidYMid meet">
        <Circle cx={300} cy={108} r={92} fill={c.accentSoft} />
        <Rect x={0} y={172} width={360} height={5} rx={2.5} fill={c.surfaceSunken} />

        {/* DC fast charger */}
        <Rect x={26} y={164} width={78} height={9} rx={3} fill={c.textPrimary} />
        <Rect
          x={32}
          y={46}
          width={66}
          height={120}
          rx={14}
          fill={c.surface}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <Path d="M32 60 V60 Q32 46 46 46 H84 Q98 46 98 60 V64 H32 Z" fill={c.accent} />
        <Rect x={42} y={74} width={46} height={34} rx={6} fill={c.textPrimary} />
        <Circle
          cx={RING.cx}
          cy={RING.cy}
          r={RING.r}
          fill="none"
          stroke={c.surface}
          strokeOpacity={0.2}
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
        <Path d={BOLT_SCREEN} fill={c.accent} />
        <Rect x={42} y={116} width={LED} height={4} rx={2} fill={c.border} />
        <AnimatedRect x={42} y={116} height={4} rx={2} fill={c.accent} animatedProps={led} />
        <Rect x={42} y={128} width={20} height={3} rx={1.5} fill={c.border} />
        <Rect x={42} y={136} width={30} height={3} rx={1.5} fill={c.border} />
        <Rect x={92} y={116} width={12} height={22} rx={4} fill={c.textPrimary} />

        {/* Cable, plugged into the car's front fender */}
        <Path d={CABLE} fill="none" stroke={c.textPrimary} strokeWidth={4} strokeLinecap="round" />
        <AnimatedPath
          d={CABLE}
          fill="none"
          stroke={c.accent}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={[PULSE.dash, PULSE.gap]}
          animatedProps={energy}
        />

        {/* Car: front half visible, rear runs off the right edge */}
        <Path d={BODY} fill={c.textPrimary} />
        <Path d={SIDE_GLASS} fill={c.surface} opacity={0.2} />
        <Path d="M330 87 V111" stroke={c.textPrimary} strokeWidth={4} />
        <Path d={MIRROR} fill={c.surface} opacity={0.3} />
        <Path d="M174 127 L197 121" stroke={c.accent} strokeWidth={3} strokeLinecap="round" />
        <Path d="M176 140 H190" stroke={c.surface} strokeOpacity={0.25} strokeWidth={2} />
        <Path d="M200 132 H360" stroke={c.accent} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M300 112 V150" stroke={c.surface} strokeOpacity={0.15} strokeWidth={1.5} />
        <Rect x={312} y={119} width={14} height={3} rx={1.5} fill={c.surface} opacity={0.35} />
        <Rect x={194} y={124} width={12} height={10} rx={2.5} fill={c.accent} />
        <Rect x={188} y={125} width={8} height={8} rx={2} fill={c.textPrimary} />
        {WHEELS.map(cx => (
          <Wheel key={cx} cx={cx} tire={c.textPrimary} rim={c.surface} hub={c.accent} />
        ))}

        {/* Floating battery chip above the car */}
        <Rect
          x={208}
          y={45}
          width={100}
          height={30}
          rx={15}
          fill={c.surface}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <Circle cx={226} cy={60} r={10} fill={c.accent} />
        <Path d={BOLT_CHIP} fill={c.onAccent} />
        <Rect x={243} y={57} width={BAR} height={6} rx={3} fill={c.accentSoft} />
        <AnimatedRect x={243} y={57} height={6} rx={3} fill={c.accent} animatedProps={bar} />
      </Svg>
    </View>
  );
}

function Wheel({ cx, tire, rim, hub }: { cx: number; tire: string; rim: string; hub: string }) {
  const cy = 150;
  return (
    <>
      <Circle cx={cx} cy={cy} r={22} fill={tire} />
      <Circle cx={cx} cy={cy} r={14} fill={rim} opacity={0.85} />
      {SPOKES.map(deg => {
        const a = (deg * Math.PI) / 180;
        return (
          <Path
            key={deg}
            d={`M${cx} ${cy} L${cx + Math.cos(a) * 13} ${cy + Math.sin(a) * 13}`}
            stroke={tire}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={cx} cy={cy} r={4} fill={tire} />
      <Circle cx={cx} cy={cy} r={1.8} fill={hub} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: '100%', minHeight: 0, alignSelf: 'center' },
});
