import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type Palette } from '@/theme';

import type { HapticKind } from './haptics';
import { Pressable } from './Pressable';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline';

export type ButtonSize = 'large' | 'medium';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: HapticKind | false;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

type VariantColors = { bg: string; fg: string; border: string; borderWidth: number };

function colorsFor(variant: ButtonVariant, c: Palette): VariantColors {
  switch (variant) {
    case 'primary':
      return { bg: c.accent, fg: c.onAccent, border: c.accent, borderWidth: 0 };
    case 'secondary':
      return { bg: c.surface, fg: c.textPrimary, border: c.borderStrong, borderWidth: 1 };
    case 'ghost':
      return { bg: 'transparent', fg: c.accentText, border: 'transparent', borderWidth: 0 };
    case 'danger':
      return { bg: c.danger, fg: c.onDanger, border: c.danger, borderWidth: 0 };
    case 'dangerOutline':
      return { bg: 'transparent', fg: c.dangerText, border: c.danger, borderWidth: 1.5 };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  icon: Icon,
  loading,
  disabled,
  fullWidth,
  haptic = 'light',
  style,
  accessibilityHint,
}: ButtonProps) {
  const t = useTheme();
  const inactive = disabled || loading;
  const filled = variant === 'primary' || variant === 'danger';
  const { bg, fg, border, borderWidth } =
    disabled && filled
      ? {
          bg: t.colors.surfaceSunken,
          fg: t.colors.textTertiary,
          border: 'transparent',
          borderWidth: 0,
        }
      : colorsFor(variant, t.colors);
  const large = size === 'large';
  const stretch = fullWidth ?? large;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      haptic={haptic}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.base,
        {
          height: large ? t.layout.buttonHeight : t.layout.minTouch,
          minWidth: t.layout.minTouch,
          paddingHorizontal: large ? t.space[6] : t.space[4],
          borderRadius: t.radius.control,
          backgroundColor: bg,
          borderColor: border,
          borderWidth,
          alignSelf: stretch ? 'stretch' : 'flex-start',
          opacity: disabled && !filled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon color={fg} size={large ? 20 : 18} strokeWidth={1.75} /> : null}
          <Text
            variant={large ? 'headline' : 'subhead'}
            numberOfLines={1}
            style={[{ color: fg }, !large && { fontFamily: t.type.headline.fontFamily }]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
