import { StyleSheet, View } from 'react-native';

import { Mail } from 'lucide-react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';

import { AppButton, AppFormInput, AppReveal, AppText } from '@/shared/components';

import AuthScaffold from '../components/AuthScaffold';
import ChargingIllustration from '../components/ChargingIllustration';
import TermsLine from '../components/TermsLine';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';

import { useLoginForm } from '../hooks/useLoginForm';

const LoginScreen = () => {
  const t = useTheme();
  const login = useLoginForm();
  const fadeIn = FadeIn.duration(t.motion.duration).easing(Easing.out(Easing.quad));

  return (
    <AuthScaffold
      hero={
        <>
          <AppReveal
            index={0}
            style={[styles.art, { marginBottom: t.space[6], marginRight: -t.layout.screenPadding }]}
          >
            <ChargingIllustration />
          </AppReveal>
          <AppReveal index={1}>
            <Animated.View key={login.type} entering={fadeIn} style={{ gap: t.space[2] }}>
              <AppText variant="hero" accessibilityRole="header">
                {login.copy.title}
              </AppText>
              <AppText variant="callout" tone="secondary">
                {login.copy.subtitle}
              </AppText>
            </Animated.View>
          </AppReveal>
        </>
      }
      footer={
        <>
          <AppButton
            label="Continue"
            onPress={login.submit}
            disabled={!login.valid}
            loading={login.submitting}
          />
          <TermsLine onTerms={login.openTerms} onPrivacy={login.openPrivacy} />
        </>
      }
    >
      <AppReveal index={2} style={{ gap: t.space[1] }}>
        <Animated.View key={login.type} entering={fadeIn}>
          {login.type === 'phone' ? (
            <AppFormInput
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
            <AppFormInput
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
        {login.canSwitchType || login.showFleetLogin ? (
          <View style={styles.links}>
            {login.canSwitchType ? (
              <AppButton
                label={login.type === 'phone' ? 'Use email instead' : 'Use phone instead'}
                variant="ghost"
                size="medium"
                haptic="selection"
                onPress={login.switchType}
                style={styles.linkLeft}
              />
            ) : (
              <View />
            )}
            {login.showFleetLogin ? (
              <AppButton
                label="Fleet Login"
                variant="ghost"
                size="medium"
                haptic="selection"
                onPress={login.openFleetLogin}
                style={styles.linkRight}
              />
            ) : null}
          </View>
        ) : null}
      </AppReveal>
    </AuthScaffold>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  art: { flex: 1, minHeight: 0 },
  links: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkLeft: { marginLeft: -16 },
  linkRight: { marginRight: -16 },
});
