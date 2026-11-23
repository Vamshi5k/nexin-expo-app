import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { log } from '@/core/log';
import { sessionStore, useSession } from '@/core/session';

import { login, logout, verify } from './api';
import { clearUserData, runBoot, type BootOutcome } from './boot';
import { toTokens } from './mappers';
import { meQuery } from './queries';

/** Current consumer user (loaded at boot or after OTP). */
export function useMe() {
  const mode = useSession((s) => s.mode);
  return useQuery({ ...meQuery(), enabled: mode === 'consumer' });
}

/** Sends (or re-sends) the OTP. */
export function useRequestOtp() {
  return useMutation({ mutationFn: (contact: string) => login(contact) });
}

/**
 * Verifies the OTP and starts the consumer session. The (auth) guard then redirects to
 * "/", whose start redirect loads the user and routes (setup or home).
 */
export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (otp: string) => {
      const tokens = toTokens(await verify(otp));
      await sessionStore.getState().signIn('consumer', tokens);
      // TODO(phase-charging): GET /device-transactions/running-transaction and offer
      // "Resume charging" (BLUEPRINT A4).
      // TODO(phase-setup): register the FCM token (PUT /auth/fcm) once notification
      // permission is granted.
    },
  });
}

/** Best-effort POST /auth/logout; always clears the session and user data locally. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await logout();
      } catch (error) {
        log.warn('logout request failed; clearing locally anyway', { error: String(error) });
      } finally {
        await sessionStore.getState().signOut();
        clearUserData(queryClient);
      }
    },
  });
}

export type BootState = {
  status: 'loading' | BootOutcome;
  /** True while Try Again re-runs boot (the error screen stays up with a spinner). */
  retrying: boolean;
  retry: () => void;
};

/** Runs boot once; retry() re-runs it from the boot error screen. */
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
