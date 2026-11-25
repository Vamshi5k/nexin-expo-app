import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme, type Palette } from '@/shared/theme';

import type { HapticKind } from '@/shared/utils/haptics';
import { Pressable } from './Pressable';

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
  const { bg, fg, border, borderWidth } = colorsFor(variant, t.colors);
  const off = { bg: t.colors.surfaceSunken, fg: t.colors.textTertiary };
  const large = size === 'large';
  const stretch = fullWidth ?? large;

  // Filled buttons fade between their disabled and live colours instead of snapping.
  const live = useSharedValue(disabled && filled ? 0 : 1);
  useEffect(() => {
    live.value = withTiming(disabled && filled ? 0 : 1, { duration: t.motion.duration });
  }, [disabled, filled, live, t.motion.duration]);
  const fill = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(live.value, [0, 1], [off.bg, bg]),
  }));
  const ink = useAnimatedStyle(() => ({
    color: interpolateColor(live.value, [0, 1], [off.fg, fg]),
  }));
  const iconColor = disabled && filled ? off.fg : fg;

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
          borderRadius: large ? t.radius.pill : t.radius.control,
          borderColor: border,
          borderWidth,
          alignSelf: stretch ? 'stretch' : 'flex-start',
          opacity: disabled && !filled ? 0.45 : 1,
        },
        fill,
        style,
      ]}
    >
      {loading ? (
        <Animated.View
          key="spinner"
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
        >
          <ActivityIndicator color={fg} />
        </Animated.View>
      ) : (
        <Animated.View
          key="label"
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
          style={styles.row}
        >
          {Icon ? <Icon color={iconColor} size={large ? 20 : 18} strokeWidth={1.75} /> : null}
          <Animated.Text
            numberOfLines={1}
            maxFontSizeMultiplier={t.layout.maxFontScale}
            style={[
              large ? t.type.headline : t.type.subhead,
              !large && { fontFamily: t.type.headline.fontFamily },
              ink,
            ]}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
