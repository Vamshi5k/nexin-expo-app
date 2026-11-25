import { StyleSheet, View } from 'react-native';

import { IdCard, Truck, Zap } from 'lucide-react-native';

import { AppButton, AppFormInput, AppReveal, AppText } from '@/shared/components';

import AuthScaffold from '../components/AuthScaffold';
import TermsLine from '../components/TermsLine';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';

import { FLEET_LOGIN_COPY } from '../constants/auth.constants';
import { useFleetLoginForm } from '../hooks/useFleetLoginForm';

const FleetLoginScreen = () => {
  const t = useTheme();
  const login = useFleetLoginForm();
  const copy = FLEET_LOGIN_COPY;

  return (
    <AuthScaffold
      back
      hero={
        <AppReveal index={0} style={{ gap: t.space[2] }}>
          <View
            style={[
              styles.badge,
              {
                gap: t.space[1],
                paddingHorizontal: t.space[3],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.surface,
                borderColor: t.colors.border,
              },
            ]}
          >
            <Truck color={t.colors.accentText} size={14} strokeWidth={2} />
            <AppText variant="caption" tone="accent">
              {copy.badge}
            </AppText>
          </View>
          <AppText variant="hero" accessibilityRole="header">
            {copy.title}
          </AppText>
          <AppText variant="callout" tone="secondary">
            {copy.subtitle}
          </AppText>
        </AppReveal>
      }
      footer={
        <>
          <AppButton
            label={copy.submit}
            onPress={login.submit}
            disabled={!login.valid}
            loading={login.submitting}
          />
          <View style={[styles.info, { gap: t.space[2] }]}>
            <Zap color={t.colors.textTertiary} size={14} strokeWidth={1.75} />
            <AppText variant="caption" tone="secondary" style={styles.infoText}>
              {copy.info}
            </AppText>
          </View>
          <TermsLine onTerms={login.openTerms} onPrivacy={login.openPrivacy} />
        </>
      }
    >
      <AppReveal index={1} style={{ gap: t.space[4] }}>
        <AppFormInput
          control={login.control}
          name="fleetId"
          label={copy.fleetIdLabel}
          placeholder={copy.fleetIdPlaceholder}
          icon={IdCard}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          returnKeyType="next"
        />
        <AppFormInput
          control={login.control}
          name="contact"
          label={copy.phoneLabel}
          prefix={brand.phoneCountryCode}
          placeholder={brand.phonePlaceholder}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel-national"
          maxLength={brand.phoneLength}
          returnKeyType="done"
          onSubmitEditing={login.submit}
        />
      </AppReveal>
    </AuthScaffold>
  );
};

export default FleetLoginScreen;

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  info: { flexDirection: 'row', alignItems: 'flex-start' },
  infoText: { flex: 1 },
});
