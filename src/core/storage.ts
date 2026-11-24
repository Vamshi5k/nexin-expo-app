import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createMMKV } from 'react-native-mmkv';

import { log } from '@/core/log';

export const SECURE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  fleetToken: 'fleetToken',
  fleetRefreshToken: 'fleetRefreshToken',
} as const;
export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];

export const KV_KEYS = {
  clientConfig: 'CLIENT_CONFIG',
  firstLogin: 'firstlogin',
  fcmToken: 'FCM_TOKEN',
  legacyMigrated: 'legacy_migrated_v1',
} as const;
export type KvKey = (typeof KV_KEYS)[keyof typeof KV_KEYS];

export const secure = {
  get: (key: SecureKey): Promise<string | null> => SecureStore.getItemAsync(key),
  set: (key: SecureKey, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  remove: (key: SecureKey): Promise<void> => SecureStore.deleteItemAsync(key),
};

export type SecureStorage = typeof secure;

const store = createMMKV({ id: 'app' });

export const kv = {
  getString: (key: KvKey): string | undefined => store.getString(key),
  setString: (key: KvKey, value: string): void => store.set(key, value),
  getBoolean: (key: KvKey): boolean | undefined => store.getBoolean(key),
  setBoolean: (key: KvKey, value: boolean): void => store.set(key, value),
  getJSON<T>(key: KvKey): T | undefined {
    const raw = store.getString(key);
    if (raw === undefined) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },
  setJSON: (key: KvKey, value: unknown): void => store.set(key, JSON.stringify(value)),
  remove: (key: KvKey): boolean => store.remove(key),
  contains: (key: KvKey): boolean => store.contains(key),
};

export type KvStorage = typeof kv;

type LegacyStore = {
  multiGet: (keys: readonly string[]) => Promise<readonly (readonly [string, string | null])[]>;
  multiRemove: (keys: readonly string[]) => Promise<void>;
};

export type MigrationDeps = {
  legacy: LegacyStore;
  secure: SecureStorage;
  kv: KvStorage;
};

export type MigrationResult =
  | { status: 'already-done' }
  | { status: 'migrated'; moved: string[] }
  | { status: 'failed'; error: string };

const TOKEN_KEYS = Object.values(SECURE_KEYS) as SecureKey[];
const KV_LEGACY_KEYS: KvKey[] = [KV_KEYS.clientConfig, KV_KEYS.firstLogin, KV_KEYS.fcmToken];

export async function migrateLegacyStorage(
  deps: MigrationDeps = { legacy: AsyncStorage, secure, kv },
): Promise<MigrationResult> {
  if (deps.kv.getBoolean(KV_KEYS.legacyMigrated)) return { status: 'already-done' };

  try {
    const entries = await deps.legacy.multiGet([...TOKEN_KEYS, ...KV_LEGACY_KEYS]);
    const found = entries.filter((e): e is readonly [string, string] => e[1] !== null);
    const moved: string[] = [];

    for (const [key, value] of found) {
      if ((TOKEN_KEYS as string[]).includes(key)) {
        const k = key as SecureKey;
        if ((await deps.secure.get(k)) === null) await deps.secure.set(k, value);
      } else {
        const k = key as KvKey;
        if (!deps.kv.contains(k)) deps.kv.setString(k, value);
      }
      moved.push(key);
    }

    if (moved.length) await deps.legacy.multiRemove(moved);
    deps.kv.setBoolean(KV_KEYS.legacyMigrated, true);
    if (moved.length) log.info('legacy storage migrated', { keys: moved.length });
    return { status: 'migrated', moved };
  } catch (error) {
    log.warn('legacy storage migration failed; will retry next launch', { error: String(error) });
    return { status: 'failed', error: String(error) };
  }
}
