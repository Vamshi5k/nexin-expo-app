import { createSessionStore, signOutThen } from '@/core/session';
import type { SecureStorage } from '@/core/storage';
import { serverLogout } from '@/features/auth/session';

jest.mock('@/core/log');
jest.mock('@/features/fleet', () => ({
  fleetApi: { logout: jest.fn(async () => undefined) },
}));
jest.mock('@/features/auth/api', () => ({
  ...jest.requireActual('@/features/auth/api'),
  logout: jest.fn(async () => undefined),
}));

const fleetLogout = (jest.requireMock('@/features/fleet') as { fleetApi: { logout: jest.Mock } })
  .fleetApi.logout;
const { logout } = jest.requireMock('@/features/auth/api') as { logout: jest.Mock };
const { log } = jest.requireMock('@/core/log') as { log: { warn: jest.Mock } };

function memoryStorage(): SecureStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: async k => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async k => void data.delete(k),
  };
}

const flush = () => new Promise(r => setImmediate(r));

describe('serverLogout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('consumer -> POST /auth/logout with the given token', async () => {
    await serverLogout('consumer', 'tok');
    expect(logout).toHaveBeenCalledWith('tok');
    expect(fleetLogout).not.toHaveBeenCalled();
  });

  it('fleet -> GET /fleet/logout (BLUEPRINT)', async () => {
    await serverLogout('fleet', 'tok');
    expect(fleetLogout).toHaveBeenCalledWith('tok');
    expect(logout).not.toHaveBeenCalled();
  });

  it('no session -> no request', async () => {
    await serverLogout('none', null);
    expect(logout).not.toHaveBeenCalled();
    expect(fleetLogout).not.toHaveBeenCalled();
  });
});

describe('logout: signOutThen(serverLogout)', () => {
  beforeEach(() => jest.clearAllMocks());

  async function signedIn(mode: 'consumer' | 'fleet' = 'consumer') {
    const storage = memoryStorage();
    const store = createSessionStore(storage);
    await store.getState().signIn(mode, { accessToken: 'acc', refreshToken: 'ref' });
    return { store, storage };
  }

  it('clears the session locally without waiting for the server', async () => {
    logout.mockImplementationOnce(() => new Promise(() => undefined));
    const { store, storage } = await signedIn();
    await signOutThen(serverLogout, store);
    expect(store.getState().mode).toBe('none');
    expect(store.getState().tokens).toBeNull();
    expect(storage.data.size).toBe(0);
  });

  it('calls the server with the token captured before clearing', async () => {
    const { store } = await signedIn('fleet');
    await signOutThen(serverLogout, store);
    expect(fleetLogout).toHaveBeenCalledWith('acc');
  });

  it('a failing server call is logged, never thrown', async () => {
    logout.mockImplementationOnce(async () => {
      throw new Error('offline');
    });
    const { store } = await signedIn();
    await expect(signOutThen(serverLogout, store)).resolves.toBeUndefined();
    await flush();
    expect(store.getState().mode).toBe('none');
    expect(log.warn).toHaveBeenCalled();
  });

  it('does nothing when already signed out', async () => {
    const store = createSessionStore(memoryStorage());
    await store.getState().hydrate();
    await signOutThen(serverLogout, store);
    expect(logout).not.toHaveBeenCalled();
  });
});
