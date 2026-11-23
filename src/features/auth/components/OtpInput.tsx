import { useRef, type Ref } from 'react';
import { Platform, Pressable as RNPressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from '@/ui';

import { otpCells, sanitizeOtp } from '../otp';

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called once when the last digit is entered (typing, paste or autofill). */
  onComplete?: (value: string) => void;
  length: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  ref?: Ref<TextInput>;
};

/**
 * ONE hidden TextInput (so iOS oneTimeCode and Android sms-otp autofill work) drawn as
 * `length` boxes. Paste fills every box; the last digit triggers onComplete.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length,
  error,
  disabled,
  autoFocus = true,
  ref,
}: OtpInputProps) {
  const t = useTheme();
  const c = t.colors;
  const inner = useRef<TextInput>(null);
  const cells = otpCells(value, length);

  const setRefs = (node: TextInput | null) => {
    inner.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: TextInput | null }).current = node;
  };

  return (
    <RNPressable
      onPress={() => inner.current?.focus()}
      accessible={false}
      style={[styles.row, { gap: t.space[3] }]}
    >
      {cells.map((cell, i) => {
        const active = cell.state === 'active' && !disabled;
        const borderColor = error
          ? c.danger
          : active
            ? c.accent
            : cell.digit
              ? c.borderStrong
              : 'transparent';
        return (
          <View
            key={i}
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.cell,
              {
                borderRadius: t.radius.control,
                borderColor,
                borderWidth: active || error ? 1.5 : 1,
                backgroundColor: cell.digit || active ? c.surface : c.surfaceSunken,
              },
            ]}
          >
            <Text variant="title2" tabular>
              {cell.digit}
            </Text>
          </View>
        );
      })}
      <TextInput
        ref={setRefs}
        value={value}
        onChangeText={(text) => {
          const next = sanitizeOtp(text, length);
          onChange(next);
          if (next.length === length && value.length !== length) onComplete?.(next);
        }}
        editable={!disabled}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        maxLength={length}
        caretHidden
        accessibilityLabel={`Verification code, ${length} digits`}
        accessibilityValue={{ text: `${value.length} of ${length} entered` }}
        style={styles.hidden}
      />
    </RNPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center' },
  cell: { width: 56, height: 64, alignItems: 'center', justifyContent: 'center' },
  hidden: { ...StyleSheet.absoluteFill, opacity: 0.011, color: 'transparent' },
});
