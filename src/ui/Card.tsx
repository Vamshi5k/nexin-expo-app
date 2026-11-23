import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Pressable } from './Pressable';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  /** 'flat' = hairline border (default); 'floating' = soft shadow for floating items. */
  elevation?: 'flat' | 'floating';
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
  const base: ViewStyle = {
    backgroundColor: elevation === 'floating' ? t.colors.surfaceRaised : t.colors.surface,
    borderRadius: t.radius.card,
    borderWidth: t.layout.hairline,
    borderColor: t.colors.border,
    padding: padded ? t.layout.cardPadding : 0,
    ...(elevation === 'floating' ? t.shadow : null),
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
