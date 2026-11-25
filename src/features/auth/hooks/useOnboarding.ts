import { useEffect, useState, type RefObject } from 'react';
import {
  useWindowDimensions,
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { router } from 'expo-router';
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ONBOARDING_SLIDES, START_HREF } from '../constants/auth.constants';
import type { OnboardingSlide } from '../types/auth.types';
import { markOnboardingDone } from '../utils/authFlow';

const finishOnboarding = (): void => {
  markOnboardingDone();
  router.replace(START_HREF.login);
};

// The screen owns the list ref and passes it in: returning a ref from a hook makes the React
// Compiler reject every read of the result.
export const useOnboarding = (list: RefObject<FlatList<OnboardingSlide> | null>) => {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  const spin = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const count = ONBOARDING_SLIDES.length;
  const last = index === count - 1;
  const lastOffset = (count - 1) * width;

  useEffect(() => {
    if (reduceMotion) return;
    spin.set(withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1, false));
  }, [spin, reduceMotion]);

  const onScroll = useAnimatedScrollHandler(e => {
    x.value = e.contentOffset.x;
  });

  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [lastOffset - width, lastOffset], [1, 0], Extrapolation.CLAMP),
  }));

  const next = () => {
    if (last) return finishOnboarding();
    list.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return {
    slides: ONBOARDING_SLIDES,
    count,
    index,
    last,
    width,
    x,
    spin,
    onScroll,
    onScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) =>
      setIndex(Math.round(e.nativeEvent.contentOffset.x / width)),
    skipStyle,
    next,
    skip: finishOnboarding,
  };
};
