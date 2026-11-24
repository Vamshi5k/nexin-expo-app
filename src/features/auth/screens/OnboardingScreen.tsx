import { router } from 'expo-router';
import { CreditCard, MapPin, Zap, type LucideIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, type FlatList } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { AmbientBackground, Button, Reveal, Text } from '@/ui';

import { markOnboardingDone, START_HREF } from '../utils';

type Slide = { key: string; icon: LucideIcon; title: string; description: string };

const SLIDES: Slide[] = [
  {
    key: 'find',
    icon: MapPin,
    title: 'Find Chargers',
    description: 'Discover nearby charging stations with live availability and pricing',
  },
  {
    key: 'charge',
    icon: Zap,
    title: 'Start Charging',
    description: 'Select a charger, enter amount, and start or stop charging instantly',
  },
  {
    key: 'pay',
    icon: CreditCard,
    title: 'Pay & Track',
    description: 'Make secure payments, track sessions, manage vehicles, and get updates',
  },
];

export function OnboardingScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const list = useRef<FlatList<Slide>>(null);
  const x = useSharedValue(0);
  const breathe = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;
  const lastOffset = (SLIDES.length - 1) * width;

  useEffect(() => {
    if (reduceMotion) return;
    breathe.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breathe, reduceMotion]);

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  const skip = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [lastOffset - width, lastOffset], [1, 0], Extrapolation.CLAMP),
  }));

  const finish = () => {
    markOnboardingDone();
    router.replace(START_HREF.login);
  };

  const next = () => {
    if (last) return finish();
    list.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <AmbientBackground />
      <Animated.View
        style={[styles.topBar, { paddingHorizontal: t.space[2] }, skip]}
        pointerEvents={last ? 'none' : 'auto'}
      >
        <Button label="Skip" variant="ghost" size="medium" haptic={false} onPress={finish} />
      </Animated.View>

      <Animated.FlatList
        ref={list}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index: i }) => (
          <SlideView slide={item} index={i} width={width} x={x} breathe={breathe} />
        )}
      />

      <Reveal
        index={3}
        style={{
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[2],
          gap: t.space[6],
        }}
      >
        <View style={[styles.dots, { gap: t.space[2] }]} accessibilityElementsHidden>
          {SLIDES.map((s, i) => (
            <Dot key={s.key} index={i} width={width} x={x} />
          ))}
        </View>
        <Button label={last ? 'Get Started' : 'Next'} onPress={next} />
      </Reveal>
    </View>
  );
}

function SlideView({
  slide,
  index,
  width,
  x,
  breathe,
}: {
  slide: Slide;
  index: number;
  width: number;
  x: SharedValue<number>;
  breathe: SharedValue<number>;
}) {
  const t = useTheme();
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  // Art lags the page and text leads it, so each swipe has a little depth.
  const art = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(
          x.value,
          range,
          [-width * 0.35, 0, width * 0.35],
          Extrapolation.CLAMP,
        ),
      },
      { scale: interpolate(x.value, range, [0.8, 1, 0.8], Extrapolation.CLAMP) },
    ],
  }));
  const title = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(
          x.value,
          range,
          [width * 0.25, 0, -width * 0.25],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const body = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(
          x.value,
          range,
          [width * 0.4, 0, -width * 0.4],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View
      accessible
      accessibilityLabel={`Slide ${index + 1} of ${SLIDES.length}. ${slide.title}. ${slide.description}`}
      style={[styles.slide, { width, paddingHorizontal: t.layout.screenPadding }]}
    >
      <Animated.View style={[styles.artArea, art]}>
        <Reveal index={0}>
          <Art icon={slide.icon} breathe={breathe} />
        </Reveal>
      </Animated.View>
      <View style={{ gap: t.space[3], paddingBottom: t.space[4] }}>
        <Animated.View style={title}>
          <Reveal index={1}>
            <Text variant="display">{slide.title}</Text>
          </Reveal>
        </Animated.View>
        <Animated.View style={body}>
          <Reveal index={2}>
            <Text variant="body" tone="secondary">
              {slide.description}
            </Text>
          </Reveal>
        </Animated.View>
      </View>
    </View>
  );
}

const RINGS = [260, 196, 136];

function Art({ icon: Icon, breathe }: { icon: LucideIcon; breathe: SharedValue<number> }) {
  const t = useTheme();
  return (
    <View style={[styles.center, { width: RINGS[0], height: RINGS[0] }]}>
      {RINGS.map((size, i) => (
        <Ring key={size} size={size} order={i} breathe={breathe} />
      ))}
      <View
        style={[
          styles.center,
          t.shadow,
          { width: 88, height: 88, borderRadius: 28, backgroundColor: t.colors.accent },
        ]}
      >
        <Icon color={t.colors.onAccent} size={38} strokeWidth={1.75} />
      </View>
    </View>
  );
}

function Ring({
  size,
  order,
  breathe,
}: {
  size: number;
  order: number;
  breathe: SharedValue<number>;
}) {
  const t = useTheme();
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (0.03 + order * 0.015) * breathe.value }],
    opacity: 1 - 0.25 * breathe.value * (2 - order) * 0.5,
  }));
  return (
    <Animated.View
      style={[
        styles.ring,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: t.colors.accentSoft,
          backgroundColor: order === RINGS.length - 1 ? t.colors.accentSoft : 'transparent',
        },
      ]}
    />
  );
}

function Dot({ index, width, x }: { index: number; width: number; x: SharedValue<number> }) {
  const t = useTheme();
  const range = [(index - 1) * width, index * width, (index + 1) * width];
  const idle = t.colors.borderStrong;
  const active = t.colors.accent;
  const style = useAnimatedStyle(() => ({
    width: interpolate(x.value, range, [6, 28, 6], Extrapolation.CLAMP),
    backgroundColor: interpolateColor(x.value, range, [idle, active, idle]),
  }));
  return <Animated.View style={[style, { height: 6, borderRadius: t.radius.pill }]} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { height: 52, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  slide: { flex: 1, justifyContent: 'flex-end' },
  artArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1.5 },
  dots: { flexDirection: 'row' },
});
