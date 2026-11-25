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

  const {
    data: user,
    status: userStatus,
    error: userError,
    load: loadUser,
  } = useSessionData(authApi.getUser);

  const requestOtp = useCallback((contact: string) => authApi.requestOtp(contact), []);

  const verifyOtp = useCallback(async (otp: string) => {
    const tokens = await authApi.verifyOtp(otp);
    await sessionStore.getState().signIn('consumer', tokens);
  }, []);

  const logout = useCallback(() => signOutThen(serverLogout), []);

  const value = useMemo<AuthContextType>(
    () => ({ mode, user, userStatus, userError, loadUser, requestOtp, verifyOtp, logout }),
    [mode, user, userStatus, userError, loadUser, requestOtp, verifyOtp, logout],
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
