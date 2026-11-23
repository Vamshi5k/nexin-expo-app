import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { getErrorMessage } from '@/core/api';
import { brand } from '@/core/config';
import { log } from '@/core/log';
import { AppLogo, useClientConfig } from '@/features/client-config';
import { useTheme } from '@/theme';
import { Button, FormInput, Screen, Text, toast } from '@/ui';

import { useRequestOtp } from '../hooks';
import { emailFormSchema, phoneFormSchema, type ContactForm } from '../schemas';
import type { ContactType } from '../types';

/** Copy from docs/screen-audit.md 2.3. Email subtitle is a documented deviation. */
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

/** BLUEPRINT A3. Phone or email by the runtime loginType. */
export function LoginScreen() {
  const t = useTheme();
  const config = useClientConfig();
  const [override, setOverride] = useState<ContactType | null>(null);
  // "Use email instead" exists only when the client logs in by phone.
  const type: ContactType = config.loginType === 'email' ? 'email' : (override ?? 'phone');
  const requestOtp = useRequestOtp();

  const form = useForm<ContactForm>({
    resolver: zodResolver(type === 'phone' ? phoneFormSchema : emailFormSchema),
    defaultValues: { contact: '' },
    mode: 'onTouched',
  });
  const contact = form.watch('contact');
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
    <Screen
      edges={['top']}
      scroll
      footer={
        <View style={{ gap: t.space[3] }}>
          <Button
            label="Continue"
            onPress={submit}
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
        </View>
      }
      contentStyle={{ paddingTop: t.space[12], gap: t.space[8] }}
    >
      <AppLogo height={44} />
      <View style={{ gap: t.space[2] }}>
        <Text variant="title1" accessibilityRole="header">
          {COPY[type].title}
        </Text>
        <Text tone="secondary">{COPY[type].subtitle}</Text>
      </View>
      <View style={{ gap: t.space[2] }}>
        {type === 'phone' ? (
          <FormInput
            key="phone"
            control={form.control}
            name="contact"
            prefix={brand.phoneCountryCode}
            placeholder={brand.phonePlaceholder}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel-national"
            maxLength={brand.phoneLength}
            accessibilityLabel="Mobile number"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        ) : (
          <FormInput
            key="email"
            control={form.control}
            name="contact"
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
            onSubmitEditing={submit}
          />
        )}
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
          {config.features.fleet ? (
            <Button
              label="Fleet Login"
              variant="ghost"
              size="medium"
              onPress={() => router.push('/(auth)/fleet-login')}
              style={styles.linkRight}
            />
          ) : null}
        </View>
      </View>
    </Screen>
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
  // Ghost buttons carry 16 pt padding; pull them flush with the input edges.
  linkLeft: { marginLeft: -16 },
  linkRight: { marginRight: -16 },
  underline: { textDecorationLine: 'underline' },
});
