import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { brand } from '@/core/config';
import { log } from '@/core/log';
import { KV_KEYS, kv } from '@/core/storage';

import { clientConfigApi, fallbackClientConfig } from '../api/clientConfig.api';
import { CLIENT_CONFIG_BOOT_TIMEOUT_MS } from '../constants/clientConfig.constants';
import type { ClientConfig } from '../types/clientConfig.types';
import { fromCache, toCache } from '../utils/cache';

type ClientConfigContextType = {
  config: ClientConfig;
  prime: () => Promise<void>;
};

const ClientConfigContext = createContext<ClientConfigContextType | undefined>(undefined);

type ClientConfigProviderProps = {
  children: ReactNode;
};

export const ClientConfigProvider = ({ children }: ClientConfigProviderProps) => {
  const [config, setConfig] = useState<ClientConfig | null>(null);

  const refresh = useCallback(async () => {
    try {
      const fresh = await clientConfigApi.getConfig();
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

  const value = useMemo<ClientConfigContextType>(
    () => ({ config: config ?? fallbackClientConfig(brand), prime }),
    [config, prime],
  );

  return <ClientConfigContext.Provider value={value}>{children}</ClientConfigContext.Provider>;
};

const useClientConfigContext = (): ClientConfigContextType => {
  const context = useContext(ClientConfigContext);
  if (!context) {
    throw new Error('useClientConfig must be used inside ClientConfigProvider');
  }
  return context;
};

export const useClientConfig = (): ClientConfig => useClientConfigContext().config;

export const usePrimeClientConfig = (): (() => Promise<void>) => useClientConfigContext().prime;
