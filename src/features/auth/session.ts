import { z } from 'zod';
import type { StoreApi } from 'zustand';

import { fleetApi } from '@/features/fleet';

import { statusOf } from '@/core/api';
import { brand, phonePattern } from '@/core/config';
import { log } from '@/core/log';
import { sessionStore, type SessionMode, type SessionState } from '@/core/session';
import { hydrateStorage, KV_KEYS, kv, migrateLegacyStorage } from '@/core/storage';

import { logout } from './api';
import { ONBOARDING_DONE_VALUE, SESSION_CHECK_TIMEOUT_MS } from './constants';
import type { ContactType, GuardDecision, RouteGroup, StartRoute, User } from './types';

// Pure auth rules and the boot/session steps. No React or UI imports, so tests load it directly.

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .regex(/^\d+$/, 'Enter a valid mobile number')
  .length(brand.phoneLength, `Enter a ${brand.phoneLength}-digit mobile number`)
  .regex(phonePattern, 'Enter a valid mobile number');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'));

export const contactFormSchema = {
  phone: z.object({ contact: phoneSchema }),
  email: z.object({ contact: emailSchema }),
};

export function sanitizeOtp(input: string, length: number): string {
  return input.replace(/\D/g, '').slice(0, length);
}

export function otpCells(
  value: string,
  length: number,
): { digit: string; state: 'filled' | 'active' | 'empty' }[] {
  return Array.from({ length }, (_, i) => ({
    digit: value[i] ?? '',
    state: i < value.length ? 'filled' : i === value.length ? 'active' : 'empty',
  }));
}

export function formatContact(type: ContactType, value: string, countryCode: string): string {
  if (type === 'email') return value;
  const half = Math.ceil(value.length / 2);
  return `${countryCode} ${value.slice(0, half)} ${value.slice(half)}`.trim();
}

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
  else if (mode === 'consumer') await logout(accessToken);
}
