import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import type { StoreApi } from 'zustand';

import { statusOf } from '@/core/api';
import { log } from '@/core/log';
import { queryKeys } from '@/core/query';
import { sessionStore, useSession, type SessionMode, type SessionState } from '@/core/session';
import { hydrateStorage, migrateLegacyStorage } from '@/core/storage';
import { primeClientConfig } from '@/features/client-config';
import { fleetLogout, fleetMeQuery } from '@/features/fleet';

import { login, logout, toTokens, toUser, userByToken, verify } from './api';

export const meQuery = () =>
  queryOptions({
    queryKey: queryKeys.me(),
    queryFn: async () => toUser(await userByToken()),
  });

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

export function clearUserData(queryClient: QueryClient): void {
  const keep = queryKeys.clientConfig()[0];
  queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== keep });
}

export function clearUserDataOnSessionChange(
  queryClient: QueryClient,
  store: StoreApi<SessionState> = sessionStore,
): () => void {
  return store.subscribe((state, prev) => {
    if (state.mode !== prev.mode) clearUserData(queryClient);
  });
}

export type BootOutcome = 'ready' | 'error';

export async function checkSession(
  queryClient: QueryClient,
  timeoutMs = SESSION_CHECK_TIMEOUT_MS,
): Promise<BootOutcome> {
  const { mode } = sessionStore.getState();
  if (mode === 'none') return 'ready';
  try {
    const check: Promise<unknown> =
      mode === 'consumer'
        ? queryClient.fetchQuery({ ...meQuery(), retry: false })
        : queryClient.fetchQuery({ ...fleetMeQuery(), retry: false });
    await withTimeout(check, timeoutMs);
    return 'ready';
  } catch (error) {
    if (classifySessionError(error) === 'expired') {
      log.info('stored session rejected; signing out', { status: statusOf(error) });
      await sessionStore.getState().signOut();
      clearUserData(queryClient);
      return 'ready';
    }
    log.warn('session check failed; showing retry', { error: String(error) });
    return 'error';
  }
}

export async function runBoot(queryClient: QueryClient): Promise<BootOutcome> {
  await restoreSession();
  await primeClientConfig(queryClient);
  return checkSession(queryClient);
}

export function useMe() {
  const mode = useSession((s) => s.mode);
  return useQuery({ ...meQuery(), enabled: mode === 'consumer' });
}

export function useRequestOtp() {
  return useMutation({ mutationFn: (contact: string) => login(contact) });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (otp: string) => {
      const tokens = toTokens(await verify(otp));
      await sessionStore.getState().signIn('consumer', tokens);
    },
  });
}

export async function serverLogout(mode: SessionMode): Promise<void> {
  if (mode === 'fleet') await fleetLogout();
  else if (mode === 'consumer') await logout();
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await serverLogout(sessionStore.getState().mode);
      } catch (error) {
        log.warn('logout request failed; clearing locally anyway', { error: String(error) });
      } finally {
        await sessionStore.getState().signOut();
      }
    },
  });
}

export type BootState = {
  status: 'loading' | BootOutcome;
  retrying: boolean;
  retry: () => void;
};

export function useBoot(): BootState {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BootState['status']>('loading');
  const [retrying, setRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    void runBoot(queryClient).then((outcome) => {
      if (!alive) return;
      setStatus(outcome);
      setRetrying(false);
    });
    return () => {
      alive = false;
    };
  }, [queryClient, attempt]);

  const retry = useCallback(() => {
    setRetrying(true);
    setAttempt((n) => n + 1);
  }, []);

  return { status, retrying, retry };
}
