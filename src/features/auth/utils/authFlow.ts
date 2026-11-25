import type { StoreApi } from 'zustand';

import { fleetApi } from '@/features/fleet';

import { statusOf } from '@/core/api';
import { log } from '@/core/log';
import { sessionStore, type SessionMode, type SessionState } from '@/core/session';
import { hydrateStorage, KV_KEYS, kv, migrateLegacyStorage } from '@/core/storage';

import { authApi } from '../api/auth.api';
import { ONBOARDING_DONE_VALUE, SESSION_CHECK_TIMEOUT_MS } from '../constants/auth.constants';
import type { GuardDecision, RouteGroup, StartRoute, User } from '../types/auth.types';

// Routing rules plus the boot and logout steps. No React or UI, but it reads storage and calls
// the API, so tests mock @/core/storage or the api file as needed.

export function resolveStartRoute(input: {
  mode: SessionMode;
  user: Pick<User, 'isFirstLogin'> | null | undefined;
  onboardingDone: boolean;
  setupDone?: boolean;
}): StartRoute | null {
  if (input.mode === 'fleet') return 'fleet';
  if (input.mode === 'consumer') {
    if (!input.user) return null; // still loading
    return input.user.isFirstLogin && !input.setupDone ? 'setup' : 'home';
  }
  return input.onboardingDone ? 'login' : 'onboarding';
}

export function guardRoute(
  group: RouteGroup,
  input: { mode: SessionMode; fleetEnabled: boolean },
): GuardDecision {
  switch (group) {
    case 'auth':
      return input.mode === 'none' ? 'allow' : 'redirect';
    case 'setup':
    case 'app':
      return input.mode === 'consumer' ? 'allow' : 'redirect';
    case 'fleet':
      if (input.mode !== 'fleet') return 'redirect';
      return input.fleetEnabled ? 'allow' : 'end-session';
  }
}

export function isOnboardingDone(): boolean {
  return kv.getString(KV_KEYS.firstLogin) === ONBOARDING_DONE_VALUE;
}

export function markOnboardingDone(): void {
  kv.setString(KV_KEYS.firstLogin, ONBOARDING_DONE_VALUE);
}

// The server's isFirstLogin may stay true after setup (OPEN_QUESTIONS #14). This flag, keyed by
// user id, stops the app sending that user through setup again.
export function isSetupDone(userId: string): boolean {
  return kv.getString(KV_KEYS.setupDoneFor) === userId;
}

export function markSetupDone(userId: string): void {
  kv.setString(KV_KEYS.setupDoneFor, userId);
}

export async function restoreSession(): Promise<void> {
  await hydrateStorage();
  try {
    await migrateLegacyStorage();
  } catch (error) {
    log.warn('legacy migration threw', { error: String(error) });
  }
  await sessionStore.getState().hydrate();
}

export function classifySessionError(error: unknown): 'expired' | 'retryable' {
  const status = statusOf(error);
  if (status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return 'expired';
  }
  return 'retryable';
}

export const bootTimeoutError = (): Error =>
  Object.assign(new Error('Session check timed out'), { name: 'BootTimeoutError' });

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(bootTimeoutError()), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

type SessionLoaders = {
  loadUser: () => Promise<unknown>;
  loadDriver: () => Promise<unknown>;
};

// A rejected stored session (4xx) signs out and continues; network/5xx/timeout keeps the
// tokens and shows the retry screen.
export async function checkSession(
  loaders: SessionLoaders,
  timeoutMs = SESSION_CHECK_TIMEOUT_MS,
  store: StoreApi<SessionState> = sessionStore,
): Promise<'ready' | 'error'> {
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

export async function serverLogout(mode: SessionMode, accessToken: string | null): Promise<void> {
  if (mode === 'fleet') await fleetApi.logout(accessToken);
  else if (mode === 'consumer') await authApi.logout(accessToken);
}
