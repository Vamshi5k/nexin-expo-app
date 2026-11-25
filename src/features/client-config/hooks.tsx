import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { z } from 'zod';

import { brand } from '@/core/config';
import { log } from '@/core/log';
import { KV_KEYS, kv } from '@/core/storage';

import { fallbackClientConfig, getClientConfig } from './api';
import { CLIENT_CONFIG_BOOT_TIMEOUT_MS, CLIENT_CONFIG_CACHE_VERSION } from './constants';
import type { ClientConfig } from './types';

const CachedSchema = z.object({
  v: z.literal(CLIENT_CONFIG_CACHE_VERSION),
  config: z.object({
    brandName: z.string().min(1),
    logoUri: z.string().nullable(),
    termsUrl: z.string().nullable(),
    privacyUrl: z.string().nullable(),
    supportUrl: z.string().nullable(),
    loginType: z.enum(['phone', 'email']),
    features: z.object({ fleet: z.boolean(), coupons: z.boolean() }),
    minAppVersion: z.string().nullable(),
  }) satisfies z.ZodType<ClientConfig>,
});

export function toCache(config: ClientConfig): unknown {
  return { v: CLIENT_CONFIG_CACHE_VERSION, config };
}

export function fromCache(value: unknown): ClientConfig | undefined {
  const parsed = CachedSchema.safeParse(value);
  return parsed.success ? parsed.data.config : undefined;
}

type ClientConfigValue = { config: ClientConfig; prime: () => Promise<void> };

const ClientConfigContext = createContext<ClientConfigValue | null>(null);

export function ClientConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ClientConfig | null>(null);

  const refresh = useCallback(async () => {
    try {
      const fresh = await getClientConfig();
      kv.setJSON(KV_KEYS.clientConfig, toCache(fresh));
      setConfig(fresh);
    } catch (error) {
      log.warn('client config fetch failed; keeping cached or brand values', {
        error: String(error),
      });
    }
  }, []);

  // Called at boot once storage is ready. Cached config shows instantly and refreshes in the
  // background; with no cache, wait for the server up to the boot timeout, then use brand values.
  const prime = useCallback(async () => {
    const cached = fromCache(kv.getJSON<unknown>(KV_KEYS.clientConfig));
    if (cached) {
      setConfig(cached);
      void refresh();
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([
      refresh(),
      new Promise(resolve => {
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
