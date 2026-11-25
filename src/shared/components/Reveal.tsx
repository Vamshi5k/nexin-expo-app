import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

import { motion } from '@/shared/theme';

export type RevealProps = {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
};

export function Reveal({ children, index = 0, style }: RevealProps) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.duration(motion.durationSlow)
        .delay(120 + index * motion.stagger)
        .easing(Easing.out(Easing.cubic))
        .withInitialValues({ transform: [{ translateY: 14 }] })}
    >
      {children}
    </Animated.View>
  );
}
