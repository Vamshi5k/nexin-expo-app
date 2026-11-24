import type { SecureStorage } from '@/core/storage';

import { createSessionStore } from '@/core/session';

jest.mock('@/core/log');

function fakeSecure(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  let failRemoves = false;
  const storage: SecureStorage = {
    get: async (k) => map.get(k) ?? null,
    set: async (k, v) => void map.set(k, v),
    remove: async (k) => {
      if (failRemoves) throw new Error('keychain error');
      map.delete(k);
    },
  };
  return { storage, map, failRemoves: () => (failRemoves = true) };
}

const T = { accessToken: 'a', refreshToken: 'r' };
const F = { accessToken: 'fa', refreshToken: 'fr' };

describe('session store', () => {
  it('hydrates signed out when nothing is stored', async () => {
    const s = createSessionStore(fakeSecure().storage);
    expect(s.getState().status).toBe('loading');
    await s.getState().hydrate();
    expect(s.getState()).toMatchObject({ status: 'ready', mode: 'none', tokens: null });
  });

  it('hydrates a consumer or fleet session from SecureStore', async () => {
    const c = createSessionStore(fakeSecure({ access_token: 'a', refresh_token: 'r' }).storage);
    await c.getState().hydrate();
    expect(c.getState()).toMatchObject({ mode: 'consumer', tokens: T });

    const f = createSessionStore(fakeSecure({ fleetToken: 'fa', fleetRefreshToken: 'fr' }).storage);
    await f.getState().hydrate();
    expect(f.getState()).toMatchObject({ mode: 'fleet', tokens: F });
  });

  it('with both sessions stored, keeps consumer and deletes fleet (bug 12)', async () => {
    const fake = fakeSecure({
      access_token: 'a',
      refresh_token: 'r',
      fleetToken: 'fa',
      fleetRefreshToken: 'fr',
    });
    const s = createSessionStore(fake.storage);
    await s.getState().hydrate();
    expect(s.getState().mode).toBe('consumer');
    expect([...fake.map.keys()].sort()).toEqual(['access_token', 'refresh_token']);
  });

  it('signing in to one mode clears the other', async () => {
    const fake = fakeSecure({ access_token: 'a', refresh_token: 'r' });
    const s = createSessionStore(fake.storage);
    await s.getState().hydrate();
    await s.getState().signIn('fleet', F);
    expect(s.getState()).toMatchObject({ mode: 'fleet', tokens: F });
    expect(Object.fromEntries(fake.map)).toEqual({ fleetToken: 'fa', fleetRefreshToken: 'fr' });
  });

  it('updateTokens saves to the active mode keys only', async () => {
    const fake = fakeSecure();
    const s = createSessionStore(fake.storage);
    await s.getState().signIn('fleet', F);
    await s.getState().updateTokens({ accessToken: 'fa2', refreshToken: 'fr2' });
    expect(Object.fromEntries(fake.map)).toEqual({ fleetToken: 'fa2', fleetRefreshToken: 'fr2' });
  });

  it('signOut clears locally even when deleting from storage fails', async () => {
    const fake = fakeSecure();
    const s = createSessionStore(fake.storage);
    await s.getState().signIn('consumer', T);
    fake.failRemoves();
    await s.getState().signOut();
    expect(s.getState()).toMatchObject({ mode: 'none', tokens: null });
  });
});
