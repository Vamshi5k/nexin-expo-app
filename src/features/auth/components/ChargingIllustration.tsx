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

const CABLE = 'M96 122 C124 122 112 168 136 164 C148 162 146 138 154 136';
const DASH = 10;
const BATTERY = 46;

// Flat EV-at-charger scene drawn from theme tokens; energy flows down the cable and the battery fills.
export function ChargingIllustration() {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const flow = useSharedValue(0);
  const charge = useSharedValue(reduceMotion ? 1 : 0.25);

  useEffect(() => {
    if (reduceMotion) return;
    flow.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false));
    charge.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.cubic) }),
          withTiming(1, { duration: 700 }),
          withTiming(0.25, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
  }, [flow, charge, reduceMotion]);

  const energy = useAnimatedProps(() => ({ strokeDashoffset: DASH * 2 * (1 - flow.value) }));
  const level = useAnimatedProps(() => ({ width: BATTERY * charge.value }));

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Electric car charging at a station"
    >
      <Svg width="100%" height="100%" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet">
        <Circle cx={212} cy={112} r={80} fill={c.accentSoft} />
        <Path d="M16 172 H304" stroke={c.border} strokeWidth={2} strokeLinecap="round" />

        <Rect x={36} y={58} width={60} height={112} rx={12} fill={c.accent} />
        <Rect x={30} y={50} width={72} height={14} rx={7} fill={c.textPrimary} />
        <Rect x={48} y={76} width={36} height={30} rx={6} fill={c.surface} />
        <Path d="M68 80 L58 93 H66 L63 102 L74 88 H66 Z" fill={c.accent} />
        <Rect x={48} y={116} width={36} height={4} rx={2} fill={c.onAccent} opacity={0.35} />
        <Rect x={48} y={126} width={24} height={4} rx={2} fill={c.onAccent} opacity={0.35} />
        <Rect x={30} y={166} width={72} height={8} rx={4} fill={c.textPrimary} />
        <Circle cx={96} cy={122} r={5} fill={c.textPrimary} />

        <Path d={CABLE} fill="none" stroke={c.textPrimary} strokeWidth={4} strokeLinecap="round" />
        <AnimatedPath
          d={CABLE}
          fill="none"
          stroke={c.accent}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={[DASH * 0.4, DASH * 1.6]}
          animatedProps={energy}
        />

        <Path
          d="M150 150 V132 Q150 122 160 120 L184 116 L206 96 Q212 90 222 90 H258 Q268 90 274 98 L290 118 Q302 121 302 132 V150 Q302 156 296 156 H156 Q150 156 150 150 Z"
          fill={c.surface}
          stroke={c.textPrimary}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <Path
          d="M210 116 L222 100 Q225 97 229 97 H238 V116 Z"
          fill={c.accentSoft}
          stroke={c.textPrimary}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path
          d="M244 97 H258 Q263 97 266 101 L276 116 H244 Z"
          fill={c.accentSoft}
          stroke={c.textPrimary}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path d="M160 132 H292" stroke={c.accent} strokeWidth={3} strokeLinecap="round" />
        <Rect x={290} y={124} width={8} height={5} rx={2.5} fill={c.accent} />
        <Rect x={151} y={131} width={6} height={10} rx={2} fill={c.accent} />
        <Circle cx={186} cy={158} r={14} fill={c.textPrimary} />
        <Circle cx={186} cy={158} r={5} fill={c.surface} />
        <Circle cx={268} cy={158} r={14} fill={c.textPrimary} />
        <Circle cx={268} cy={158} r={5} fill={c.surface} />

        <Rect
          x={206}
          y={58}
          width={56}
          height={22}
          rx={11}
          fill={c.surface}
          stroke={c.textPrimary}
          strokeWidth={2}
        />
        <Rect x={263} y={65} width={4} height={8} rx={2} fill={c.textPrimary} />
        <AnimatedRect x={211} y={63} height={12} rx={6} fill={c.accent} animatedProps={level} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: '100%', maxWidth: 340, minHeight: 0, alignSelf: 'center' },
});
