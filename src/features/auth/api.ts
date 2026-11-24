import { api, unwrap, type Envelope } from '@/core/api';
import { brand } from '@/core/config';

import type { UserDto, VerifyResponseDto, Tokens, User } from './types';

export async function login(contact: string): Promise<void> {
  await api.post('/auth/app/login', { contact });
}

export async function verify(otp: string): Promise<VerifyResponseDto> {
  const res = await api.post<VerifyResponseDto>('/auth/app/verify', {
    otp,
    appName: brand.apiAppName,
  });
  return res.data;
}

export async function userByToken(): Promise<UserDto> {
  const res = await api.get<Envelope<{ user: UserDto }>>('/auth/user-by-token');
  return unwrap(res).user;
}

export async function registerFcm(fcmToken: string): Promise<void> {
  await api.put('/auth/fcm', { fcmToken });
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
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
