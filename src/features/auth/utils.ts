import type { Href } from 'expo-router';
import { z } from 'zod';

import { brand, phonePattern } from '@/core/config';
import type { SessionMode } from '@/core/session';
import { KV_KEYS, kv } from '@/core/storage';

import type { User } from './types';

export const CONSUMER_OTP_LENGTH = 4;
export const OTP_RESEND_SECONDS = 30;

export function sanitizeOtp(input: string, length: number): string {
  return input.replace(/\D/g, '').slice(0, length);
}

export type OtpCellState = 'filled' | 'active' | 'empty';

export function otpCells(value: string, length: number): { digit: string; state: OtpCellState }[] {
  return Array.from({ length }, (_, i) => ({
    digit: value[i] ?? '',
    state: i < value.length ? 'filled' : i === value.length ? 'active' : 'empty',
  }));
}

export function formatContact(type: 'phone' | 'email', value: string, countryCode: string): string {
  if (type === 'email') return value;
  const half = Math.ceil(value.length / 2);
  return `${countryCode} ${value.slice(0, half)} ${value.slice(half)}`.trim();
}

export type StartRoute = 'onboarding' | 'login' | 'setup' | 'home' | 'fleet';

export const START_HREF = {
  onboarding: '/(auth)/onboarding',
  login: '/(auth)/login',
  setup: '/(setup)/profile',
  home: '/(app)/(tabs)',
  fleet: '/(fleet)/fleet',
} as const satisfies Record<StartRoute, Href>;

export function resolveStartRoute(input: {
  mode: SessionMode;
  user: Pick<User, 'isFirstLogin'> | null | undefined;
  onboardingDone: boolean;
}): StartRoute | null {
  if (input.mode === 'fleet') return 'fleet';
  if (input.mode === 'consumer') {
    if (!input.user) return null; // still loading
    return input.user.isFirstLogin ? 'setup' : 'home';
  }
  return input.onboardingDone ? 'login' : 'onboarding';
}

export type RouteGroup = 'auth' | 'setup' | 'app' | 'fleet';

export type GuardDecision = 'allow' | 'redirect' | 'end-session';

export function guardRoute(
  group: RouteGroup,
  input: { mode: SessionMode; fleetEnabled: boolean },
): GuardDecision {
  switch (group) {
    case 'auth':
      return input.mode === 'none' ? 'allow' : 'redirect';
    case 'setup':
    case 'app':
      return input.mode === 'consumer' ? 'allow' : 'redirect';
    case 'fleet':
      if (input.mode !== 'fleet') return 'redirect';
      return input.fleetEnabled ? 'allow' : 'end-session';
  }
}

export const ONBOARDING_DONE_VALUE = 'completed';

export function isOnboardingDone(): boolean {
  return kv.getString(KV_KEYS.firstLogin) === ONBOARDING_DONE_VALUE;
}

export function markOnboardingDone(): void {
  kv.setString(KV_KEYS.firstLogin, ONBOARDING_DONE_VALUE);
}

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .regex(/^\d+$/, 'Enter a valid mobile number')
  .length(brand.phoneLength, `Enter a ${brand.phoneLength}-digit mobile number`)
  .regex(phonePattern, 'Enter a valid mobile number');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'));

export const otpSchema = (length: number) => z.string().regex(/^\d+$/).length(length);

export const phoneFormSchema = z.object({ contact: phoneSchema });
export const emailFormSchema = z.object({ contact: emailSchema });
export type ContactForm = { contact: string };
