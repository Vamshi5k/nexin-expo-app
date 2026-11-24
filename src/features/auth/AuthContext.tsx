import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { StoreApi } from 'zustand';

import {
  sessionStore,
  signOutThen,
  useSession,
  type SessionMode,
  type SessionState,
} from '@/core/session';
import { fleetLogout } from '@/features/fleet';

import { login, logout as logoutRequest, toTokens, toUser, userByToken, verify } from './api';
import type { User } from './types';

export async function serverLogout(mode: SessionMode, accessToken: string | null): Promise<void> {
  if (mode === 'fleet') await fleetLogout(accessToken);
  else if (mode === 'consumer') await logoutRequest(accessToken);
}

export function signOutEverywhere(store: StoreApi<SessionState> = sessionStore): Promise<void> {
  // TODO(phase-charging): disconnect the socket here (BLUEPRINT Profile logout).
  return signOutThen(serverLogout, store);
}

export type UserStatus = 'idle' | 'loading' | 'ready' | 'error';

type AuthValue = {
  mode: SessionMode;
  user: User | null;
  userStatus: UserStatus;
  userError: unknown;
  loadUser: () => Promise<User>;
  requestOtp: (contact: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

type UserState = Pick<AuthValue, 'user' | 'userStatus' | 'userError'>;
const EMPTY: UserState = { user: null, userStatus: 'idle', userError: null };

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode = useSession((s) => s.mode);
  const [state, setState] = useState<UserState>(EMPTY);
  // Bumped on every session change (sign-in, logout, refresh 4xx) so a response for the
  // previous session can never write the old user back.
  const generation = useRef(0);

  useEffect(
    () =>
      sessionStore.subscribe((next, prev) => {
        if (next.mode === prev.mode) return;
        generation.current++;
        setState(EMPTY);
      }),
    [],
  );

  const loadUser = useCallback(async () => {
    const gen = generation.current;
    setState((s) => ({ ...s, userStatus: 'loading', userError: null }));
    try {
      const user = toUser(await userByToken());
      if (gen === generation.current) setState({ user, userStatus: 'ready', userError: null });
      return user;
    } catch (error) {
      if (gen === generation.current)
        setState((s) => ({ ...s, userStatus: 'error', userError: error }));
      throw error;
    }
  }, []);

  const requestOtp = useCallback((contact: string) => login(contact), []);

  // Only stores the tokens: the guard sends the user to "/", which loads the user and routes.
  const verifyOtp = useCallback(async (otp: string) => {
    const tokens = toTokens(await verify(otp));
    await sessionStore.getState().signIn('consumer', tokens);
  }, []);

  const logout = useCallback(() => signOutEverywhere(), []);

  const value = useMemo(
    () => ({ mode, ...state, loadUser, requestOtp, verifyOtp, logout }),
    [mode, state, loadUser, requestOtp, verifyOtp, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
