import {
  KV_KEYS,
  migrateLegacyStorage,
  type KvStorage,
  type MigrationDeps,
  type SecureStorage,
} from '@/core/storage';

jest.mock('@/core/log');

function fakes(legacyData: Record<string, string>) {
  const legacy = new Map(Object.entries(legacyData));
  const secureMap = new Map<string, string>();
  const kvMap = new Map<string, string | boolean>();
  let failSecureWrites = false;

  const deps: MigrationDeps = {
    legacy: {
      multiGet: async keys => keys.map(k => [k, legacy.get(k) ?? null] as const),
      multiRemove: async keys => {
        keys.forEach(k => legacy.delete(k));
      },
    },
    secure: {
      get: async k => secureMap.get(k) ?? null,
      set: async (k, v) => {
        if (failSecureWrites) throw new Error('keychain locked');
        secureMap.set(k, v);
      },
      remove: async k => {
        secureMap.delete(k);
      },
    } satisfies SecureStorage,
    kv: {
      getString: k => kvMap.get(k) as string | undefined,
      setString: (k, v) => void kvMap.set(k, v),
      getBoolean: k => kvMap.get(k) as boolean | undefined,
      setBoolean: (k, v) => void kvMap.set(k, v),
      getJSON: () => undefined,
      setJSON: () => undefined,
      remove: k => kvMap.delete(k),
      contains: k => kvMap.has(k),
    } satisfies KvStorage,
  };
  return { deps, legacy, secureMap, kvMap, setFailSecure: (v: boolean) => (failSecureWrites = v) };
}

const OLD_APP = {
  access_token: 'a1',
  refresh_token: 'r1',
  fleetToken: 'f1',
  fleetRefreshToken: 'fr1',
  CLIENT_CONFIG: '{"brandName":"X"}',
  firstlogin: 'completed',
  FCM_TOKEN: 'fcm-1',
  FIRST_LAUNCH: 'false',
};

describe('migrateLegacyStorage', () => {
  it('moves tokens to SecureStore and the rest to MMKV, then deletes them', async () => {
    const f = fakes(OLD_APP);
    const result = await migrateLegacyStorage(f.deps);

    expect(result).toEqual({
      status: 'migrated',
      moved: expect.arrayContaining(Object.keys(OLD_APP).slice(0, 7)),
    });
    expect(Object.fromEntries(f.secureMap)).toEqual({
      access_token: 'a1',
      refresh_token: 'r1',
      fleetToken: 'f1',
      fleetRefreshToken: 'fr1',
    });
    expect(f.kvMap.get('CLIENT_CONFIG')).toBe('{"brandName":"X"}');
    expect(f.kvMap.get('firstlogin')).toBe('completed');
    expect(f.kvMap.get('FCM_TOKEN')).toBe('fcm-1');
    expect(f.kvMap.get(KV_KEYS.legacyMigrated)).toBe(true);
    // Only the dropped, never-read key remains in AsyncStorage.
    expect([...f.legacy.keys()]).toEqual(['FIRST_LAUNCH']);
  });

  it('is idempotent: a second run does nothing', async () => {
    const f = fakes(OLD_APP);
    await migrateLegacyStorage(f.deps);
    f.legacy.set('access_token', 'stale');
    expect(await migrateLegacyStorage(f.deps)).toEqual({ status: 'already-done' });
    expect(f.secureMap.get('access_token')).toBe('a1');
    expect(f.legacy.get('access_token')).toBe('stale');
  });

  it('sets the flag on a fresh install with nothing to move', async () => {
    const f = fakes({});
    expect(await migrateLegacyStorage(f.deps)).toEqual({ status: 'migrated', moved: [] });
    expect(f.kvMap.get(KV_KEYS.legacyMigrated)).toBe(true);
  });

  it('on failure deletes nothing, leaves the flag unset, and retries next launch', async () => {
    const f = fakes(OLD_APP);
    f.setFailSecure(true);
    expect(await migrateLegacyStorage(f.deps)).toMatchObject({ status: 'failed' });
    expect(f.legacy.get('access_token')).toBe('a1');
    expect(f.kvMap.has(KV_KEYS.legacyMigrated)).toBe(false);

    f.setFailSecure(false);
    expect(await migrateLegacyStorage(f.deps)).toMatchObject({ status: 'migrated' });
    expect(f.secureMap.get('access_token')).toBe('a1');
  });

  it('never overwrites values the new app already has', async () => {
    const f = fakes(OLD_APP);
    f.secureMap.set('access_token', 'newer');
    f.kvMap.set('firstlogin', 'completed-new');
    await migrateLegacyStorage(f.deps);
    expect(f.secureMap.get('access_token')).toBe('newer');
    expect(f.kvMap.get('firstlogin')).toBe('completed-new');
    expect(f.legacy.has('access_token')).toBe(false);
  });
});
