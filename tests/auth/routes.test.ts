import { KV_KEYS, kv } from '@/core/storage';

import { checkPermission } from '@/core/permissions';
import {
  guardRoute,
  isOnboardingDone,
  markOnboardingDone,
  resolveStartRoute,
  saveSetupStep,
  setupPermissionsGranted,
  setupStepFor,
} from '@/features/auth/utils/authFlow';
import type { GuardDecision, RouteGroup, SetupStep } from '@/features/auth/types/auth.types';

jest.mock('@/core/log');
jest.mock('@/core/permissions', () => ({ checkPermission: jest.fn() }));

describe('resolveStartRoute (BLUEPRINT A1)', () => {
  it('fleet session -> fleet', () => {
    expect(resolveStartRoute({ mode: 'fleet', user: null, onboardingDone: true })).toBe('fleet');
  });

  it('consumer: no saved step -> profile on first login, home otherwise; loading -> null', () => {
    expect(
      resolveStartRoute({ mode: 'consumer', user: { isFirstLogin: true }, onboardingDone: true }),
    ).toBe('profile');
    expect(
      resolveStartRoute({ mode: 'consumer', user: { isFirstLogin: false }, onboardingDone: false }),
    ).toBe('home');
    expect(
      resolveStartRoute({ mode: 'consumer', user: undefined, onboardingDone: true }),
    ).toBeNull();
  });

  const consumer = (setupStep: SetupStep, permissionsGranted?: boolean | null) =>
    resolveStartRoute({
      mode: 'consumer',
      user: { isFirstLogin: true },
      onboardingDone: true,
      setupStep,
      permissionsGranted,
    });

  it('resumes at the saved step', () => {
    expect(consumer('profile')).toBe('profile');
    expect(consumer('vehicle')).toBe('vehicle');
    expect(consumer('done')).toBe('home');
  });

  it('Permissions step: waits for the check, both on -> home, any off -> permissions', () => {
    expect(consumer('permissions', null)).toBeNull();
    expect(consumer('permissions', true)).toBe('home');
    expect(consumer('permissions', false)).toBe('permissions');
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

describe('setup progress (per user, OPEN_QUESTIONS #14)', () => {
  beforeEach(() => {
    kv.remove(KV_KEYS.setupProgress);
    kv.remove(KV_KEYS.setupDoneFor);
  });

  it('no saved step: follows isFirstLogin', () => {
    expect(setupStepFor({ id: '1', isFirstLogin: true })).toBe('profile');
    expect(setupStepFor({ id: '1', isFirstLogin: false })).toBe('done');
  });

  it('a saved step wins over isFirstLogin either way', () => {
    saveSetupStep('1', 'vehicle');
    expect(setupStepFor({ id: '1', isFirstLogin: true })).toBe('vehicle');
    expect(setupStepFor({ id: '1', isFirstLogin: false })).toBe('vehicle');
    saveSetupStep('1', 'done');
    expect(setupStepFor({ id: '1', isFirstLogin: true })).toBe('done');
  });

  it('two users on one phone keep their own step', () => {
    saveSetupStep('a', 'done');
    saveSetupStep('b', 'vehicle');
    expect(setupStepFor({ id: 'a', isFirstLogin: true })).toBe('done');
    expect(setupStepFor({ id: 'b', isFirstLogin: true })).toBe('vehicle');
  });

  it('still honours the old single setup_done_for key', () => {
    kv.setString(KV_KEYS.setupDoneFor, '7');
    expect(setupStepFor({ id: '7', isFirstLogin: true })).toBe('done');
    expect(setupStepFor({ id: '8', isFirstLogin: true })).toBe('profile');
  });

  it('ignores a corrupt saved value', () => {
    kv.setJSON(KV_KEYS.setupProgress, { 1: 'somewhere' });
    expect(setupStepFor({ id: '1', isFirstLogin: true })).toBe('profile');
  });
});

describe('setupPermissionsGranted', () => {
  it('is true only when location and notifications are both granted', async () => {
    jest.mocked(checkPermission).mockResolvedValue('granted');
    await expect(setupPermissionsGranted()).resolves.toBe(true);

    jest
      .mocked(checkPermission)
      .mockImplementation(async kind => (kind === 'location' ? 'granted' : 'denied'));
    await expect(setupPermissionsGranted()).resolves.toBe(false);

    jest.mocked(checkPermission).mockRejectedValue(new Error('boom'));
    await expect(setupPermissionsGranted()).resolves.toBe(false);
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
    ['setup', 'none', false, 'redirect'],
    ['setup', 'fleet', true, 'redirect'],
    // Logged-out deep link (e.g. cruzeev://wallet) must never open a consumer screen.
    ['app', 'none', true, 'redirect'],
    ['app', 'fleet', true, 'redirect'],
    ['fleet', 'fleet', true, 'allow'],
    ['fleet', 'fleet', false, 'end-session'],
    ['fleet', 'none', true, 'redirect'],
    ['fleet', 'consumer', true, 'redirect'],
  ];
  it.each(cases)('(%s) with %s session, fleet %s -> %s', (group, mode, fleetEnabled, want) => {
    expect(guardRoute(group, { mode, fleetEnabled })).toBe(want);
  });
});

describe('guardRoute: consumer setup and app screens', () => {
  const cases: [RouteGroup, SetupStep | null, string | undefined, GuardDecision][] = [
    // (app) opens only once setup is done.
    ['app', 'done', 'home', 'allow'],
    ['app', 'profile', 'home', 'redirect'],
    ['app', 'permissions', 'home', 'redirect'],
    ['app', null, 'home', 'redirect'],
    // (setup) opens only the current step.
    ['setup', 'profile', 'profile', 'allow'],
    ['setup', 'vehicle', 'vehicle', 'allow'],
    ['setup', 'permissions', 'vehicle', 'redirect'],
    ['setup', 'permissions', 'profile', 'redirect'],
    ['setup', 'profile', 'permissions', 'redirect'],
    ['setup', 'done', 'profile', 'redirect'],
    ['setup', null, 'profile', 'redirect'],
  ];
  it.each(cases)('(%s) at step %s opening %s -> %s', (group, setupStep, screen, want) => {
    expect(guardRoute(group, { mode: 'consumer', fleetEnabled: false, setupStep, screen })).toBe(
      want,
    );
  });
});
