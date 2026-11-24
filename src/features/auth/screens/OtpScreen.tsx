import { router } from 'expo-router';
import { Mail, MessageSquareText } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';

import { getErrorMessage, statusOf } from '@/core/api';
import { brand } from '@/core/config';
import { useTheme } from '@/theme';
import { Button, Reveal, Text, haptics, toast } from '@/ui';

import { AuthScaffold } from '../components/AuthScaffold';
import { OtpInput } from '../components/OtpInput';
import { useRequestOtp, useVerifyOtp } from '../hooks';
import { CONSUMER_OTP_LENGTH, formatContact, OTP_RESEND_SECONDS } from '../utils';
import type { ContactType } from '../types';

export type OtpScreenProps = { type: ContactType; value: string };

function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  useEffect(() => {
    if (remaining === 0) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [remaining]);
  return {
    remaining,
    restart: () => {
      const start = Date.now();
      setNow(start);
      setEndsAt(start + seconds * 1000);
    },
  };
}

export function OtpScreen({ type, value }: OtpScreenProps) {
  const t = useTheme();
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const input = useRef<TextInputInstance>(null);
  const verify = useVerifyOtp();
  const resend = useRequestOtp();
  const countdown = useCountdown(OTP_RESEND_SECONDS);

  const submit = async (otp: string) => {
    if (otp.length !== CONSUMER_OTP_LENGTH || verify.isPending) return;
    try {
      await verify.mutateAsync(otp);
      haptics.success();
    } catch (error) {
      setCode('');
      setWrong(true);
      input.current?.focus();
      haptics.warning();
      const status = statusOf(error);
      toast.error(
        status !== undefined && status >= 400 && status < 500
          ? 'Invalid OTP. Please try again.'
          : getErrorMessage(error),
      );
    }
  };

  const onResend = async () => {
    try {
      await resend.mutateAsync(value);
      countdown.restart();
      setCode('');
      setWrong(false);
      toast.success('New OTP sent!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const contact = value
    ? formatContact(type, value, brand.phoneCountryCode)
    : type === 'phone'
      ? 'your number'
      : 'your email';
  const Badge = type === 'phone' ? MessageSquareText : Mail;

  return (
    <AuthScaffold
      back
      hero={
        <>
          <Reveal index={0}>
            <View
              style={[
                styles.badge,
                { backgroundColor: t.colors.accentSoft, borderRadius: t.radius.control },
              ]}
            >
              <Badge color={t.colors.accentText} size={22} strokeWidth={1.75} />
            </View>
          </Reveal>
          <Reveal index={1} style={{ gap: t.space[2], marginTop: t.space[4] }}>
            <Text variant="hero" accessibilityRole="header">
              Enter verification code
            </Text>
            <Text variant="callout" tone="secondary">
              We&apos;ve sent a {CONSUMER_OTP_LENGTH}-digit code to
            </Text>
          </Reveal>
          <Reveal index={2}>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: t.colors.surface,
                  borderColor: t.colors.border,
                  borderRadius: t.radius.pill,
                  paddingHorizontal: t.space[3],
                  gap: t.space[2],
                },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: t.colors.success }]} />
              <Text variant="subhead" tabular>
                {contact}
              </Text>
            </View>
          </Reveal>
        </>
      }
      footer={
        <>
          <Button
            label="Verify"
            onPress={() => void submit(code)}
            disabled={code.length !== CONSUMER_OTP_LENGTH}
            loading={verify.isPending}
          />
          <View style={styles.help}>
            <Text variant="subhead" tone="secondary">
              Didn&apos;t receive the code?
            </Text>
            <Button
              label={type === 'phone' ? 'Change Number' : 'Change Email'}
              variant="ghost"
              size="medium"
              haptic="selection"
              onPress={() => router.back()}
            />
          </View>
        </>
      }
    >
      <Reveal index={3} style={{ gap: t.space[3] }}>
        <OtpInput
          ref={input}
          value={code}
          onChange={(next) => {
            setWrong(false);
            setCode(next);
          }}
          onComplete={(otp) => void submit(otp)}
          length={CONSUMER_OTP_LENGTH}
          error={wrong}
          disabled={verify.isPending}
        />
        <View style={styles.resend}>
          {countdown.remaining > 0 ? (
            <Text variant="subhead" tone="secondary" tabular accessibilityLiveRegion="polite">
              Resend in {countdown.remaining}s
            </Text>
          ) : (
            <Button
              label="Resend code"
              variant="ghost"
              size="medium"
              loading={resend.isPending}
              onPress={() => void onResend()}
            />
          )}
        </View>
      </Reveal>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  help: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  resend: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    marginTop: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
