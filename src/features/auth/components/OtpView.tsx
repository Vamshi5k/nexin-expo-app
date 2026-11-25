import type { ReactNode, RefObject } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';

import { router } from 'expo-router';

import { AppButton, AppReveal, AppText } from '@/shared/components';

import AuthScaffold from './AuthScaffold';
import ChargingIllustration from './ChargingIllustration';
import OtpInput from './OtpInput';

import { useTheme } from '@/shared/theme';

import type { OtpCode } from '../hooks/useOtpCode';

type OtpViewProps = {
  otp: OtpCode & { contact: string };
  inputRef: RefObject<TextInputInstance | null>;
  title: string;
  subtitle: string;
  verifyLabel: string;
  helpPrompt: string;
  changeLabel: string;
  aboveTitle?: ReactNode;
  codeLabel?: string;
};

// Layout shared by the consumer and fleet OTP screens.
const OtpView = ({
  otp,
  inputRef,
  title,
  subtitle,
  verifyLabel,
  helpPrompt,
  changeLabel,
  aboveTitle,
  codeLabel,
}: OtpViewProps) => {
  const t = useTheme();

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
            {aboveTitle}
            <AppText variant="hero" accessibilityRole="header">
              {title}
            </AppText>
            <AppText variant="callout" tone="secondary">
              {subtitle}
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
            label={verifyLabel}
            onPress={() => otp.submit()}
            disabled={!otp.complete}
            loading={otp.verifying}
          />
          <View style={styles.help}>
            <AppText variant="subhead" tone="secondary">
              {helpPrompt}
            </AppText>
            <AppButton
              label={changeLabel}
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
        {codeLabel ? (
          <AppText variant="subhead" tone="secondary">
            {codeLabel}
          </AppText>
        ) : null}
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
};

export default OtpView;

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
