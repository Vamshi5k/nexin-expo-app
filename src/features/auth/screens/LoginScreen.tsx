import { Mail } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';

import { brand } from '@/core/config';
import { useTheme } from '@/theme';
import { Button, FormInput, Reveal, Text } from '@/ui';

import { AuthScaffold } from '../components/AuthScaffold';
import { ChargingIllustration, ILLUSTRATION_MIN_HEIGHT } from '../components/ChargingIllustration';
import { LegalLink } from '../components/LegalLink';
import { useLoginForm } from '../hooks';

export function LoginScreen() {
  const t = useTheme();
  const login = useLoginForm();
  const fadeIn = FadeIn.duration(t.motion.duration).easing(Easing.out(Easing.quad));

  return (
    <AuthScaffold
      hero={
        <>
          <Reveal index={0} style={[styles.art, { marginBottom: t.space[6] }]}>
            <ChargingIllustration />
          </Reveal>
          <Reveal index={1}>
            <Animated.View key={login.type} entering={fadeIn} style={{ gap: t.space[2] }}>
              <Text variant="hero" accessibilityRole="header">
                {login.copy.title}
              </Text>
              <Text variant="callout" tone="secondary">
                {login.copy.subtitle}
              </Text>
            </Animated.View>
          </Reveal>
        </>
      }
      footer={
        <>
          <Button
            label="Continue"
            onPress={login.submit}
            disabled={!login.valid}
            loading={login.submitting}
          />
          <View style={styles.terms}>
            <Text variant="caption" tone="secondary">
              By continuing, you agree to our{' '}
            </Text>
            <LegalLink label="Terms" onPress={login.openTerms} />
            <Text variant="caption" tone="secondary">
              {' '}
              and{' '}
            </Text>
            <LegalLink label="Privacy" onPress={login.openPrivacy} />
          </View>
        </>
      }
    >
      <Reveal index={2} style={{ gap: t.space[1] }}>
        <Animated.View key={login.type} entering={fadeIn}>
          {login.type === 'phone' ? (
            <FormInput
              control={login.control}
              name="contact"
              size="large"
              prefix={brand.phoneCountryCode}
              placeholder={brand.phonePlaceholder}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel-national"
              maxLength={brand.phoneLength}
              accessibilityLabel="Mobile number"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={login.submit}
            />
          ) : (
            <FormInput
              control={login.control}
              name="contact"
              size="large"
              icon={Mail}
              placeholder="name@example.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={login.submit}
            />
          )}
        </Animated.View>
        {login.canSwitchType ? (
          <View style={styles.links}>
            <Button
              label={login.type === 'phone' ? 'Use email instead' : 'Use phone instead'}
              variant="ghost"
              size="medium"
              haptic="selection"
              onPress={login.switchType}
              style={styles.linkLeft}
            />
          </View>
        ) : null}
        {/* TODO(phase-fleet): "Fleet Login" link to /(auth)/fleet-login when
            config.features.fleet is on (BLUEPRINT A3). Hidden until that route exists. */}
      </Reveal>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  art: { flex: 1, minHeight: ILLUSTRATION_MIN_HEIGHT },
  terms: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  links: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkLeft: { marginLeft: -16 },
});
