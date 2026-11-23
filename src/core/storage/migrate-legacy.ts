import AsyncStorage from '@react-native-async-storage/async-storage';

import { log } from '@/core/log';

import { KV_KEYS, SECURE_KEYS, type KvKey, type SecureKey } from './keys';
import { kv, type KvStorage } from './kv';
import { secure, type SecureStorage } from './secure';

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

/**
 * One-time move of the old app's AsyncStorage values: tokens -> SecureStore, the rest -> MMKV,
 * then delete them from AsyncStorage. Idempotent via an MMKV flag. If anything fails, nothing is
 * deleted and the flag is not set, so the next launch retries. Never overwrites newer values.
 */
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
