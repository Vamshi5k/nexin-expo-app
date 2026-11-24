import { UserRound } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import { Button, FormInput, Reveal, Screen, Text } from '@/ui';

import { SetupHeader } from '../components/SetupHeader';
import { TermsCheckbox } from '../components/TermsCheckbox';
import { PROFILE_COPY } from '../constants';
import { useProfileSetup } from '../hooks';

export function ProfileSetupScreen() {
  const t = useTheme();
  const profile = useProfileSetup();
  return (
    <Screen
      scroll
      footer={
        <Button
          label="Continue"
          onPress={profile.submit}
          disabled={!profile.valid}
          loading={profile.saving}
        />
      }
      contentStyle={{ gap: t.space[8] }}
    >
      <SetupHeader step={1} />
      <Reveal index={0} style={{ gap: t.space[4] }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: t.radius.card,
            backgroundColor: t.colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserRound color={t.colors.accentText} size={26} strokeWidth={1.75} />
        </View>
        <View style={{ gap: t.space[2] }}>
          <Text variant="hero" accessibilityRole="header">
            {PROFILE_COPY.title}
          </Text>
          <Text variant="callout" tone="secondary">
            {PROFILE_COPY.subtitle}
          </Text>
        </View>
      </Reveal>
      <Reveal index={1} style={{ gap: t.space[5] }}>
        <FormInput
          control={profile.control}
          name="name"
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
    </Screen>
  );
}
