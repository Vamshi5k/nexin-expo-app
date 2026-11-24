import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme, withAlpha } from '@/theme';

import { Text } from './Text';

export type InputProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  prefix?: string;
  trailing?: ReactNode;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export function Input({
  label,
  hint,
  error,
  icon: Icon,
  prefix,
  trailing,
  editable = true,
  onFocus,
  onBlur,
  ref,
  ...rest
}: InputProps) {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const lift = useSharedValue(0);
  const focus = useSharedValue(0);
  const shake = useSharedValue(0);
  const strong = error ? c.danger : c.accent;
  const soft = error ? c.dangerSoft : c.accentSoft;
  const strongOff = withAlpha(strong, 0);
  const softOff = withAlpha(soft, 0);
  const active = focused || !!error;

  useEffect(() => {
    lift.value = withTiming(active ? 1 : 0, { duration: t.motion.durationFast });
    focus.value = withTiming(focused ? 1 : 0, { duration: t.motion.durationFast });
  }, [active, focused, lift, focus, t.motion.durationFast]);

  useEffect(() => {
    if (!error || reduceMotion) return;
    shake.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 70 }),
      withTiming(-3, { duration: 60 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error, reduceMotion, shake]);

  const ring = useAnimatedStyle(() => ({
    borderColor: interpolateColor(lift.value, [0, 1], [softOff, soft]),
    transform: [{ translateX: shake.value }],
  }));
  const field = useAnimatedStyle(() => ({
    borderColor: interpolateColor(lift.value, [0, 1], [strongOff, strong]),
    backgroundColor: interpolateColor(focus.value, [0, 1], [c.surfaceSunken, c.surface]),
  }));

  return (
    <View style={{ gap: t.space[2] }}>
      {label ? (
        <Text variant="subhead" tone="secondary">
          {label}
        </Text>
      ) : null}
      <Animated.View
        style={[{ margin: -RING, borderWidth: RING, borderRadius: t.radius.control + RING }, ring]}
      >
        <Animated.View
          style={[
            styles.field,
            {
              height: t.layout.inputHeight,
              borderRadius: t.radius.control,
              borderWidth: 1.5,
              opacity: editable ? 1 : 0.6,
              paddingHorizontal: t.space[4] - 1.5,
              gap: t.space[3],
            },
            field,
          ]}
        >
          {Icon ? (
            <Icon color={focused ? c.accentText : c.textTertiary} size={20} strokeWidth={1.75} />
          ) : null}
          {prefix ? (
            <View style={[styles.prefix, { gap: t.space[3] }]}>
              <Text variant="body" tone="secondary" tabular>
                {prefix}
              </Text>
              <View style={[styles.divider, { backgroundColor: c.borderStrong }]} />
            </View>
          ) : null}
          <TextInput
            ref={ref}
            editable={editable}
            placeholderTextColor={c.textTertiary}
            selectionColor={c.accent}
            maxFontSizeMultiplier={t.layout.maxFontScale}
            accessibilityLabel={label}
            accessibilityHint={error ?? hint}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[t.type.body, styles.input, { color: c.textPrimary }]}
            {...rest}
          />
          {trailing}
        </Animated.View>
      </Animated.View>
      {error ? (
        <Animated.View key={error} entering={FadeIn.duration(t.motion.durationFast)}>
          <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
            {error}
          </Text>
        </Animated.View>
      ) : hint ? (
        <Text variant="caption" tone="tertiary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const RING = 3;

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, paddingVertical: 0 },
  prefix: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 20 },
});
