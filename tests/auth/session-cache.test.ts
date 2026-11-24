import { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/core/query';
import { createSessionStore } from '@/core/session';
import type { SecureKey, SecureStorage } from '@/core/storage';

import { clearUserDataOnSessionChange } from '@/features/auth/hooks';

jest.mock('@/core/log');
jest.mock('@/features/client-config', () => ({ primeClientConfig: jest.fn() }));
jest.mock('@/features/fleet', () => ({ fleetMeQuery: jest.fn() }));

function memoryStorage(): SecureStorage {
  const m = new Map<SecureKey, string>();
  return {
    get: async (k) => m.get(k) ?? null,
    set: async (k, v) => void m.set(k, v),
    remove: async (k) => void m.delete(k),
  } as SecureStorage;
}

const TOKENS = { accessToken: 'a', refreshToken: 'r' };

function setup() {
  const qc = new QueryClient();
  const store = createSessionStore(memoryStorage());
  qc.setQueryData(queryKeys.clientConfig(), { brandName: 'X' });
  qc.setQueryData(queryKeys.me(), { id: 'old-user' });
  const unsubscribe = clearUserDataOnSessionChange(qc, store);
  return { qc, store, unsubscribe };
}

describe('clearUserDataOnSessionChange', () => {
  it('drops user data on sign-in and keeps the client config', async () => {
    const { qc, store } = setup();
    await store.getState().signIn('consumer', TOKENS);
    expect(qc.getQueryData(queryKeys.me())).toBeUndefined();
    expect(qc.getQueryData(queryKeys.clientConfig())).toEqual({ brandName: 'X' });
  });

  it('drops user data on sign-out (e.g. refresh 4xx)', async () => {
    const { qc, store } = setup();
    await store.getState().signIn('consumer', TOKENS);
    qc.setQueryData(queryKeys.me(), { id: 'user' });
    await store.getState().signOut();
    expect(qc.getQueryData(queryKeys.me())).toBeUndefined();
  });

  it('keeps data when only the tokens change', async () => {
    const { qc, store } = setup();
    await store.getState().signIn('consumer', TOKENS);
    qc.setQueryData(queryKeys.me(), { id: 'user' });
    await store.getState().updateTokens({ accessToken: 'a2', refreshToken: 'r2' });
    expect(qc.getQueryData(queryKeys.me())).toEqual({ id: 'user' });
  });

  it('stops after unsubscribe', async () => {
    const { qc, store, unsubscribe } = setup();
    unsubscribe();
    await store.getState().signIn('consumer', TOKENS);
    expect(qc.getQueryData(queryKeys.me())).toEqual({ id: 'old-user' });
  });
});
