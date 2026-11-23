import type { LucideIcon } from 'lucide-react-native';
import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type InputProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  /** Element shown at the end of the field, e.g. a show-password toggle. */
  trailing?: ReactNode;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export function Input({
  label,
  hint,
  error,
  icon: Icon,
  trailing,
  editable = true,
  onFocus,
  onBlur,
  ref,
  ...rest
}: InputProps) {
  const t = useTheme();
  const c = t.colors;
  const [focused, setFocused] = useState(false);
  const borderColor = error ? c.danger : focused ? c.accent : c.border;

  return (
    <View style={{ gap: t.space[2] }}>
      {label ? (
        <Text variant="subhead" tone="secondary">
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            height: t.layout.inputHeight,
            borderRadius: t.radius.control,
            borderColor,
            borderWidth: focused || error ? 1.5 : t.layout.hairline * 2,
            backgroundColor: editable ? c.surface : c.surfaceSunken,
            paddingHorizontal: t.space[4],
            gap: t.space[3],
          },
        ]}
      >
        {Icon ? <Icon color={c.textTertiary} size={20} strokeWidth={1.75} /> : null}
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
      </View>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="tertiary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, paddingVertical: 0 },
});
