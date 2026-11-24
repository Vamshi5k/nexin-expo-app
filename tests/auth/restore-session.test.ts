import { restoreSession } from '@/features/auth/hooks';

const calls: string[] = [];

jest.mock('@/core/log');
jest.mock('@/features/client-config', () => ({ primeClientConfig: jest.fn() }));
jest.mock('@/features/fleet', () => ({ fleetMeQuery: jest.fn(), fleetLogout: jest.fn() }));
jest.mock('@/core/storage', () => ({
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

  it('migrates legacy storage before hydrating the session', async () => {
    await restoreSession();
    expect(calls).toEqual(['migrate', 'hydrate']);
  });

  it('still hydrates if the migration throws', async () => {
    const { migrateLegacyStorage } = jest.requireMock('@/core/storage');
    migrateLegacyStorage.mockImplementationOnce(async () => {
      throw new Error('boom');
    });
    await restoreSession();
    expect(calls).toEqual(['hydrate']);
  });
});
