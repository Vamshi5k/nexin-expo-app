import type { Href } from 'expo-router';

import type { OnboardingSlide, StartRoute } from './types';

export const CONSUMER_OTP_LENGTH = 4;
export const OTP_RESEND_SECONDS = 30;
export const SESSION_CHECK_TIMEOUT_MS = 25_000;
export const LOGOUT_TIMEOUT_MS = 8_000;

// Same key and value the old app wrote, so existing installs skip onboarding.
export const ONBOARDING_DONE_VALUE = 'completed';

export const START_HREF = {
  onboarding: '/(auth)/onboarding',
  login: '/(auth)/login',
  setup: '/(setup)/profile',
  home: '/(app)/(tabs)',
  fleet: '/(fleet)/fleet',
} as const satisfies Record<StartRoute, Href>;

export const LOGIN_COPY = {
  phone: { title: 'Enter mobile number', subtitle: "We'll send a confirmation code" },
  email: { title: 'Enter email', subtitle: "We'll send a verification code" },
} as const;

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: 'find',
    title: 'Find Chargers',
    description: 'Discover nearby charging stations with live availability and pricing',
  },
  {
    key: 'charge',
    title: 'Start Charging',
    description: 'Select a charger, enter amount, and start or stop charging instantly',
  },
  {
    key: 'pay',
    title: 'Pay & Track',
    description: 'Make secure payments, track sessions, manage vehicles, and get updates',
  },
];
