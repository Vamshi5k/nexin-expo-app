import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

import { motion } from '@/shared/theme';

export type AppRevealProps = {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
};

const AppReveal = ({ children, index = 0, style }: AppRevealProps) => {
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
};

export default AppReveal;
