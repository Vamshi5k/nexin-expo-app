import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { useSessionData, type LoadStatus } from '@/core/request';
import { sessionStore, signOutThen, useSession, type SessionMode } from '@/core/session';

import { authApi } from '../api/auth.api';
import type { User } from '../types/auth.types';
import { serverLogout } from '../utils/authFlow';

type AuthContextType = {
  mode: SessionMode;
  user: User | null;
  userStatus: LoadStatus;
  userError: unknown;
  loadUser: () => Promise<User>;
  requestOtp: (contact: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const mode = useSession(s => s.mode);
  // Cleared on sign-in, logout and refresh 4xx; a late response for the old session is dropped.
  const user = useSessionData(authApi.getUser);

  // Only stores the tokens: the guard sends the user to "/", which loads the user and routes.
  const verifyOtp = useCallback(async (otp: string) => {
    await sessionStore.getState().signIn('consumer', await authApi.verifyOtp(otp));
  }, []);

  // TODO(phase-charging): disconnect the socket on logout (BLUEPRINT Profile logout).
  const logout = useCallback(() => signOutThen(serverLogout), []);

  const value = useMemo<AuthContextType>(
    () => ({
      mode,
      user: user.data,
      userStatus: user.status,
      userError: user.error,
      loadUser: user.load,
      requestOtp: authApi.requestOtp,
      verifyOtp,
      logout,
    }),
    [mode, user.data, user.status, user.error, user.load, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
