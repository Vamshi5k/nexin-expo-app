import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type Palette } from '@/theme';

import type { HapticKind } from './haptics';
import { Pressable } from './Pressable';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  /** Full width by default (DESIGN.md primary buttons). */
  fullWidth?: boolean;
  size?: 'large' | 'small';
  haptic?: HapticKind | false;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

function colorsFor(variant: ButtonVariant, c: Palette) {
  switch (variant) {
    case 'primary':
      return { bg: c.accent, fg: c.onAccent, border: c.accent };
    case 'secondary':
      return { bg: c.accentSoft, fg: c.accentText, border: c.accentSoft };
    case 'ghost':
      return { bg: 'transparent', fg: c.accentText, border: 'transparent' };
    case 'danger':
      return { bg: c.danger, fg: c.onDanger, border: c.danger };
    case 'dangerOutline':
      return { bg: 'transparent', fg: c.dangerText, border: c.danger };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  loading,
  disabled,
  fullWidth = true,
  size = 'large',
  haptic = 'light',
  style,
  accessibilityHint,
}: ButtonProps) {
  const t = useTheme();
  const { bg, fg, border } = colorsFor(variant, t.colors);
  const inactive = disabled || loading;
  const height = size === 'large' ? t.layout.buttonHeight : t.layout.minTouch;

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
          height,
          minWidth: t.layout.minTouch,
          paddingHorizontal: size === 'large' ? t.space[6] : t.space[4],
          borderRadius: t.radius.control,
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'dangerOutline' ? 1.5 : 0,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon color={fg} size={20} strokeWidth={1.75} /> : null}
          <Text variant={size === 'large' ? 'headline' : 'subhead'} style={{ color: fg }}>
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
