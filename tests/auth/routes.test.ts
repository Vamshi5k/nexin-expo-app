import { KV_KEYS, kv } from '@/core/storage';

import {
  guardRoute,
  isOnboardingDone,
  markOnboardingDone,
  resolveStartRoute,
} from '@/features/auth/utils/authFlow';
import type { GuardDecision, RouteGroup } from '@/features/auth/types/auth.types';

describe('resolveStartRoute (BLUEPRINT A1)', () => {
  it('fleet session -> fleet', () => {
    expect(resolveStartRoute({ mode: 'fleet', user: null, onboardingDone: true })).toBe('fleet');
  });

  it('consumer first login -> setup; returning -> home; loading -> null', () => {
    expect(
      resolveStartRoute({ mode: 'consumer', user: { isFirstLogin: true }, onboardingDone: true }),
    ).toBe('setup');
    expect(
      resolveStartRoute({ mode: 'consumer', user: { isFirstLogin: false }, onboardingDone: false }),
    ).toBe('home');
    expect(
      resolveStartRoute({ mode: 'consumer', user: undefined, onboardingDone: true }),
    ).toBeNull();
  });

  it('first login with setup already finished on this device -> home (OPEN_QUESTIONS #14)', () => {
    expect(
      resolveStartRoute({
        mode: 'consumer',
        user: { isFirstLogin: true },
        onboardingDone: true,
        setupDone: true,
      }),
    ).toBe('home');
  });

  it('no session -> login after onboarding, else onboarding', () => {
    expect(resolveStartRoute({ mode: 'none', user: null, onboardingDone: true })).toBe('login');
    expect(resolveStartRoute({ mode: 'none', user: null, onboardingDone: false })).toBe(
      'onboarding',
    );
  });
});

describe('onboarding flag', () => {
  beforeEach(() => kv.remove(KV_KEYS.firstLogin));

  it("is 'completed' only after markOnboardingDone (old app's value)", () => {
    expect(isOnboardingDone()).toBe(false);
    markOnboardingDone();
    expect(kv.getString(KV_KEYS.firstLogin)).toBe('completed');
    expect(isOnboardingDone()).toBe(true);
  });
});

describe('guardRoute', () => {
  const cases: [RouteGroup, 'none' | 'consumer' | 'fleet', boolean, GuardDecision][] = [
    ['auth', 'none', false, 'allow'],
    ['auth', 'consumer', false, 'redirect'],
    ['auth', 'fleet', true, 'redirect'],
    // Fleet login/OTP: signed out and the fleet flag on, else the routes never open.
    ['fleet-auth', 'none', true, 'allow'],
    ['fleet-auth', 'none', false, 'redirect'],
    ['fleet-auth', 'consumer', true, 'redirect'],
    ['fleet-auth', 'fleet', true, 'redirect'],
    ['setup', 'consumer', false, 'allow'],
    ['setup', 'none', false, 'redirect'],
    ['setup', 'fleet', true, 'redirect'],
    // Logged-out deep link (e.g. cruzeev://wallet) must never open a consumer screen.
    ['app', 'none', true, 'redirect'],
    ['app', 'fleet', true, 'redirect'],
    ['app', 'consumer', false, 'allow'],
    ['fleet', 'fleet', true, 'allow'],
    ['fleet', 'fleet', false, 'end-session'],
    ['fleet', 'none', true, 'redirect'],
    ['fleet', 'consumer', true, 'redirect'],
  ];
  it.each(cases)('(%s) with %s session, fleet %s -> %s', (group, mode, fleetEnabled, want) => {
    expect(guardRoute(group, { mode, fleetEnabled })).toBe(want);
  });
});
