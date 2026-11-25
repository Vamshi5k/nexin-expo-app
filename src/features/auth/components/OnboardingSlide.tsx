import { StyleSheet, View } from 'react-native';

import { CreditCard, MapPin, Zap, type LucideIcon } from 'lucide-react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { AppReveal, AppText } from '@/shared/components';

import { OnboardingArt } from './OnboardingArt';

import { useTheme } from '@/shared/theme';

import type { OnboardingSlide as Slide } from '../types';

const SLIDE_ICONS: Record<Slide['key'], LucideIcon> = {
  find: MapPin,
  charge: Zap,
  pay: CreditCard,
};

export function OnboardingSlide({
  slide,
  index,
  count,
  width,
  x,
  spin,
}: {
  slide: Slide;
  index: number;
  count: number;
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
      accessibilityLabel={`Slide ${index + 1} of ${count}. ${slide.title}. ${slide.description}`}
      style={[styles.slide, { width, paddingHorizontal: t.layout.screenPadding }]}
    >
      <Animated.View style={[styles.artArea, art]}>
        <AppReveal index={0}>
          <OnboardingArt icon={SLIDE_ICONS[slide.key]} spin={spin} />
        </AppReveal>
      </Animated.View>
      <View style={{ gap: t.space[2], paddingBottom: t.space[5] }}>
        <Animated.View style={title}>
          <AppReveal index={1}>
            <AppText variant="hero">{slide.title}</AppText>
          </AppReveal>
        </Animated.View>
        <Animated.View style={body}>
          <AppReveal index={2}>
            <AppText variant="callout" tone="secondary">
              {slide.description}
            </AppText>
          </AppReveal>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { flex: 1, justifyContent: 'flex-end' },
  artArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
