import { useState } from 'react';

import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

// The tab bar scrolls with the page until it reaches the header, then stays pinned under it.
export const useStickyTabs = <T extends string>(
  initial: T,
  scrollY: SharedValue<number>,
  stickAt: number,
) => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [tab, setTab] = useState<T>(initial);

  const tabsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(0, scrollY.value - stickAt) }],
  }));

  // A new tab starts at its top, with the tabs still pinned, instead of mid-way down.
  const selectTab = (next: T) => {
    if (next === tab) return;

    setTab(next);
    if (scrollY.get() > stickAt) scrollRef.current?.scrollTo({ y: stickAt, animated: false });
  };

  return { tab, selectTab, scrollRef, tabsStyle };
};
