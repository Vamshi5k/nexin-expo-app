import type { Href } from 'expo-router';

import type { SessionMode } from '@/core/session';
import { KV_KEYS, kv } from '@/core/storage';

import type { User } from './types';

export type StartRoute = 'onboarding' | 'login' | 'setup' | 'home' | 'fleet';

/**
 * Group-qualified hrefs: the root index and (app)/(tabs)/index both match "/", so every
 * redirect names its group explicitly.
 */
export const START_HREF = {
  onboarding: '/(auth)/onboarding',
  login: '/(auth)/login',
  setup: '/(setup)/profile',
  home: '/(app)/(tabs)',
  fleet: '/(fleet)/fleet',
} as const satisfies Record<StartRoute, Href>;

/** BLUEPRINT A1 routing. `user` is the consumer user once loaded. */
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

/**
 * What a route-group layout does. 'redirect' always goes to "/", whose start redirect picks
 * the right place. 'end-session': a fleet session while the fleet feature is off has no valid
 * screens, so it is signed out (then "/" sends the user to login).
 */
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

/** firstlogin = 'completed' once onboarding is finished or skipped (never on mount). */
export const ONBOARDING_DONE_VALUE = 'completed';

export function isOnboardingDone(): boolean {
  return kv.getString(KV_KEYS.firstLogin) === ONBOARDING_DONE_VALUE;
}

export function markOnboardingDone(): void {
  kv.setString(KV_KEYS.firstLogin, ONBOARDING_DONE_VALUE);
}
