import { bootstrap } from '../bootstrap';

const calls: string[] = [];

jest.mock('@/core/log');
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

describe('bootstrap', () => {
  beforeEach(() => (calls.length = 0));

  it('migrates legacy storage before hydrating the session', async () => {
    await bootstrap();
    expect(calls).toEqual(['migrate', 'hydrate']);
  });

  it('still hydrates if the migration throws', async () => {
    const { migrateLegacyStorage } = jest.requireMock('@/core/storage');
    migrateLegacyStorage.mockImplementationOnce(async () => {
      throw new Error('boom');
    });
    await bootstrap();
    expect(calls).toEqual(['hydrate']);
  });
});
