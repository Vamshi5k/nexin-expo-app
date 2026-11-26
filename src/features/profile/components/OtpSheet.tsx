import { StyleSheet, View } from 'react-native';

import { AppButton, AppPressable, AppSheet, AppText } from '@/shared/components';

import { OtpInput } from '@/features/auth';

import { useTheme } from '@/shared/theme';

import { OTP_COPY, PROFILE_OTP_LENGTH } from '../constants/profile.constants';
import type { ContactKind } from '../types/profile.types';

type OtpSheetProps = {
  open: boolean;
  kind: ContactKind;
  label: string;
  code: string;
  wrong: boolean;
  verifying: boolean;
  remaining: number;
  sending: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onResend: () => void;
  onClose: () => void;
};

// 4 boxes that focus on open and verify on the last digit (paste and SMS autofill come from
// the shared OtpInput), a clear wrong-code line, and resend after the countdown.
const OtpSheet = ({
  open,
  kind,
  label,
  code,
  wrong,
  verifying,
  remaining,
  sending,
  onChange,
  onSubmit,
  onResend,
  onClose,
}: OtpSheetProps) => {
  const t = useTheme();
  const canResend = remaining === 0 && !sending;

  return (
    <AppSheet
      open={open}
      onClose={onClose}
      title={OTP_COPY.title(kind)}
      description={OTP_COPY.body(label)}
    >
      <View style={{ gap: t.space[4] }}>
        <OtpInput
          value={code}
          onChange={onChange}
          onComplete={onSubmit}
          length={PROFILE_OTP_LENGTH}
          error={wrong}
          disabled={verifying}
          autoFocus
        />

        {wrong ? (
          <AppText variant="caption" align="center" style={{ color: t.colors.dangerText }}>
            {OTP_COPY.wrong}
          </AppText>
        ) : null}

        <View style={styles.center}>
          <AppPressable
            onPress={canResend ? onResend : undefined}
            feedback="opacity"
            hitSlop={t.space[3]}
            accessibilityRole="button"
            accessibilityLabel={canResend ? OTP_COPY.resend : OTP_COPY.resendIn(remaining)}
            accessibilityState={{ disabled: !canResend }}
            style={{ minHeight: t.layout.minTouch, justifyContent: 'center' }}
          >
            <AppText variant="subhead" tone={canResend ? 'accent' : 'tertiary'} tabular>
              {canResend ? OTP_COPY.resend : OTP_COPY.resendIn(remaining)}
            </AppText>
          </AppPressable>
        </View>

        <AppButton
          label={OTP_COPY.verify}
          onPress={() => onSubmit(code)}
          loading={verifying}
          disabled={code.length < PROFILE_OTP_LENGTH}
        />
      </View>
    </AppSheet>
  );
};

export default OtpSheet;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
});
