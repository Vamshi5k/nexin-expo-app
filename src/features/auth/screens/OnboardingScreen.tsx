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
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { AmbientBackground, Button, Reveal, Text } from '@/ui';

import { OnboardingProgress } from '../components/OnboardingProgress';
import { OnboardingSlide } from '../components/OnboardingSlide';
import { ONBOARDING_SLIDES as SLIDES } from '../constants';
import { finishOnboarding } from '../hooks';
import type { OnboardingSlide as Slide } from '../types';

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
          <OnboardingSlide
            slide={item}
            index={i}
            count={SLIDES.length}
            width={width}
            x={x}
            spin={spin}
          />
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
        <OnboardingProgress count={SLIDES.length} width={width} x={x} />
        <Button label={last ? 'Get Started' : 'Next'} onPress={next} />
      </Reveal>
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
});
