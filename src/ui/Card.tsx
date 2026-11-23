import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Pressable } from './Pressable';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  /**
   * 'flat' (default): white surface with a neutral hairline border.
   * 'elevated': the one soft shadow level, for hero cards and floating items. In dark mode,
   * where shadows don't read, it is a raised surface with a hairline border instead.
   */
  elevation?: 'flat' | 'elevated';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({
  children,
  onPress,
  elevation = 'flat',
  padded = true,
  style,
  accessibilityLabel,
}: CardProps) {
  const t = useTheme();
  const elevated = elevation === 'elevated';
  const light = t.scheme === 'light';
  const base: ViewStyle = {
    backgroundColor: elevated ? t.colors.surfaceRaised : t.colors.surface,
    borderRadius: t.radius.card,
    borderWidth: elevated && light ? 0 : t.layout.hairline,
    borderColor: t.colors.border,
    padding: padded ? t.layout.cardPadding : 0,
    ...(elevated && light ? t.shadow : null),
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[base, style]} accessibilityLabel={accessibilityLabel}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
