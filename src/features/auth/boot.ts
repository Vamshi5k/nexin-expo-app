import type { QueryClient } from '@tanstack/react-query';
import type { StoreApi } from 'zustand';

import { statusOf } from '@/core/api';
import { bootstrap } from '@/core/bootstrap';
import { log } from '@/core/log';
import { queryKeys } from '@/core/query';
import { sessionStore, type SessionState } from '@/core/session';
import { primeClientConfig } from '@/features/client-config';
import { fleetMeQuery } from '@/features/fleet';

import { meQuery } from './queries';

/** BLUEPRINT A1: give up on the session check after this and show the boot error screen. */
export const SESSION_CHECK_TIMEOUT_MS = 25_000;

export type SessionErrorKind = 'expired' | 'retryable';

/** 4xx (except 408 Request Timeout and 429 Too Many Requests) means the session is gone. */
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

/** Drops server data that belongs to a user; keeps the client config. */
export function clearUserData(queryClient: QueryClient): void {
  const keep = queryKeys.clientConfig()[0];
  queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== keep });
}

/**
 * Drops user data whenever the session mode changes (sign in, sign out, refresh 4xx,
 * expired at start). Without this, a new login could briefly see (and route on) the previous
 * user's cached data. Returns the unsubscribe function.
 */
export function clearUserDataOnSessionChange(
  queryClient: QueryClient,
  store: StoreApi<SessionState> = sessionStore,
): () => void {
  return store.subscribe((state, prev) => {
    if (state.mode !== prev.mode) clearUserData(queryClient);
  });
}

export type BootOutcome = 'ready' | 'error';

/**
 * Verifies the stored session. Expired -> tokens cleared (the user lands on login).
 * Anything else (network, 5xx, 408/429, timeout) -> 'error', tokens kept.
 */
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

/**
 * Everything done while the native splash is held: legacy migration + session hydrate,
 * client config (cache or brand fallback; never blocks), then the session check.
 */
export async function runBoot(queryClient: QueryClient): Promise<BootOutcome> {
  await bootstrap();
  await primeClientConfig(queryClient);
  return checkSession(queryClient);
}
