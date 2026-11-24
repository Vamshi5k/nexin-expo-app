import { useCallback, useEffect, useState } from 'react';
import type { StoreApi } from 'zustand';

import { statusOf } from '@/core/api';
import { log } from '@/core/log';
import { sessionStore, type SessionState } from '@/core/session';
import { hydrateStorage, migrateLegacyStorage } from '@/core/storage';
import { usePrimeClientConfig } from '@/features/client-config';
import { useFleet } from '@/features/fleet';

import { useAuth } from './AuthContext';

export async function restoreSession(): Promise<void> {
  await hydrateStorage();
  try {
    await migrateLegacyStorage();
  } catch (error) {
    log.warn('legacy migration threw', { error: String(error) });
  }
  await sessionStore.getState().hydrate();
}

export const SESSION_CHECK_TIMEOUT_MS = 25_000;

export type SessionErrorKind = 'expired' | 'retryable';

export function classifySessionError(error: unknown): SessionErrorKind {
  const status = statusOf(error);
  if (status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return 'expired';
  }
  return 'retryable';
}

export class BootTimeoutError extends Error {
  constructor() {
    super('Session check timed out');
    this.name = 'BootTimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new BootTimeoutError()), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

export type BootOutcome = 'ready' | 'error';

export type SessionLoaders = {
  loadUser: () => Promise<unknown>;
  loadDriver: () => Promise<unknown>;
};

export async function checkSession(
  loaders: SessionLoaders,
  timeoutMs = SESSION_CHECK_TIMEOUT_MS,
  store: StoreApi<SessionState> = sessionStore,
): Promise<BootOutcome> {
  const { mode } = store.getState();
  if (mode === 'none') return 'ready';
  try {
    await withTimeout(mode === 'consumer' ? loaders.loadUser() : loaders.loadDriver(), timeoutMs);
    return 'ready';
  } catch (error) {
    if (classifySessionError(error) === 'expired') {
      log.info('stored session rejected; signing out', { status: statusOf(error) });
      await store.getState().signOut();
      return 'ready';
    }
    log.warn('session check failed; showing retry', { error: String(error) });
    return 'error';
  }
}

export type BootLoaders = SessionLoaders & { primeConfig: () => Promise<void> };

export async function runBoot(loaders: BootLoaders): Promise<BootOutcome> {
  await restoreSession();
  await loaders.primeConfig();
  return checkSession(loaders);
}

export type BootState = {
  status: 'loading' | BootOutcome;
  retrying: boolean;
  retry: () => void;
};

export function useBoot(): BootState {
  const primeConfig = usePrimeClientConfig();
  const { loadUser } = useAuth();
  const { loadDriver } = useFleet();
  const [status, setStatus] = useState<BootState['status']>('loading');
  const [retrying, setRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    void runBoot({ primeConfig, loadUser, loadDriver }).then((outcome) => {
      if (!alive) return;
      setStatus(outcome);
      setRetrying(false);
    });
    return () => {
      alive = false;
    };
  }, [primeConfig, loadUser, loadDriver, attempt]);

  const retry = useCallback(() => {
    setRetrying(true);
    setAttempt((n) => n + 1);
  }, []);

  return { status, retrying, retry };
}
