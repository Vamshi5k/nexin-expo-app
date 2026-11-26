import { useState } from 'react';

import {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// Over the hero the header is just floating buttons; past it, a solid bar with the title fades
// in so nothing shows through behind it.
export const useHeaderReveal = (revealAt: number, fadeDistance: number) => {
  const scrollY = useSharedValue(0);
  const [revealed, setRevealed] = useState(false);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  useAnimatedReaction(
    () => scrollY.value >= revealAt,
    (now, before) => {
      if (now !== before) scheduleOnRN(setRevealed, now);
    },
    [revealAt],
  );

  const progress = () => {
    'worklet';
    return interpolate(
      scrollY.value,
      [revealAt - fadeDistance, revealAt],
      [0, 1],
      Extrapolation.CLAMP,
    );
  };

  const barStyle = useAnimatedStyle(() => ({ opacity: progress() }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: progress() }));

  return { onScroll, barStyle, titleStyle, revealed };
};
