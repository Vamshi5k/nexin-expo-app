import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
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
import { useForm, useWatch } from 'react-hook-form';
import { Keyboard } from 'react-native';
import type { StoreApi } from 'zustand';
import { z } from 'zod';

import { getErrorMessage, statusOf } from '@/core/api';
import { brand, phonePattern } from '@/core/config';
import { log } from '@/core/log';
import { useAction } from '@/core/request';
import {
  sessionStore,
  signOutThen,
  useSession,
  type SessionMode,
  type SessionState,
} from '@/core/session';
import { hydrateStorage, KV_KEYS, kv, migrateLegacyStorage } from '@/core/storage';
import { useClientConfig, usePrimeClientConfig } from '@/features/client-config';
import { fleetLogout, useFleet } from '@/features/fleet';
import { haptics, toast } from '@/ui';

import * as authApi from './api';
import {
  CONSUMER_OTP_LENGTH,
  LOGIN_COPY,
  ONBOARDING_DONE_VALUE,
  OTP_RESEND_SECONDS,
  SESSION_CHECK_TIMEOUT_MS,
  START_HREF,
} from './constants';
import type {
  BootStatus,
  ContactForm,
  ContactType,
  GuardDecision,
  RouteGroup,
  StartRoute,
  User,
  UserStatus,
} from './types';

// ---------------------------------------------------------------------------
// Validation and formatting
// ---------------------------------------------------------------------------

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

const contactFormSchema = {
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

// ---------------------------------------------------------------------------
// Routing rules
// ---------------------------------------------------------------------------

export function resolveStartRoute(input: {
  mode: SessionMode;
  user: Pick<User, 'isFirstLogin'> | null | undefined;
  onboardingDone: boolean;
}): StartRoute | null {
  if (input.mode === 'fleet') return 'fleet';
  if (input.mode === 'consumer') {
    if (!input.user) return null; // still loading
    return input.user.isFirstLogin ? 'setup' : 'home';
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

export function finishOnboarding(): void {
  markOnboardingDone();
  router.replace(START_HREF.login);
}

// ---------------------------------------------------------------------------
// Session and boot
// ---------------------------------------------------------------------------

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

export class BootTimeoutError extends Error {
  constructor() {
    super('Session check timed out');
    this.name = 'BootTimeoutError';
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new BootTimeoutError()), ms);
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

// ---------------------------------------------------------------------------
// AuthContext
// ---------------------------------------------------------------------------

export async function serverLogout(mode: SessionMode, accessToken: string | null): Promise<void> {
  if (mode === 'fleet') await fleetLogout(accessToken);
  else if (mode === 'consumer') await authApi.logout(accessToken);
}

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
const NO_USER: UserState = { user: null, userStatus: 'idle', userError: null };

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode = useSession((s) => s.mode);
  const [state, setState] = useState<UserState>(NO_USER);
  // Bumped on every session change (sign-in, logout, refresh 4xx) so a response for the
  // previous session can never write the old user back.
  const generation = useRef(0);

  useEffect(
    () =>
      sessionStore.subscribe((next, prev) => {
        if (next.mode === prev.mode) return;
        generation.current++;
        setState(NO_USER);
      }),
    [],
  );

  const loadUser = useCallback(async () => {
    const gen = generation.current;
    setState((s) => ({ ...s, userStatus: 'loading', userError: null }));
    try {
      const user = await authApi.getUser();
      if (gen === generation.current) setState({ user, userStatus: 'ready', userError: null });
      return user;
    } catch (error) {
      if (gen === generation.current)
        setState((s) => ({ ...s, userStatus: 'error', userError: error }));
      throw error;
    }
  }, []);

  // Only stores the tokens: the guard sends the user to "/", which loads the user and routes.
  const verifyOtp = useCallback(async (otp: string) => {
    await sessionStore.getState().signIn('consumer', await authApi.verifyOtp(otp));
  }, []);

  // TODO(phase-charging): disconnect the socket on logout (BLUEPRINT Profile logout).
  const logout = useCallback(() => signOutThen(serverLogout), []);

  const value = useMemo(
    () => ({ mode, ...state, loadUser, requestOtp: authApi.requestOtp, verifyOtp, logout }),
    [mode, state, loadUser, verifyOtp, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// ---------------------------------------------------------------------------
// Screen hooks
// ---------------------------------------------------------------------------

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
