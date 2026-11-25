import type { ReactNode } from 'react';
import {
  Pressable as RNPressable,
  type GestureResponderEvent,
  type PressableProps as RNPressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/theme';

import { haptics, type HapticKind } from '@/shared/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type PressableProps = Omit<RNPressableProps, 'style' | 'children'> & {
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
  children?: ReactNode;
  feedback?: 'scale' | 'opacity';
  haptic?: HapticKind | false;
};

export function Pressable({
  feedback = 'scale',
  haptic = false,
  onPressIn,
  onPressOut,
  onPress,
  style,
  disabled,
  hitSlop,
  ...rest
}: PressableProps) {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animated = useAnimatedStyle(() => {
    if (feedback === 'opacity' || reduceMotion) {
      return { opacity: 1 - pressed.value * (1 - t.motion.pressedOpacity) };
    }
    return { transform: [{ scale: 1 - pressed.value * (1 - t.motion.pressedScale) }] };
  });

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={hitSlop ?? 6}
      onPressIn={(e: GestureResponderEvent) => {
        pressed.value = withSpring(1, t.motion.spring);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        pressed.value = withSpring(0, t.motion.spring);
        onPressOut?.(e);
      }}
      onPress={(e: GestureResponderEvent) => {
        if (haptic) haptics[haptic]();
        onPress?.(e);
      }}
      style={[style, animated]}
      {...rest}
    />
  );
}
