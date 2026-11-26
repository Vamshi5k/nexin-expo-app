import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

// Share of the scroll distance the hero lags behind, so it drifts away slower than the page.
const PARALLAX = 0.4;

// The hero drifts up slower than the content when scrolling, and stretches when the page is
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
    return { transform: [{ translateY }] };
  });
};
