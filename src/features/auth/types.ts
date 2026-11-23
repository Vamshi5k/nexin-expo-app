import type { Tokens } from '@/core/api';

/** POST /auth/app/verify. Tokens are top-level; older builds used the user* names. */
export type VerifyResponseDto = {
  userAccessToken?: string | null;
  accessToken?: string | null;
  userRefreshToken?: string | null;
  refreshToken?: string | null;
  message?: string;
};

/** GET /auth/user-by-token -> data.user (only the fields the app reads). */
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
  /** Integer paise. Format only at render time. */
  walletBalancePaise: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  gst: string | null;
};

export type ContactType = 'phone' | 'email';

export type { Tokens };
