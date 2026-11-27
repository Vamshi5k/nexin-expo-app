import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

// Share of the scroll distance the hero lags behind, so it drifts away slower than the page.
const PARALLAX = 0.4;
// Share of the hero scrolled away before it starts fading out under the header.
const FADE_FROM = 0.35;

// The hero drifts up slower than the content and fades as it leaves, and stretches when the page is
// pulled down past the top (iOS bounce), keeping its top edge pinned.
export const useHeroParallax = (scrollY: SharedValue<number>, height: number) => {
  const reduceMotion = useReducedMotion();

  return useAnimatedStyle(() => {
    if (reduceMotion) return {};

    const y = scrollY.value;
    if (y < 0) {
      const scale = 1 + -y / height;
      return { transform: [{ translateY: y / 2 }, { scale }] };
    }

    const translateY = interpolate(y, [0, height], [0, height * PARALLAX], Extrapolation.CLAMP);
    const opacity = interpolate(y, [height * FADE_FROM, height], [1, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });
};
