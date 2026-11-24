import { CreditCard, MapPin, Zap, type LucideIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, type FlatList } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  interpolate,
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

import { ONBOARDING_SLIDES as SLIDES } from '../constants';
import { finishOnboarding } from '../hooks';
import type { OnboardingSlide as Slide } from '../types';

const SLIDE_ICONS: Record<Slide['key'], LucideIcon> = {
  find: MapPin,
  charge: Zap,
  pay: CreditCard,
};

export function OnboardingScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const list = useRef<FlatList<Slide>>(null);
  const x = useSharedValue(0);
  const spin = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;
  const lastOffset = (SLIDES.length - 1) * width;

  useEffect(() => {
    if (reduceMotion) return;
    spin.set(withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1, false));
  }, [spin, reduceMotion]);

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  const skip = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [lastOffset - width, lastOffset], [1, 0], Extrapolation.CLAMP),
  }));

  const next = () => {
    if (last) return finishOnboarding();
    list.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <AmbientBackground />
      <View
        style={[styles.topBar, { paddingLeft: t.layout.screenPadding, paddingRight: t.space[2] }]}
      >
        <Animated.View key={index} entering={FadeIn.duration(t.motion.duration)}>
          <Text variant="caption" tone="secondary" tabular accessibilityElementsHidden>
            {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </Text>
        </Animated.View>
        <Animated.View style={skip} pointerEvents={last ? 'none' : 'auto'}>
          <Button
            label="Skip"
            variant="ghost"
            size="medium"
            haptic={false}
            onPress={finishOnboarding}
          />
        </Animated.View>
      </View>

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
          <SlideView slide={item} index={i} width={width} x={x} spin={spin} />
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
        <View style={[styles.segments, { gap: t.space[2] }]} accessibilityElementsHidden>
          {SLIDES.map((s, i) => (
            <Segment key={s.key} index={i} width={width} x={x} />
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
  spin,
}: {
  slide: Slide;
  index: number;
  width: number;
  x: SharedValue<number>;
  spin: SharedValue<number>;
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
          [-width * 0.4, 0, width * 0.4],
          Extrapolation.CLAMP,
        ),
      },
      { scale: interpolate(x.value, range, [0.86, 1, 0.86], Extrapolation.CLAMP) },
    ],
  }));
  const title = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(
          x.value,
          range,
          [width * 0.2, 0, -width * 0.2],
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
          [width * 0.35, 0, -width * 0.35],
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
          <Art icon={SLIDE_ICONS[slide.key]} spin={spin} />
        </Reveal>
      </Animated.View>
      <View style={{ gap: t.space[2], paddingBottom: t.space[5] }}>
        <Animated.View style={title}>
          <Reveal index={1}>
            <Text variant="hero">{slide.title}</Text>
          </Reveal>
        </Animated.View>
        <Animated.View style={body}>
          <Reveal index={2}>
            <Text variant="callout" tone="secondary">
              {slide.description}
            </Text>
          </Reveal>
        </Animated.View>
      </View>
    </View>
  );
}

const OUTER = 216;
const INNER = 152;

function Art({ icon: Icon, spin }: { icon: LucideIcon; spin: SharedValue<number> }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={[styles.center, { width: OUTER, height: OUTER }]}>
      <View
        style={[
          styles.abs,
          {
            width: OUTER,
            height: OUTER,
            borderRadius: OUTER / 2,
            borderWidth: 1,
            borderColor: c.border,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          { width: INNER, height: INNER, borderRadius: INNER / 2, backgroundColor: c.accentSoft },
        ]}
      />
      <Orbit size={OUTER} dot={8} color={c.accent} spin={spin} turns={1} />
      <Orbit size={INNER} dot={6} color={c.textPrimary} spin={spin} turns={-2} />
      <View
        style={[
          styles.center,
          { width: 76, height: 76, borderRadius: 24, backgroundColor: c.accent },
        ]}
      >
        <Icon color={c.onAccent} size={32} strokeWidth={1.75} />
      </View>
    </View>
  );
}

function Orbit({
  size,
  dot,
  color,
  spin,
  turns,
}: {
  size: number;
  dot: number;
  color: string;
  spin: SharedValue<number>;
  turns: number;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360 * turns}deg` }],
  }));
  return (
    <Animated.View style={[styles.abs, { width: size, height: size }, style]}>
      <View
        style={{
          position: 'absolute',
          top: -dot / 2,
          left: size / 2 - dot / 2,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: color,
        }}
      />
    </Animated.View>
  );
}

function Segment({ index, width, x }: { index: number; width: number; x: SharedValue<number> }) {
  const t = useTheme();
  const fill = useAnimatedStyle(() => ({
    transform: [
      { scaleX: interpolate(x.value / width, [index - 1, index], [0, 1], Extrapolation.CLAMP) },
    ],
  }));
  return (
    <View
      style={[styles.segment, { backgroundColor: t.colors.border, borderRadius: t.radius.pill }]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: t.colors.accent, transformOrigin: 'left' },
          fill,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slide: { flex: 1, justifyContent: 'flex-end' },
  artArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute' },
  segments: { flexDirection: 'row' },
  segment: { flex: 1, height: 3, overflow: 'hidden' },
});
