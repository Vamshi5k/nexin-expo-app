import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { log } from '@/core/log';

export const SECURE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  fleetToken: 'fleetToken',
  fleetRefreshToken: 'fleetRefreshToken',
} as const;
export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];

export const KV_KEYS = {
  appearance: 'appearance',
  clientConfig: 'CLIENT_CONFIG',
  firstLogin: 'firstlogin',
  fcmToken: 'FCM_TOKEN',
  legacyMigrated: 'legacy_migrated_v1',
  setupDoneFor: 'setup_done_for',
  setupProgress: 'setup_progress',
} as const;
export type KvKey = (typeof KV_KEYS)[keyof typeof KV_KEYS];

export const secure = {
  get: (key: SecureKey): Promise<string | null> => SecureStore.getItemAsync(key),
  set: (key: SecureKey, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  remove: (key: SecureKey): Promise<void> => SecureStore.deleteItemAsync(key),
};

export type SecureStorage = typeof secure;

type SyncStore = {
  getString: (key: string) => string | undefined;
  getBoolean: (key: string) => boolean | undefined;
  set: (key: string, value: string | boolean) => void;
  remove: (key: string) => boolean;
  contains: (key: string) => boolean;
  hydrate: () => Promise<void>;
};

// Android Expo Go 58.0.5 reports executionEnvironment "bare", so also ask expo directly.
export const isExpoGo =
  (Constants?.executionEnvironment as string | undefined) === 'storeClient' || isRunningInExpoGo();

function mmkvStore(): SyncStore {
  // Required lazily so Expo Go never loads the Nitro native module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const mmkv = createMMKV({ id: 'app' });
  return {
    getString: key => mmkv.getString(key),
    getBoolean: key => mmkv.getBoolean(key),
    set: (key, value) => mmkv.set(key, value),
    remove: key => mmkv.remove(key),
    contains: key => mmkv.contains(key),
    hydrate: async () => {},
  };
}

// Expo Go only: sync reads from memory, writes persisted to AsyncStorage in the background.
// Keys are prefixed so they never collide with the legacy keys migrateLegacyStorage removes.
const FALLBACK_PREFIX = 'app.kv.';

function memoryStore(): SyncStore {
  const cache = new Map<string, string>();
  let hydrating: Promise<void> | null = null;
  const persist = (run: Promise<void>) =>
    run.catch((error: unknown) => log.warn('kv fallback write failed', { error: String(error) }));

  return {
    getString: key => cache.get(key),
    getBoolean: key => {
      const raw = cache.get(key);
      return raw === 'true' ? true : raw === 'false' ? false : undefined;
    },
    set: (key, value) => {
      const raw = String(value);
      cache.set(key, raw);
      void persist(AsyncStorage.setItem(FALLBACK_PREFIX + key, raw));
    },
    remove: key => {
      const had = cache.delete(key);
      void persist(AsyncStorage.removeItem(FALLBACK_PREFIX + key));
      return had;
    },
    contains: key => cache.has(key),
    hydrate: () => {
      hydrating ??= (async () => {
        const keys = (await AsyncStorage.getAllKeys()).filter(k => k.startsWith(FALLBACK_PREFIX));
        for (const [k, v] of await AsyncStorage.multiGet(keys)) {
          if (v !== null) cache.set(k.slice(FALLBACK_PREFIX.length), v);
        }
      })().catch((error: unknown) => {
        hydrating = null;
        log.warn('kv fallback hydrate failed', { error: String(error) });
      });
      return hydrating;
    },
  };
}

const store: SyncStore = isExpoGo ? memoryStore() : mmkvStore();

// Must run before the first kv read. A no-op with MMKV.
export const hydrateStorage = (): Promise<void> => store.hydrate();

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
