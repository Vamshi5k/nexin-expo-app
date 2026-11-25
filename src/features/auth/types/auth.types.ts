export type VerifyResponseDto = {
  userAccessToken?: string | null;
  accessToken?: string | null;
  userRefreshToken?: string | null;
  refreshToken?: string | null;
  message?: string;
};

export type UserDto = {
  id: number | string;
  userId?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  isFirstLogin?: boolean | null;
  wallet?: { balance?: number | string | null } | null;
  is_email_verified?: boolean | null;
  is_phone_verified?: boolean | null;
  gst?: string | null;
};

export type User = {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  isFirstLogin: boolean;
  walletBalancePaise: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  gst: string | null;
};

export type ContactType = 'phone' | 'email';
export type ContactForm = { contact: string };
export type FleetLoginForm = { fleetId: string; contact: string };

export type SetupStep = 'profile' | 'vehicle' | 'permissions' | 'done';
export type SetupScreen = Exclude<SetupStep, 'done'>;
export type StartRoute = 'onboarding' | 'login' | SetupScreen | 'home' | 'fleet';
export type RouteGroup = 'auth' | 'fleet-auth' | 'setup' | 'app' | 'fleet';
export type GuardDecision = 'allow' | 'redirect' | 'end-session';
export type BootStatus = 'loading' | 'ready' | 'error';

export type OnboardingSlide = {
  key: 'find' | 'charge' | 'pay';
  title: string;
  description: string;
};
