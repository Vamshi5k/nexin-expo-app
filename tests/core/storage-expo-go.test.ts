import type AsyncStorageType from '@react-native-async-storage/async-storage';

jest.mock('@/core/log');
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'storeClient' },
}));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-mmkv', () => {
  throw new Error('MMKV must not load in Expo Go');
});

const flush = () => new Promise(r => setImmediate(r));

describe('kv in Expo Go', () => {
  let AsyncStorage: typeof AsyncStorageType;

  beforeEach(async () => {
    jest.resetModules();
    AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.clear();
  });

  it('never loads MMKV and reports Expo Go', () => {
    const storage = require('@/core/storage');
    expect(storage.isExpoGo).toBe(true);
  });

  it('hydrates only its own prefixed keys, leaving legacy keys alone', async () => {
    await AsyncStorage.multiSet([
      ['app.kv.firstlogin', 'false'],
      ['firstlogin', 'legacy'],
    ]);
    const { kv, hydrateStorage, KV_KEYS } = require('@/core/storage');
    await hydrateStorage();
    expect(kv.getString(KV_KEYS.firstLogin)).toBe('false');
    expect(kv.getBoolean(KV_KEYS.firstLogin)).toBe(false);
  });

  it('reads writes back synchronously and persists them with the prefix', async () => {
    const { kv, hydrateStorage, KV_KEYS } = require('@/core/storage');
    await hydrateStorage();
    kv.setJSON(KV_KEYS.clientConfig, { a: 1 });
    kv.setBoolean(KV_KEYS.legacyMigrated, true);
    expect(kv.getJSON(KV_KEYS.clientConfig)).toEqual({ a: 1 });
    expect(kv.getBoolean(KV_KEYS.legacyMigrated)).toBe(true);
    await flush();
    expect(await AsyncStorage.getItem('app.kv.CLIENT_CONFIG')).toBe('{"a":1}');
    expect(await AsyncStorage.getItem('CLIENT_CONFIG')).toBeNull();

    expect(kv.remove(KV_KEYS.clientConfig)).toBe(true);
    await flush();
    expect(kv.contains(KV_KEYS.clientConfig)).toBe(false);
    expect(await AsyncStorage.getItem('app.kv.CLIENT_CONFIG')).toBeNull();
  });
});
