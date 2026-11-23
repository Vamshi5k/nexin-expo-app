import { createMMKV } from 'react-native-mmkv';

import type { KvKey } from './keys';

const store = createMMKV({ id: 'app' });

/** Fast synchronous non-secret storage (cached config, flags). */
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
