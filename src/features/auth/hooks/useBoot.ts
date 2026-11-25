import { useCallback, useEffect, useState } from 'react';

import { usePrimeClientConfig } from '@/features/client-config';
import { useFleet } from '@/features/fleet';

import { useAuth } from './useAuth';
import type { BootStatus } from '../types/auth.types';
import { checkSession, classifySessionError, restoreSession } from '../utils/authFlow';

type Boot = { status: BootStatus; retrying: boolean; retry: () => void };

// The root layout shows the retry screen for both a failed startup check and a first user load that failed.
export const useBoot = (): Boot => {
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
};
