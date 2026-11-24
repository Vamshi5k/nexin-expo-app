import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';

import { getErrorMessage } from '@/core/api';
import { brand } from '@/core/config';
import { log } from '@/core/log';
import { AppLogo, useClientConfig } from '@/features/client-config';
import { useTheme } from '@/theme';
import { Button, FormInput, Reveal, Text, toast } from '@/ui';

import { AuthScaffold } from '../components/AuthScaffold';
import { useRequestOtp } from '../hooks';
import { emailFormSchema, phoneFormSchema, type ContactForm } from '../utils';
import type { ContactType } from '../types';

const COPY = {
  phone: { title: 'Enter mobile number', subtitle: "We'll send a confirmation code" },
  email: { title: 'Enter email', subtitle: "We'll send a verification code" },
} as const;

async function openLegal(url: string | null) {
  if (!url) {
    toast.error('Link not available');
    return;
  }
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    log.warn('could not open legal link', { error: String(error) });
    toast.error('Unable to open link');
  }
}

export function LoginScreen() {
  const t = useTheme();
  const config = useClientConfig();
  const [override, setOverride] = useState<ContactType | null>(null);
  const type: ContactType = config.loginType === 'email' ? 'email' : (override ?? 'phone');
  const requestOtp = useRequestOtp();

  const form = useForm<ContactForm>({
    resolver: zodResolver(type === 'phone' ? phoneFormSchema : emailFormSchema),
    defaultValues: { contact: '' },
    mode: 'onTouched',
  });
  const contact = useWatch({ control: form.control, name: 'contact' });
  const valid = (type === 'phone' ? phoneFormSchema : emailFormSchema).safeParse({
    contact,
  }).success;

  const switchType = () => {
    form.reset({ contact: '' });
    setOverride(type === 'phone' ? 'email' : 'phone');
  };

  const submit = form.handleSubmit(async ({ contact: raw }) => {
    const value = raw.trim();
    Keyboard.dismiss();
    try {
      await requestOtp.mutateAsync(value);
      router.push({ pathname: '/(auth)/otp', params: { type, value } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <AuthScaffold
      footer={
        <>
          <Button
            label="Continue"
            onPress={() => void submit()}
            disabled={!valid}
            loading={requestOtp.isPending}
          />
          <View style={styles.terms}>
            <Text variant="caption" tone="secondary">
              By continuing, you agree to our{' '}
            </Text>
            <LegalLink label="Terms" onPress={() => void openLegal(config.termsUrl)} />
            <Text variant="caption" tone="secondary">
              {' '}
              and{' '}
            </Text>
            <LegalLink label="Privacy" onPress={() => void openLegal(config.privacyUrl)} />
          </View>
        </>
      }
    >
      <Reveal index={0}>
        <AppLogo height={28} />
      </Reveal>
      <Reveal index={1}>
        <Animated.View
          key={type}
          entering={FadeIn.duration(t.motion.duration).easing(Easing.out(Easing.quad))}
          style={{ gap: t.space[2] }}
        >
          <Text variant="hero" accessibilityRole="header">
            {COPY[type].title}
          </Text>
          <Text variant="callout" tone="secondary">
            {COPY[type].subtitle}
          </Text>
        </Animated.View>
      </Reveal>
      <Reveal index={2} style={{ gap: t.space[2] }}>
        <Animated.View
          key={type}
          entering={FadeIn.duration(t.motion.duration).easing(Easing.out(Easing.quad))}
        >
          {type === 'phone' ? (
            <FormInput
              control={form.control}
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
              onSubmitEditing={() => void submit()}
            />
          ) : (
            <FormInput
              control={form.control}
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
              onSubmitEditing={() => void submit()}
            />
          )}
        </Animated.View>
        <View style={styles.links}>
          {config.loginType === 'phone' ? (
            <Button
              label={type === 'phone' ? 'Use email instead' : 'Use phone instead'}
              variant="ghost"
              size="medium"
              haptic="selection"
              onPress={switchType}
              style={styles.linkLeft}
            />
          ) : (
            <View />
          )}
          {/* TODO(phase-fleet): "Fleet Login" link to /(auth)/fleet-login when
              config.features.fleet is on (BLUEPRINT A3). Hidden until that route exists. */}
        </View>
      </Reveal>
    </AuthScaffold>
  );
}

function LegalLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} accessibilityRole="link">
      <Text variant="caption" tone="accent" style={styles.underline}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  terms: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  links: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkLeft: { marginLeft: -16 },
  underline: { textDecorationLine: 'underline' },
});
