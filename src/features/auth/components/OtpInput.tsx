import { useEffect, useRef, type Ref } from 'react';
import {
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  TextInput,
  type TextInputInstance,
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { useTheme, withAlpha } from '@/theme';
import { Text } from '@/ui';

import { otpCells, sanitizeOtp } from '../utils';

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  ref?: Ref<TextInputInstance>;
};

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
  const reduceMotion = useReducedMotion();
  const inner = useRef<TextInputInstance>(null);
  const cells = otpCells(value, length);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!error || reduceMotion) return;
    shake.set(
      withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 80 }),
        withTiming(-6, { duration: 70 }),
        withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 50 }),
      ),
    );
  }, [error, reduceMotion, shake]);

  const row = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const setRefs = (node: TextInputInstance | null) => {
    inner.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: TextInputInstance | null }).current = node;
  };

  return (
    <RNPressable onPress={() => inner.current?.focus()} accessible={false}>
      <Animated.View style={[styles.row, { gap: t.space[3] }, row]}>
        {cells.map((cell, i) => (
          <Cell
            key={i}
            digit={cell.digit}
            active={cell.state === 'active' && !disabled}
            error={!!error}
          />
        ))}
      </Animated.View>
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

function Cell({ digit, active, error }: { digit?: string; active: boolean; error: boolean }) {
  const t = useTheme();
  const c = t.colors;
  const reduceMotion = useReducedMotion();
  const on = useSharedValue(0);
  const blink = useSharedValue(1);
  const filled = !!digit;
  const stroke = error ? c.danger : c.accent;
  const rest = filled ? c.textPrimary : withAlpha(c.textPrimary, 0);

  useEffect(() => {
    on.set(withTiming(active || error ? 1 : 0, { duration: t.motion.durationFast }));
  }, [active, error, on, t.motion.durationFast]);

  useEffect(() => {
    if (!active || filled || reduceMotion) {
      blink.set(1);
      return;
    }
    blink.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 450 }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, [active, filled, blink, reduceMotion]);

  const box = useAnimatedStyle(() => ({
    borderColor: interpolateColor(on.value, [0, 1], [rest, stroke]),
  }));
  const caret = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.cell,
        { borderRadius: t.radius.control, backgroundColor: c.surfaceSunken },
        box,
      ]}
    >
      {filled ? (
        <Animated.View key={digit} entering={ZoomIn.springify().damping(14).stiffness(260)}>
          <Text variant="title2" tabular>
            {digit}
          </Text>
        </Animated.View>
      ) : active ? (
        <Animated.View style={[styles.caret, { backgroundColor: c.accent }, caret]} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'flex-start' },
  cell: {
    flex: 1,
    maxWidth: 56,
    height: 56,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caret: { width: 2, height: 22, borderRadius: 1 },
  hidden: { ...StyleSheet.absoluteFill, opacity: 0.011, color: 'transparent' },
});
