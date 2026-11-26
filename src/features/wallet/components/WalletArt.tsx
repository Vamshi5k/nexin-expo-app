import { useEffect } from 'react';

import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme, withAlpha } from '@/shared/theme';

type WalletArtProps = {
  size: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Drawn in a 120 x 120 viewBox, for a dark card: a wallet with a charge card peeking out and
// two energy coins floating above it.
const CARD = { x: 30, y: 30, width: 54, height: 34 };
const CARD_RISE = 8;
const COINS = [
  { cx: 92, cy: 26, r: 11, delay: 0 },
  { cx: 104, cy: 48, r: 7, delay: 500 },
];
const COIN_FLOAT = 5;
const CARD_MS = 1800;
const COIN_MS = 1600;

// The balance card's illustration. The card slides in and out of the wallet and the coins bob;
// all still with Reduce Motion on. Theme colours only, so every brand gets its own.
const WalletArt = ({ size }: WalletArtProps) => {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const rise = useSharedValue(0);
  const float = useSharedValue(0);
  const floatLate = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    const ease = Easing.inOut(Easing.sin);
    rise.set(withRepeat(withTiming(1, { duration: CARD_MS, easing: ease }), -1, true));
    float.set(withRepeat(withTiming(1, { duration: COIN_MS, easing: ease }), -1, true));
    floatLate.set(
      withDelay(
        COINS[1]!.delay,
        withRepeat(withTiming(1, { duration: COIN_MS, easing: ease }), -1, true),
      ),
    );

    return () => {
      cancelAnimation(rise);
      cancelAnimation(float);
      cancelAnimation(floatLate);
    };
  }, [float, floatLate, reduceMotion, rise]);

  const card = useAnimatedProps(() => ({ y: CARD.y - rise.value * CARD_RISE }));
  const cardStripe = useAnimatedProps(() => ({ y: CARD.y + 8 - rise.value * CARD_RISE }));
  const coinA = useAnimatedProps(() => ({ cy: COINS[0]!.cy - float.value * COIN_FLOAT }));
  const coinARing = useAnimatedProps(() => ({ cy: COINS[0]!.cy - float.value * COIN_FLOAT }));
  const coinB = useAnimatedProps(() => ({ cy: COINS[1]!.cy - floatLate.value * COIN_FLOAT }));

  const [a, b] = COINS;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessible={false}>
      <Circle cx={60} cy={66} r={50} fill={withAlpha(c.accent, 0.18)} />

      {/* Card sliding out of the wallet */}
      <AnimatedRect
        x={CARD.x}
        width={CARD.width}
        height={CARD.height}
        rx={6}
        fill={c.accent}
        animatedProps={card}
      />
      <AnimatedRect
        x={CARD.x}
        width={CARD.width}
        height={5}
        fill={withAlpha(c.textPrimary, 0.25)}
        animatedProps={cardStripe}
      />

      {/* Wallet */}
      <Rect x={20} y={48} width={78} height={54} rx={14} fill={c.surface} />
      <Path
        d="M20 62 Q20 48 34 48 H84 Q98 48 98 62 V64 H20 Z"
        fill={withAlpha(c.textPrimary, 0.08)}
      />
      <Rect x={70} y={66} width={32} height={22} rx={11} fill={c.surfaceSunken} />
      <Circle cx={81} cy={77} r={5} fill={c.accent} />
      <Rect x={30} y={88} width={24} height={4} rx={2} fill={withAlpha(c.textPrimary, 0.15)} />

      {/* Energy coins */}
      <AnimatedCircle cx={a!.cx} r={a!.r} fill={c.accent} animatedProps={coinA} />
      <AnimatedCircle
        cx={a!.cx}
        r={a!.r - 3}
        fill="none"
        stroke={withAlpha(c.surface, 0.6)}
        strokeWidth={1.5}
        animatedProps={coinARing}
      />
      <AnimatedCircle cx={b!.cx} r={b!.r} fill={withAlpha(c.accent, 0.75)} animatedProps={coinB} />
    </Svg>
  );
};

export default WalletArt;
