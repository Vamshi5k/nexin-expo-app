import { useCallback, useEffect, useState } from 'react';

import { type Href } from 'expo-router';

import { useClientConfig, usePrimeClientConfig } from '@/features/client-config';
import { useFleet } from '@/features/fleet';

import { log } from '@/core/log';
import { sessionStore, useSession } from '@/core/session';

import { START_HREF } from './constants';
import { useAuth } from './hooks';
import {
  checkSession,
  classifySessionError,
  guardRoute,
  isOnboardingDone,
  isSetupDone,
  resolveStartRoute,
  restoreSession,
} from './session';
import type { BootStatus, GuardDecision, RouteGroup } from './types';

type Boot = { status: BootStatus; retrying: boolean; retry: () => void };

// The root layout shows the retry screen for both a failed startup check and a first user load that failed.
export function useBoot(): Boot {
  const primeConfig = usePrimeClientConfig();
  const { mode, user, userStatus, userError, loadUser } = useAuth();
  const { loadDriver } = useFleet();
  const [status, setStatus] = useState<BootStatus>('loading');
  const [retrying, setRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    void (async () => {
      await restoreSession();
      await primeConfig();
      const outcome = await checkSession({ loadUser, loadDriver });
      if (!alive) return;
      setStatus(outcome);
      setRetrying(false);
    })();
    return () => {
      alive = false;
    };
  }, [primeConfig, loadUser, loadDriver, attempt]);

  const retry = useCallback(() => {
    setRetrying(true);
    setAttempt(n => n + 1);
  }, []);

  const userLoadFailed =
    status === 'ready' &&
    mode === 'consumer' &&
    !user &&
    userStatus === 'error' &&
    classifySessionError(userError) !== 'expired';

  if (userLoadFailed) {
    return {
      status: 'error',
      retrying: false,
      retry: () => void loadUser().catch(() => undefined),
    };
  }
  return { status, retrying, retry };
}

// Where "/" sends the user, or null while the user is still loading.
export function useStartRoute(): Href | null {
  const { mode, user, userStatus, userError, loadUser } = useAuth();
  const expired = userStatus === 'error' && classifySessionError(userError) === 'expired';

  // After OTP sign-in the user isn't loaded yet; boot already loaded it for a restored session.
  useEffect(() => {
    if (mode === 'consumer' && userStatus === 'idle') void loadUser().catch(() => undefined);
  }, [mode, userStatus, loadUser]);

  useEffect(() => {
    if (expired) void sessionStore.getState().signOut();
  }, [expired]);

  const route = resolveStartRoute({
    mode,
    user,
    onboardingDone: isOnboardingDone(),
    setupDone: user ? isSetupDone(user.id) : false,
  });

  return route ? START_HREF[route] : null;
}

export function useRouteGuard(group: RouteGroup): GuardDecision {
  const mode = useSession(s => s.mode);
  const fleetEnabled = useClientConfig().features.fleet;
  const decision = guardRoute(group, { mode, fleetEnabled });

  useEffect(() => {
    if (decision !== 'end-session') return;
    log.info('fleet feature is off; ending the fleet session');
    void sessionStore.getState().signOut();
  }, [decision]);

  return decision;
}
