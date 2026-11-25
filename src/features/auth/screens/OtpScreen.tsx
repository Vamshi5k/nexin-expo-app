import { useRef } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';

import { router } from 'expo-router';

import { AppButton, AppReveal, AppText } from '@/shared/components';

import { AuthScaffold } from '../components/AuthScaffold';
import { ChargingIllustration } from '../components/ChargingIllustration';
import { OtpInput } from '../components/OtpInput';

import { useTheme } from '@/shared/theme';

import { useOtpForm } from '../hooks';
import type { ContactType } from '../types/auth.types';

export type OtpScreenProps = { type: ContactType; value: string };

export function OtpScreen({ type, value }: OtpScreenProps) {
  const t = useTheme();
  const inputRef = useRef<TextInputInstance>(null);
  const otp = useOtpForm(type, value, { onWrongCode: () => inputRef.current?.focus() });

  return (
    <AuthScaffold
      back
      hero={
        <>
          <AppReveal
            index={0}
            style={[styles.art, { marginBottom: t.space[6], marginRight: -t.layout.screenPadding }]}
          >
            <ChargingIllustration />
          </AppReveal>
          <AppReveal index={1} style={{ gap: t.space[2] }}>
            <AppText variant="hero" accessibilityRole="header">
              Enter verification code
            </AppText>
            <AppText variant="callout" tone="secondary">
              We&apos;ve sent a {otp.length}-digit code to
            </AppText>
          </AppReveal>
          <AppReveal index={2}>
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
              <AppText variant="subhead" tabular>
                {otp.contact}
              </AppText>
            </View>
          </AppReveal>
        </>
      }
      footer={
        <>
          <AppButton
            label="Verify"
            onPress={() => otp.submit()}
            disabled={!otp.complete}
            loading={otp.verifying}
          />
          <View style={styles.help}>
            <AppText variant="subhead" tone="secondary">
              Didn&apos;t receive the code?
            </AppText>
            <AppButton
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
      <AppReveal index={3} style={{ gap: t.space[3] }}>
        <OtpInput
          ref={inputRef}
          value={otp.code}
          onChange={otp.changeCode}
          onComplete={otp.submit}
          length={otp.length}
          error={otp.wrong}
          disabled={otp.verifying}
        />
        <View style={styles.resend}>
          {otp.resendIn > 0 ? (
            <AppText variant="subhead" tone="secondary" tabular accessibilityLiveRegion="polite">
              Resend in {otp.resendIn}s
            </AppText>
          ) : (
            <AppButton
              label="Resend code"
              variant="ghost"
              size="medium"
              loading={otp.resending}
              onPress={otp.resend}
            />
          )}
        </View>
      </AppReveal>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  help: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  resend: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  art: { flex: 1, minHeight: 0 },
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
