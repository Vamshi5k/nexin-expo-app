import { api, unwrap, type Envelope, type Tokens } from '@/core/api';
import { brand } from '@/core/config';

import { LOGOUT_TIMEOUT_MS } from './constants';
import type { User, UserDto, VerifyResponseDto } from './types';

export async function requestOtp(contact: string): Promise<void> {
  await api.post('/auth/app/login', { contact });
}

export async function verifyOtp(otp: string): Promise<Tokens> {
  const res = await api.post<VerifyResponseDto>('/auth/app/verify', {
    otp,
    appName: brand.apiAppName,
  });
  return toTokens(res.data);
}

export async function getUser(): Promise<User> {
  const res = await api.get<Envelope<{ user: UserDto }>>('/auth/user-by-token');
  return toUser(unwrap(res).user);
}

export async function registerPushToken(fcmToken: string): Promise<void> {
  await api.put('/auth/fcm', { fcmToken });
}

export async function logout(accessToken: string | null): Promise<void> {
  await api.post('/auth/logout', undefined, {
    authToken: accessToken,
    timeout: LOGOUT_TIMEOUT_MS,
  });
}

const str = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export function toTokens(dto: VerifyResponseDto): Tokens {
  const accessToken = str(dto.userAccessToken) ?? str(dto.accessToken);
  const refreshToken = str(dto.userRefreshToken) ?? str(dto.refreshToken);
  if (!accessToken || !refreshToken) {
    throw new Error('Login response did not include tokens');
  }
  return { accessToken, refreshToken };
}

export function rupeesToPaise(value: number | string | null | undefined): number {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function toUser(dto: UserDto): User {
  return {
    id: String(dto.id),
    userId: str(dto.userId),
    firstName: str(dto.first_name) ?? '',
    lastName: str(dto.last_name) ?? '',
    email: str(dto.email),
    phone: str(dto.phone),
    isFirstLogin: dto.isFirstLogin === true,
    walletBalancePaise: rupeesToPaise(dto.wallet?.balance),
    isEmailVerified: dto.is_email_verified === true,
    isPhoneVerified: dto.is_phone_verified === true,
    gst: str(dto.gst),
  };
}
