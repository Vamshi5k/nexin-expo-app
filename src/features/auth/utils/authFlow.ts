import { z } from 'zod';
import type { StoreApi } from 'zustand';

import { fleetApi } from '@/features/fleet';

import { statusOf } from '@/core/api';
import { log } from '@/core/log';
import { checkPermission } from '@/core/permissions';
import { sessionStore, type SessionMode, type SessionState } from '@/core/session';
import { hydrateStorage, KV_KEYS, kv, migrateLegacyStorage } from '@/core/storage';

import { authApi } from '../api/auth.api';
import {
  ONBOARDING_DONE_VALUE,
  SESSION_CHECK_TIMEOUT_MS,
  SETUP_STEPS,
} from '../constants/auth.constants';
import type { GuardDecision, RouteGroup, SetupStep, StartRoute, User } from '../types/auth.types';

// Routing rules plus the boot, setup-progress and logout steps. No React or UI, but it reads
// storage, permissions and calls the API, so tests mock those or the api file as needed.

// `setupStep` is null while it isn't known yet; `permissionsGranted` is null while the check
// that resumes a Permissions step is still running.
export function resolveStartRoute(input: {
  mode: SessionMode;
  user: Pick<User, 'isFirstLogin'> | null | undefined;
  onboardingDone: boolean;
  setupStep?: SetupStep | null;
  permissionsGranted?: boolean | null;
}): StartRoute | null {
  if (input.mode === 'fleet') return 'fleet';
  if (input.mode === 'consumer') {
    if (!input.user) return null; // still loading
    const step = input.setupStep ?? (input.user.isFirstLogin ? 'profile' : 'done');
    if (step === 'done') return 'home';
    if (step !== 'permissions') return step;
    // Reopened on Permissions: both already on -> setup is done; any off -> ask again.
    if (input.permissionsGranted == null) return null;
    return input.permissionsGranted ? 'home' : 'permissions';
  }
  return input.onboardingDone ? 'login' : 'onboarding';
}

export function guardRoute(
  group: RouteGroup,
  input: {
    mode: SessionMode;
    fleetEnabled: boolean;
    // Consumer only: null while the user is loading ("/" waits for it).
    setupStep?: SetupStep | null;
    // The setup screen being opened (last route segment).
    screen?: string;
  },
): GuardDecision {
  switch (group) {
    case 'auth':
      return input.mode === 'none' ? 'allow' : 'redirect';
    case 'fleet-auth':
      return input.mode === 'none' && input.fleetEnabled ? 'allow' : 'redirect';
    case 'setup':
      // Only the current step opens, so a finished step (e.g. Vehicle) never shows again.
      if (input.mode !== 'consumer' || !input.setupStep || input.setupStep === 'done') {
        return 'redirect';
      }
      return !input.screen || input.screen === input.setupStep ? 'allow' : 'redirect';
    case 'app':
      return input.mode === 'consumer' && input.setupStep === 'done' ? 'allow' : 'redirect';
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

const SetupProgressSchema = z.record(z.string(), z.enum(SETUP_STEPS));
type SetupProgress = z.infer<typeof SetupProgressSchema>;

function readSetupProgress(): SetupProgress {
  const parsed = SetupProgressSchema.safeParse(kv.getJSON<unknown>(KV_KEYS.setupProgress));
  return parsed.success ? parsed.data : {};
}

// Where this user's setup stands on this device. A saved step wins over the server's
// isFirstLogin, which may stay true after setup (OPEN_QUESTIONS #14) or clear mid-setup.
export function setupStepFor(user: Pick<User, 'id' | 'isFirstLogin'>): SetupStep {
  const saved = readSetupProgress()[user.id];
  if (saved) return saved;
  // Earlier builds kept one finished user id under setup_done_for.
  if (kv.getString(KV_KEYS.setupDoneFor) === user.id) return 'done';
  return user.isFirstLogin ? 'profile' : 'done';
}

// Keyed by user id, so two accounts on one phone keep their own progress.
export function saveSetupStep(userId: string, step: SetupStep): void {
  kv.setJSON(KV_KEYS.setupProgress, { ...readSetupProgress(), [userId]: step });
}

export async function setupPermissionsGranted(): Promise<boolean> {
  try {
    const [location, notifications] = await Promise.all([
      checkPermission('location'),
      checkPermission('notifications'),
    ]);
    return location === 'granted' && notifications === 'granted';
  } catch (error) {
    log.warn('permission check failed; showing the Permissions step', { error: String(error) });
    return false;
  }
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
