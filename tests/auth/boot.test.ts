import { AxiosError, AxiosHeaders } from 'axios';

import { createSessionStore } from '@/core/session';
import type { SecureStorage } from '@/core/storage';
import { bootTimeoutError, checkSession, classifySessionError } from '@/features/auth/session';

jest.mock('@/core/log');
jest.mock('@/features/client-config', () => ({ usePrimeClientConfig: jest.fn() }));
jest.mock('@/features/fleet', () => ({ useFleet: jest.fn(), fleetLogout: jest.fn() }));

function httpError(status: number) {
  const headers = new AxiosHeaders();
  return new AxiosError('http', 'ERR', { headers }, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers },
    data: {},
  });
}

function memoryStorage(): SecureStorage {
  const m = new Map<string, string>();
  return {
    get: async k => m.get(k) ?? null,
    set: async (k, v) => void m.set(k, v),
    remove: async k => void m.delete(k),
  };
}

async function storeIn(mode: 'none' | 'consumer' | 'fleet') {
  const store = createSessionStore(memoryStorage());
  if (mode === 'none') await store.getState().hydrate();
  else await store.getState().signIn(mode, { accessToken: 'a', refreshToken: 'r' });
  return store;
}

function loaders() {
  return {
    loadUser: jest.fn(async () => ({ id: '7' })),
    loadDriver: jest.fn(async () => ({ id: 'f1' })),
  };
}

describe('classifySessionError', () => {
  it.each([400, 401, 403, 404, 422])('%i -> expired', s => {
    expect(classifySessionError(httpError(s))).toBe('expired');
  });
  it.each([408, 429, 500, 503])('%i -> retryable', s => {
    expect(classifySessionError(httpError(s))).toBe('retryable');
  });
  it('network errors and timeouts -> retryable', () => {
    expect(classifySessionError(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('retryable');
    expect(classifySessionError(bootTimeoutError())).toBe('retryable');
  });
});

describe('checkSession', () => {
  it('no session -> ready without any request', async () => {
    const l = loaders();
    await expect(checkSession(l, 1000, await storeIn('none'))).resolves.toBe('ready');
    expect(l.loadUser).not.toHaveBeenCalled();
    expect(l.loadDriver).not.toHaveBeenCalled();
  });

  it('valid consumer session -> loads the user, ready', async () => {
    const l = loaders();
    const store = await storeIn('consumer');
    await expect(checkSession(l, 1000, store)).resolves.toBe('ready');
    expect(l.loadUser).toHaveBeenCalledTimes(1);
    expect(store.getState().mode).toBe('consumer');
  });

  it('fleet session -> loads the driver, not the user', async () => {
    const l = loaders();
    await expect(checkSession(l, 1000, await storeIn('fleet'))).resolves.toBe('ready');
    expect(l.loadDriver).toHaveBeenCalledTimes(1);
    expect(l.loadUser).not.toHaveBeenCalled();
  });

  it('401 -> signs out, ready', async () => {
    const l = loaders();
    l.loadUser.mockRejectedValue(httpError(401));
    const store = await storeIn('consumer');
    await expect(checkSession(l, 1000, store)).resolves.toBe('ready');
    expect(store.getState().mode).toBe('none');
  });

  it('500 -> error, session kept', async () => {
    const l = loaders();
    l.loadUser.mockRejectedValue(httpError(500));
    const store = await storeIn('consumer');
    await expect(checkSession(l, 1000, store)).resolves.toBe('error');
    expect(store.getState().mode).toBe('consumer');
  });

  it('timeout -> error, session kept', async () => {
    const l = loaders();
    l.loadUser.mockImplementation(() => new Promise(() => undefined));
    const store = await storeIn('consumer');
    await expect(checkSession(l, 20, store)).resolves.toBe('error');
    expect(store.getState().mode).toBe('consumer');
  });
});
