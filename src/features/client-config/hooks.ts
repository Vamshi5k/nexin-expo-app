import { onlineManager, useQuery, type QueryClient } from '@tanstack/react-query';

import { brand } from '@/core/config';
import { log } from '@/core/log';
import { queryKeys } from '@/core/query';
import { KV_KEYS, kv } from '@/core/storage';

import { fallbackClientConfig, fromCache, getClientInfo, toCache, toClientConfig } from './api';
import type { ClientConfig } from './types';

export function readCachedClientConfig(): ClientConfig | undefined {
  return fromCache(kv.getJSON<unknown>(KV_KEYS.clientConfig));
}

export function writeCachedClientConfig(config: ClientConfig): void {
  kv.setJSON(KV_KEYS.clientConfig, toCache(config));
}

export const CLIENT_CONFIG_STALE_MS = 5 * 60_000;
export const CLIENT_CONFIG_BOOT_TIMEOUT_MS = 8_000;

async function fetchClientConfig(): Promise<ClientConfig> {
  const config = toClientConfig(await getClientInfo(), brand);
  writeCachedClientConfig(config);
  return config;
}

const options = {
  queryKey: queryKeys.clientConfig(),
  queryFn: fetchClientConfig,
  staleTime: CLIENT_CONFIG_STALE_MS,
  // Cached config renders instantly; updatedAt 0 marks it stale so a background refresh runs.
  initialData: readCachedClientConfig,
  initialDataUpdatedAt: 0,
} as const;

export function useClientConfig(): ClientConfig {
  const { data } = useQuery(options);
  return data ?? fallbackClientConfig(brand);
}

export async function primeClientConfig(queryClient: QueryClient): Promise<void> {
  if (readCachedClientConfig()) return;
  if (!onlineManager.isOnline()) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      queryClient.fetchQuery({ ...options, initialData: undefined }),
      new Promise((resolve) => {
        timer = setTimeout(resolve, CLIENT_CONFIG_BOOT_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    log.warn('client config fetch failed at boot; using brand fallbacks', {
      error: String(error),
    });
  } finally {
    clearTimeout(timer);
  }
}
