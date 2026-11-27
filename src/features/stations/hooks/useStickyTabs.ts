import { useState } from 'react';

import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

// Parks the pinned copy far above the screen while it is not needed, so it can't catch taps.
const PARKED = -10000;

// The tabs scroll with the page as normal content. Once they reach the header, an identical
// copy outside the scroll view takes over, pinned under it. Nothing inside the scroll view is
// moved per frame, so scrolling back up stays smooth.
export const useStickyTabs = <T extends string>(
  initial: T,
  scrollY: SharedValue<number>,
  stickAt: number,
) => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [tab, setTab] = useState<T>(initial);

  const pinnedStyle = useAnimatedStyle(() => {
    const pinned = scrollY.value >= stickAt;
    return { opacity: pinned ? 1 : 0, transform: [{ translateY: pinned ? 0 : PARKED }] };
  });

  // A new tab starts at its top, with the tabs still pinned, instead of mid-way down.
  const selectTab = (next: T) => {
    if (next === tab) return;

    setTab(next);
    if (scrollY.get() > stickAt) scrollRef.current?.scrollTo({ y: stickAt, animated: false });
  };

  return { tab, selectTab, scrollRef, pinnedStyle };
};
