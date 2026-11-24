import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { brand } from '@/core/config';
import { log } from '@/core/log';
import { KV_KEYS, kv } from '@/core/storage';

import { fallbackClientConfig, fromCache, getClientInfo, toCache, toClientConfig } from './api';
import type { ClientConfig } from './types';

export const CLIENT_CONFIG_BOOT_TIMEOUT_MS = 8_000;

export function readCachedClientConfig(): ClientConfig | undefined {
  return fromCache(kv.getJSON<unknown>(KV_KEYS.clientConfig));
}

async function fetchClientConfig(): Promise<ClientConfig> {
  const config = toClientConfig(await getClientInfo(), brand);
  kv.setJSON(KV_KEYS.clientConfig, toCache(config));
  return config;
}

type ClientConfigValue = { config: ClientConfig; prime: () => Promise<void> };

const ClientConfigContext = createContext<ClientConfigValue | null>(null);

export function ClientConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ClientConfig | null>(null);

  const refresh = useCallback(async () => {
    try {
      setConfig(await fetchClientConfig());
    } catch (error) {
      log.warn('client config fetch failed; keeping cached or brand values', {
        error: String(error),
      });
    }
  }, []);

  // Called at boot once storage is ready. Cached config shows instantly and refreshes in the
  // background; with no cache, wait up to 8 s for the server, then fall back to brand values.
  const prime = useCallback(async () => {
    const cached = readCachedClientConfig();
    if (cached) {
      setConfig(cached);
      void refresh();
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([
      refresh(),
      new Promise((resolve) => {
        timer = setTimeout(resolve, CLIENT_CONFIG_BOOT_TIMEOUT_MS);
      }),
    ]);
    clearTimeout(timer);
  }, [refresh]);

  const value = useMemo(
    () => ({ config: config ?? fallbackClientConfig(brand), prime }),
    [config, prime],
  );
  return <ClientConfigContext.Provider value={value}>{children}</ClientConfigContext.Provider>;
}

function useClientConfigContext(): ClientConfigValue {
  const ctx = useContext(ClientConfigContext);
  if (!ctx) throw new Error('useClientConfig must be used inside ClientConfigProvider');
  return ctx;
}

export function useClientConfig(): ClientConfig {
  return useClientConfigContext().config;
}

export function usePrimeClientConfig(): () => Promise<void> {
  return useClientConfigContext().prime;
}
