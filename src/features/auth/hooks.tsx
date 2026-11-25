import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Keyboard,
  useWindowDimensions,
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useForm, useWatch } from 'react-hook-form';
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useClientConfig } from '@/features/client-config';

import { getErrorMessage, statusOf } from '@/core/api';
import { brand } from '@/core/config';
import { log } from '@/core/log';
import { useAction, useSessionData, type LoadStatus } from '@/core/request';
import { sessionStore, signOutThen, useSession, type SessionMode } from '@/core/session';
import { haptics } from '@/shared/utils/haptics';
import { toast } from '@/shared/utils/toast';

import * as authApi from './api';
import {
  CONSUMER_OTP_LENGTH,
  LOGIN_COPY,
  LOGOUT_DIALOG_EXIT_MS,
  ONBOARDING_SLIDES,
  OTP_RESEND_SECONDS,
  START_HREF,
} from './constants';
import { contactFormSchema, formatContact, markOnboardingDone, serverLogout } from './session';
import type { ContactForm, ContactType, OnboardingSlide, User } from './types';

function finishOnboarding(): void {
  markOnboardingDone();
  router.replace(START_HREF.login);
}

// The screen owns the list ref for the same React Compiler reason as useOtpForm.
export function useOnboarding(list: RefObject<FlatList<OnboardingSlide> | null>) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  const spin = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const count = ONBOARDING_SLIDES.length;
  const last = index === count - 1;
  const lastOffset = (count - 1) * width;

  useEffect(() => {
    if (reduceMotion) return;
    spin.set(withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1, false));
  }, [spin, reduceMotion]);

  const onScroll = useAnimatedScrollHandler(e => {
    x.value = e.contentOffset.x;
  });

  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [lastOffset - width, lastOffset], [1, 0], Extrapolation.CLAMP),
  }));

  const next = () => {
    if (last) return finishOnboarding();
    list.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return {
    slides: ONBOARDING_SLIDES,
    count,
    index,
    last,
    width,
    x,
    spin,
    onScroll,
    onScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) =>
      setIndex(Math.round(e.nativeEvent.contentOffset.x / width)),
    skipStyle,
    next,
    skip: finishOnboarding,
  };
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
  const mode = useSession(s => s.mode);
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

// Confirm first; on "Yes" the dialog fades out, then the session clears and the guard shows Login.
export function useLogoutConfirm() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const confirm = () => {
    if (leaving) return;
    setLeaving(true);
    setOpen(false);
    setTimeout(() => {
      logout().catch(() => {
        setLeaving(false);
        toast.error('Could not log out');
      });
    }, LOGOUT_DIALOG_EXIT_MS);
  };

  return {
    open,
    leaving,
    ask: () => setOpen(true),
    cancel: () => setOpen(false),
    confirm,
  };
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export async function openLegal(url: string | null) {
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
