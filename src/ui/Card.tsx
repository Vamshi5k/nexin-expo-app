import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Pressable } from './Pressable';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
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
  // Flat everywhere: an elevated card is the raised surface with a stronger hairline, no shadow.
  const elevated = elevation === 'elevated';
  const base: ViewStyle = {
    backgroundColor: elevated ? t.colors.surfaceRaised : t.colors.surface,
    borderRadius: t.radius.card,
    borderWidth: t.layout.hairline,
    borderColor: elevated ? t.colors.borderStrong : t.colors.border,
    padding: padded ? t.layout.cardPadding : 0,
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
