import { UserRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AuthScaffold } from '@/features/auth';
import { useTheme } from '@/theme';
import { Button, FormInput, Reveal, Text } from '@/ui';

import { SetupHeader } from '../components/SetupHeader';
import { TermsCheckbox } from '../components/TermsCheckbox';
import { PROFILE_COPY } from '../constants';
import { useProfileSetup } from '../hooks';

export function ProfileSetupScreen() {
  const t = useTheme();
  const profile = useProfileSetup();
  return (
    <AuthScaffold
      topBar={<SetupHeader step={1} />}
      hero={
        <>
          <Reveal index={0}>
            <View
              style={[
                styles.tile,
                { borderRadius: t.radius.card, backgroundColor: t.colors.accent },
              ]}
            >
              <UserRound color={t.colors.onAccent} size={28} strokeWidth={1.75} />
            </View>
          </Reveal>
          <Reveal index={1} style={{ gap: t.space[2], marginTop: t.space[4] }}>
            <Text variant="hero" accessibilityRole="header">
              {PROFILE_COPY.title}
            </Text>
            <Text variant="callout" tone="secondary">
              {PROFILE_COPY.subtitle}
            </Text>
          </Reveal>
        </>
      }
      footer={
        <Button
          label="Continue"
          onPress={profile.submit}
          disabled={!profile.valid}
          loading={profile.saving}
        />
      }
    >
      <Reveal index={2} style={{ gap: t.space[4] }}>
        <FormInput
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
      </Reveal>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  tile: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
});
