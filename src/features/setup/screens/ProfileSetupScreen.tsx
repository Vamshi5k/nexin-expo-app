import { StyleSheet, View } from 'react-native';

import { UserRound } from 'lucide-react-native';

import { AppButton, AppFormInput, AppText } from '@/shared/components';

import { SetupLayout } from '../components/SetupLayout';
import { TermsCheckbox } from '../components/TermsCheckbox';

import { useTheme } from '@/shared/theme';

import { PROFILE_COPY } from '../constants';
import { useProfileSetup } from '../hooks';

export function ProfileSetupScreen() {
  const t = useTheme();
  const profile = useProfileSetup();
  return (
    <SetupLayout
      step={1}
      title={PROFILE_COPY.title}
      subtitle={PROFILE_COPY.subtitle}
      aboveTitle={
        // Live preview: the initials fill in as the name is typed.
        <View
          style={[styles.avatar, { backgroundColor: t.colors.accentSoft }]}
          accessibilityElementsHidden
        >
          {profile.initials ? (
            <AppText variant="title1" tone="accent">
              {profile.initials}
            </AppText>
          ) : (
            <UserRound color={t.colors.accentText} size={34} strokeWidth={1.75} />
          )}
        </View>
      }
      footer={
        <AppButton
          label="Continue"
          onPress={profile.submit}
          disabled={!profile.valid}
          loading={profile.saving}
        />
      }
    >
      <View style={{ gap: t.space[5] }}>
        <AppFormInput
          control={profile.control}
          name="name"
          size="large"
          label={PROFILE_COPY.nameLabel}
          placeholder={PROFILE_COPY.namePlaceholder}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="done"
        />
        <TermsCheckbox
          checked={profile.accepted}
          onToggle={profile.toggleAccepted}
          onOpenTerms={profile.openTerms}
          onOpenPrivacy={profile.openPrivacy}
        />
      </View>
    </SetupLayout>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
