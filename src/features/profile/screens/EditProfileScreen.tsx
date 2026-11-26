import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BadgeCheck, FileText, Mail, Phone, Save, User } from 'lucide-react-native';
import Animated from 'react-native-reanimated';

import {
  AppBackButton,
  AppButton,
  AppDialog,
  AppFormInput,
  AppPressable,
  AppScreen,
  AppText,
} from '@/shared/components';

import OtpSheet from '../components/OtpSheet';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import { EDIT_COPY, PROFILE_HREF } from '../constants/profile.constants';
import { useEditProfile } from '../hooks/useEditProfile';

type SectionProps = {
  title: string;
  children: ReactNode;
  step: number;
};

type ContactActionProps = {
  status: 'verify' | 'verified' | null;
  label: string;
  onVerify: () => void;
};

const Section = ({ title, children, step }: SectionProps) => {
  const t = useTheme();

  return (
    <Animated.View entering={riseIn(step)} style={{ gap: t.space[2] }}>
      <AppText
        variant="caption"
        tone="secondary"
        accessibilityRole="header"
        style={[styles.overline, { paddingHorizontal: t.space[1] }]}
      >
        {title}
      </AppText>
      <View
        style={{
          gap: t.space[4],
          padding: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
};

// "Verify" while a changed contact still needs its code, a green "Verified" once it has one.
const ContactAction = ({ status, label, onVerify }: ContactActionProps) => {
  const t = useTheme();
  if (!status) return null;

  if (status === 'verified') {
    return (
      <View
        accessible
        accessibilityLabel={`${label} ${EDIT_COPY.verified}`}
        style={[styles.row, { gap: t.space[1] }]}
      >
        <BadgeCheck color={t.colors.successText} size={t.icon.meta} strokeWidth={t.icon.stroke} />
        <AppText variant="caption" style={{ color: t.colors.successText }}>
          {EDIT_COPY.verified}
        </AppText>
      </View>
    );
  }

  return (
    <AppPressable
      onPress={onVerify}
      haptic="light"
      hitSlop={t.space[3]}
      accessibilityRole="button"
      accessibilityLabel={`${EDIT_COPY.verify} ${label}`}
      style={{
        paddingHorizontal: t.space[3],
        paddingVertical: t.space[1] + t.space[1] / 2,
        borderRadius: t.radius.pill,
        backgroundColor: t.colors.accentSoft,
      }}
    >
      <AppText variant="caption" tone="accent" style={{ fontFamily: t.type.headline.fontFamily }}>
        {EDIT_COPY.verify}
      </AppText>
    </AppPressable>
  );
};

// Edit Profile (BLUEPRINT E2): name, contact and GSTIN in three cards. A changed phone needs
// its OTP before Save turns on; leaving with edits asks first.
const EditProfileScreen = () => {
  const t = useTheme();
  const edit = useEditProfile();

  return (
    <>
      <AppScreen
        scroll
        wash
        contentStyle={{ gap: t.space[5], paddingTop: t.space[2] }}
        footer={
          <View style={{ gap: t.space[2] }}>
            {edit.saveError ? (
              <View
                testID="save-error"
                style={[
                  styles.row,
                  {
                    gap: t.space[3],
                    padding: t.space[2],
                    paddingLeft: t.space[3],
                    borderRadius: t.radius.control,
                    backgroundColor: t.colors.dangerSoft,
                  },
                ]}
              >
                <AppText variant="caption" style={[styles.grow, { color: t.colors.dangerText }]}>
                  {edit.saveError}
                </AppText>
                <AppButton
                  label={EDIT_COPY.retry}
                  variant="secondary"
                  size="medium"
                  onPress={edit.submit}
                />
              </View>
            ) : edit.blocker ? (
              <AppText variant="caption" tone="secondary" align="center">
                {edit.blocker}
              </AppText>
            ) : null}
            <AppButton
              label={EDIT_COPY.save}
              icon={Save}
              onPress={edit.submit}
              loading={edit.saving}
              disabled={!edit.canSave}
            />
          </View>
        }
      >
        <Animated.View entering={riseIn(0)} style={{ gap: t.space[4] }}>
          <View style={styles.row}>
            <AppBackButton fallbackHref={PROFILE_HREF.tab} />
          </View>
          <View style={{ gap: t.space[1] / 2 }}>
            <AppText variant="title2" accessibilityRole="header">
              {EDIT_COPY.title}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {EDIT_COPY.subtitle}
            </AppText>
          </View>
        </Animated.View>

        <Section title={EDIT_COPY.personal} step={1}>
          <AppFormInput
            control={edit.control}
            name="firstName"
            label={EDIT_COPY.firstName}
            placeholder={EDIT_COPY.firstNamePlaceholder}
            icon={User}
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
          />
          <AppFormInput
            control={edit.control}
            name="lastName"
            label={EDIT_COPY.lastName}
            placeholder={EDIT_COPY.lastNamePlaceholder}
            icon={User}
            autoComplete="family-name"
            textContentType="familyName"
            returnKeyType="next"
          />
        </Section>

        <Section title={EDIT_COPY.contact} step={2}>
          <AppFormInput
            control={edit.control}
            name="email"
            label={EDIT_COPY.email}
            placeholder={EDIT_COPY.emailPlaceholder}
            icon={Mail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            trailing={
              <ContactAction
                status={edit.emailStatus}
                label={EDIT_COPY.email}
                onVerify={edit.verifyEmail}
              />
            }
          />
          <AppFormInput
            control={edit.control}
            name="phone"
            label={edit.phoneLabel}
            placeholder={EDIT_COPY.phonePlaceholder}
            icon={Phone}
            prefix={edit.phonePrefix}
            keyboardType="number-pad"
            maxLength={edit.phoneLength}
            autoComplete="tel"
            textContentType="telephoneNumber"
            trailing={
              <ContactAction
                status={edit.phoneStatus}
                label={EDIT_COPY.phone}
                onVerify={edit.verifyPhone}
              />
            }
          />
        </Section>

        <Section title={EDIT_COPY.business} step={3}>
          <AppFormInput
            control={edit.control}
            name="gst"
            label={EDIT_COPY.gst}
            placeholder={EDIT_COPY.gstPlaceholder}
            icon={FileText}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={15}
          />
        </Section>
      </AppScreen>

      <OtpSheet
        open={edit.otp.visible}
        kind={edit.otp.kind}
        label={edit.otp.label}
        code={edit.otp.code}
        wrong={edit.otp.wrong}
        verifying={edit.otp.verifying}
        remaining={edit.otp.remaining}
        sending={edit.otp.sending}
        onChange={edit.otp.change}
        onSubmit={edit.otp.submit}
        onResend={edit.otp.resend}
        onClose={edit.otp.close}
      />

      <AppDialog
        open={edit.leaveOpen}
        title={EDIT_COPY.discardTitle}
        message={EDIT_COPY.discardBody}
        confirmLabel={EDIT_COPY.discard}
        cancelLabel={EDIT_COPY.keepEditing}
        onConfirm={edit.discard}
        onCancel={edit.keepEditing}
        destructive
      />
    </>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
