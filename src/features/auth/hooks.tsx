import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Keyboard } from 'react-native';

import { getErrorMessage, statusOf } from '@/core/api';
import { brand } from '@/core/config';
import { log } from '@/core/log';
import { useAction, useSessionData, type LoadStatus } from '@/core/request';
import { sessionStore, signOutThen, useSession, type SessionMode } from '@/core/session';
import { useClientConfig, usePrimeClientConfig } from '@/features/client-config';
import { useFleet } from '@/features/fleet';
import { haptics, toast } from '@/ui';

import * as authApi from './api';
import { CONSUMER_OTP_LENGTH, LOGIN_COPY, OTP_RESEND_SECONDS, START_HREF } from './constants';
import {
  checkSession,
  classifySessionError,
  contactFormSchema,
  formatContact,
  guardRoute,
  isOnboardingDone,
  markOnboardingDone,
  resolveStartRoute,
  restoreSession,
  serverLogout,
} from './session';
import type {
  BootStatus,
  ContactForm,
  ContactType,
  GuardDecision,
  RouteGroup,
  User,
} from './types';

export function finishOnboarding(): void {
  markOnboardingDone();
  router.replace(START_HREF.login);
}

export function useBoot(): { status: BootStatus; retrying: boolean; retry: () => void } {
  const primeConfig = usePrimeClientConfig();
  const { loadUser } = useAuth();
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
    setAttempt((n) => n + 1);
  }, []);

  return { status, retrying, retry };
}

type AuthValue = {
  mode: SessionMode;
  user: User | null;
  userStatus: LoadStatus;
  userError: unknown;
  loadUser: () => Promise<User>;
  requestOtp: (contact: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode = useSession((s) => s.mode);
  // Cleared on sign-in, logout and refresh 4xx; a late response for the old session is dropped.
  const user = useSessionData(authApi.getUser);

  // Only stores the tokens: the guard sends the user to "/", which loads the user and routes.
  const verifyOtp = useCallback(async (otp: string) => {
    await sessionStore.getState().signIn('consumer', await authApi.verifyOtp(otp));
  }, []);

  // TODO(phase-charging): disconnect the socket on logout (BLUEPRINT Profile logout).
  const logout = useCallback(() => signOutThen(serverLogout), []);

  const value = useMemo(
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
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

async function openLegal(url: string | null) {
  if (!url) {
    toast.error('Link not available');
    return;
  }
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    log.warn('could not open legal link', { error: String(error) });
    toast.error('Unable to open link');
  }
}

export function useLoginForm() {
  const config = useClientConfig();
  const [override, setOverride] = useState<ContactType | null>(null);
  const type: ContactType = config.loginType === 'email' ? 'email' : (override ?? 'phone');
  const request = useAction(useAuth().requestOtp);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema[type]),
    defaultValues: { contact: '' },
    mode: 'onTouched',
  });
  const contact = useWatch({ control: form.control, name: 'contact' });
  const valid = contactFormSchema[type].safeParse({ contact }).success;

  const switchType = () => {
    form.reset({ contact: '' });
    setOverride(type === 'phone' ? 'email' : 'phone');
  };

  const submit = form.handleSubmit(async ({ contact: raw }) => {
    const value = raw.trim();
    Keyboard.dismiss();
    try {
      await request.run(value);
      router.push({ pathname: '/(auth)/otp', params: { type, value } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return {
    type,
    copy: LOGIN_COPY[type],
    control: form.control,
    valid,
    submitting: request.isPending,
    submit: () => void submit(),
    canSwitchType: config.loginType === 'phone',
    switchType,
    openTerms: () => void openLegal(config.termsUrl),
    openPrivacy: () => void openLegal(config.privacyUrl),
  };
}

function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  useEffect(() => {
    if (remaining === 0) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [remaining]);
  return {
    remaining,
    restart: () => {
      const start = Date.now();
      setNow(start);
      setEndsAt(start + seconds * 1000);
    },
  };
}

// The screen owns the input ref: a ref in the result makes the React Compiler reject every read.
export function useOtpForm(
  type: ContactType,
  value: string,
  { onWrongCode }: { onWrongCode?: () => void } = {},
) {
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const auth = useAuth();
  const verify = useAction(auth.verifyOtp);
  const resend = useAction(auth.requestOtp);
  const countdown = useCountdown(OTP_RESEND_SECONDS);

  const submit = async (otp: string) => {
    if (otp.length !== CONSUMER_OTP_LENGTH || verify.isPending) return;
    try {
      await verify.run(otp);
      haptics.success();
    } catch (error) {
      setCode('');
      setWrong(true);
      onWrongCode?.();
      haptics.warning();
      const status = statusOf(error);
      toast.error(
        status !== undefined && status >= 400 && status < 500
          ? 'Invalid OTP. Please try again.'
          : getErrorMessage(error),
      );
    }
  };

  const resendCode = async () => {
    try {
      await resend.run(value);
      countdown.restart();
      setCode('');
      setWrong(false);
      toast.success('New OTP sent!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
    code,
    changeCode: (next: string) => {
      setWrong(false);
      setCode(next);
    },
    wrong,
    length: CONSUMER_OTP_LENGTH,
    complete: code.length === CONSUMER_OTP_LENGTH,
    verifying: verify.isPending,
    submit: (otp = code) => void submit(otp),
    resendIn: countdown.remaining,
    resending: resend.isPending,
    resend: () => void resendCode(),
    contact: value
      ? formatContact(type, value, brand.phoneCountryCode)
      : type === 'phone'
        ? 'your number'
        : 'your email',
  };
}

// What "/" shows: a redirect, the retry screen, or nothing while the user loads.
export function useStartRoute(): { href: Href | null; failed: boolean; retry: () => void } {
  const { mode, user, userStatus, userError, loadUser } = useAuth();
  const failed = userStatus === 'error';
  const expired = failed && classifySessionError(userError) === 'expired';

  // After OTP sign-in the user isn't loaded yet; boot already loaded it for a restored session.
  useEffect(() => {
    if (mode === 'consumer' && userStatus === 'idle') void loadUser().catch(() => undefined);
  }, [mode, userStatus, loadUser]);

  useEffect(() => {
    if (expired) void sessionStore.getState().signOut();
  }, [expired]);

  const route = resolveStartRoute({ mode, user, onboardingDone: isOnboardingDone() });
  return {
    href: route ? START_HREF[route] : null,
    failed: failed && !expired,
    retry: () => void loadUser().catch(() => undefined),
  };
}

export function useRouteGuard(group: RouteGroup): GuardDecision {
  const mode = useSession((s) => s.mode);
  const fleetEnabled = useClientConfig().features.fleet;
  const decision = guardRoute(group, { mode, fleetEnabled });

  useEffect(() => {
    if (decision !== 'end-session') return;
    log.info('fleet feature is off; ending the fleet session');
    void sessionStore.getState().signOut();
  }, [decision]);

  return decision;
}
