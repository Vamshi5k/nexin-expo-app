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
  // At rest the field is a sunken neutral fill; focus lifts it to the surface with a brand
  // border and a soft focus ring. Errors use danger in place of the brand.
  const borderColor = error ? c.danger : focused ? c.accent : 'transparent';
  const ringColor = error ? c.dangerSoft : focused ? c.accentSoft : 'transparent';

  return (
    <View style={{ gap: t.space[2] }}>
      {label ? (
        <Text variant="subhead" tone="secondary">
          {label}
        </Text>
      ) : null}
      <View
        style={{
          margin: -RING,
          borderWidth: RING,
          borderColor: ringColor,
          borderRadius: t.radius.control + RING,
        }}
      >
        <View
          style={[
            styles.field,
            {
              height: t.layout.inputHeight,
              borderRadius: t.radius.control,
              borderColor,
              borderWidth: 1.5,
              backgroundColor: focused ? c.surface : c.surfaceSunken,
              opacity: editable ? 1 : 0.6,
              paddingHorizontal: t.space[4] - 1.5,
              gap: t.space[3],
            },
          ]}
        >
          {Icon ? (
            <Icon color={focused ? c.accentText : c.textTertiary} size={20} strokeWidth={1.75} />
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
        </View>
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

/** Width of the focus ring drawn outside the field. */
const RING = 3;

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, paddingVertical: 0 },
});
