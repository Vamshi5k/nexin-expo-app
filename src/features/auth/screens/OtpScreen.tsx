import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';

import { getErrorMessage, statusOf } from '@/core/api';
import { brand } from '@/core/config';
import { AppLogo } from '@/features/client-config';
import { useTheme } from '@/theme';
import { Button, Header, Screen, Text, haptics, toast } from '@/ui';

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
      toast.success('New OTP sent!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Screen
      edges={['top']}
      scroll
      footer={
        <View style={{ gap: t.space[3] }}>
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
        </View>
      }
      contentStyle={{ gap: t.space[8] }}
    >
      <View style={{ marginHorizontal: -t.layout.screenPadding }}>
        <Header back />
      </View>
      <AppLogo height={44} />
      <View style={{ gap: t.space[2] }}>
        <Text variant="title1" accessibilityRole="header">
          Enter verification code
        </Text>
        <Text tone="secondary">
          We&apos;ve sent a {CONSUMER_OTP_LENGTH}-digit code to{' '}
          <Text style={{ fontFamily: t.type.headline.fontFamily }}>
            {value
              ? formatContact(type, value, brand.phoneCountryCode)
              : type === 'phone'
                ? 'your number'
                : 'your email'}
          </Text>
        </Text>
      </View>
      <View style={{ gap: t.space[5] }}>
        <OtpInput
          ref={input}
          value={code}
          onChange={setCode}
          onComplete={(otp) => void submit(otp)}
          length={CONSUMER_OTP_LENGTH}
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  resend: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
