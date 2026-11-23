import { api, unwrap, type Envelope } from '@/core/api';
import { brand } from '@/core/config';

import type { UserDto, VerifyResponseDto } from './types';

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
