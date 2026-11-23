import { onlineManager, useQuery, type QueryClient } from '@tanstack/react-query';

import { brand } from '@/core/config';
import { log } from '@/core/log';
import { queryKeys } from '@/core/query';

import { getClientInfo } from './api';
import { readCachedClientConfig, writeCachedClientConfig } from './cache';
import { fallbackClientConfig, toClientConfig } from './mappers';
import type { ClientConfig } from './types';

/** Re-fetch at most this often while the app is open. */
export const CLIENT_CONFIG_STALE_MS = 5 * 60_000;
/** How long boot waits for a first fetch when there is no cache (then uses brand fallbacks). */
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

/**
 * Runtime client config: cached value (or brand fallbacks) immediately, refreshed in the
 * background. TanStack re-fetches on reconnect (onlineManager), so a fresh install that
 * booted offline picks up the real config once it is back online.
 */
export function useClientConfig(): ClientConfig {
  const { data } = useQuery(options);
  return data ?? fallbackClientConfig(brand);
}

/**
 * Boot step. With a cache: returns at once (the hook refreshes it). Without one and online:
 * waits up to CLIENT_CONFIG_BOOT_TIMEOUT_MS for a first fetch. Never throws and never blocks
 * on failure: brand fallbacks are used instead (Phase 2 decision).
 */
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
