import { restoreSession } from '@/features/auth/session';

const calls: string[] = [];

jest.mock('@/core/log');
jest.mock('@/features/client-config', () => ({ usePrimeClientConfig: jest.fn() }));
jest.mock('@/features/fleet', () => ({ useFleet: jest.fn(), fleetApi: { logout: jest.fn() } }));
jest.mock('@/core/storage', () => ({
  hydrateStorage: jest.fn(async () => {
    calls.push('storage');
  }),
  migrateLegacyStorage: jest.fn(async () => {
    calls.push('migrate');
    return { status: 'migrated', moved: [] };
  }),
}));
jest.mock('@/core/session', () => ({
  sessionStore: {
    getState: () => ({
      hydrate: async () => {
        calls.push('hydrate');
      },
    }),
  },
}));

describe('restoreSession', () => {
  beforeEach(() => (calls.length = 0));

  it('loads storage, migrates legacy storage, then hydrates the session', async () => {
    await restoreSession();
    expect(calls).toEqual(['storage', 'migrate', 'hydrate']);
  });

  it('still hydrates if the migration throws', async () => {
    const { migrateLegacyStorage } = jest.requireMock('@/core/storage');
    migrateLegacyStorage.mockImplementationOnce(async () => {
      throw new Error('boom');
    });
    await restoreSession();
    expect(calls).toEqual(['storage', 'hydrate']);
  });
});
