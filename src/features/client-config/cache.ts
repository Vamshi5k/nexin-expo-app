import { KV_KEYS, kv } from '@/core/storage';

import { fromCache, toCache } from './mappers';
import type { ClientConfig } from './types';

/** Last good /client/info, from MMKV (synchronous, so the first frame can use it). */
export function readCachedClientConfig(): ClientConfig | undefined {
  return fromCache(kv.getJSON<unknown>(KV_KEYS.clientConfig));
}

export function writeCachedClientConfig(config: ClientConfig): void {
  kv.setJSON(KV_KEYS.clientConfig, toCache(config));
}
