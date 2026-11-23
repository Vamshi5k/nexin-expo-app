import { KV_KEYS, kv } from '@/core/storage';

import { isOnboardingDone, markOnboardingDone, resolveStartRoute } from '../routes';

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
