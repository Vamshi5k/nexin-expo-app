import type { Href } from 'expo-router';

import type { OnboardingSlide, StartRoute } from '../types/auth.types';

export const CONSUMER_OTP_LENGTH = 4;
export const FLEET_OTP_LENGTH = 4;
export const FLEET_ID_MIN_LENGTH = 4;
export const FLEET_ID_PATTERN = /^[A-Za-z0-9-]+$/;
export const OTP_RESEND_SECONDS = 30;
export const SESSION_CHECK_TIMEOUT_MS = 25_000;
export const LOGOUT_TIMEOUT_MS = 8_000;
// Matches the dialog's fade-out, so Login replaces the screen only after the dialog is gone.
export const LOGOUT_DIALOG_EXIT_MS = 220;

// screen-audit 6.2, with the audit's fix: "Log out" as the verb, not "Logout".
export const LOGOUT_COPY = {
  title: 'Log out?',
  message: 'Are you sure you want to log out of your account?',
  confirm: 'Yes, log out',
  cancel: 'Cancel',
} as const;

// Same key and value the old app wrote, so existing installs skip onboarding.
export const ONBOARDING_DONE_VALUE = 'completed';

export const START_HREF = {
  onboarding: '/(auth)/onboarding',
  login: '/(auth)/login',
  setup: '/(setup)/profile',
  // Not (tabs)/index: groups add nothing to the URL, so that would also be "/" and clash with
  // the root StartRedirect; a guard redirect to "/" from inside (app) then looped forever.
  home: '/(app)/(tabs)/home',
  fleet: '/(fleet)/fleet',
} as const satisfies Record<StartRoute, Href>;

export const FLEET_HREF = {
  login: '/(auth)/(fleet-auth)/fleet-login',
  otp: '/(auth)/(fleet-auth)/fleet-otp',
} as const satisfies Record<string, Href>;

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

// screen-audit 7.1 and 7.2. The OTP timer says "Resend in", as on the consumer OTP: the old
// "Code expires in" was the resend cooldown, not an expiry.
export const FLEET_LOGIN_COPY = {
  badge: 'Fleet Operator',
  title: 'Fleet Operator Login',
  subtitle: 'Enter your Fleet ID and registered mobile number',
  fleetIdLabel: 'Fleet ID',
  fleetIdPlaceholder: 'e.g. FLT-2024-001',
  phoneLabel: 'Registered Mobile',
  submit: 'Access Fleet',
  info: 'Your Fleet ID was provided during onboarding. Contact support if you need help locating it.',
  sent: 'Verification code sent successfully',
} as const;

export const OTP_COPY = {
  consumer: {
    title: 'Enter verification code',
    subtitle: (length: number) => `We've sent a ${length}-digit code to`,
    verify: 'Verify',
    helpPrompt: "Didn't receive the code?",
    resent: 'New OTP sent!',
  },
  fleet: {
    title: 'Verify your identity',
    subtitle: (length: number) => `A ${length}-digit security code was sent to`,
    codeLabel: 'Enter security code',
    verify: 'Verify & Access Fleet',
    helpPrompt: 'Wrong number?',
    change: 'Change mobile',
    resent: 'New OTP sent successfully',
  },
} as const;
