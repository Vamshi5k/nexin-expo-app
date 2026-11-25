import { api, unwrap, type Envelope, type Tokens } from '@/core/api';
import { brand } from '@/core/config';
import { ENDPOINTS } from '@/core/endpoints';
import { rupeesToPaise } from '@/shared/utils/money';

import { LOGOUT_TIMEOUT_MS } from '../constants/auth.constants';
import type { User, UserDto, VerifyResponseDto } from '../types/auth.types';

const str = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export const toTokens = (dto: VerifyResponseDto): Tokens => {
  const accessToken = str(dto.userAccessToken) ?? str(dto.accessToken);
  const refreshToken = str(dto.userRefreshToken) ?? str(dto.refreshToken);
  if (!accessToken || !refreshToken) {
    throw new Error('Login response did not include tokens');
  }

  return { accessToken, refreshToken };
};

export const toUser = (dto: UserDto): User => ({
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
});

export const authApi = {
  requestOtp: async (contact: string): Promise<void> => {
    await api.post(ENDPOINTS.AUTH.LOGIN, { contact });
  },

  verifyOtp: async (otp: string): Promise<Tokens> => {
    const res = await api.post<VerifyResponseDto>(ENDPOINTS.AUTH.VERIFY, {
      otp,
      appName: brand.apiAppName,
    });
    return toTokens(res.data);
  },

  getUser: async (): Promise<User> => {
    const res = await api.get<Envelope<{ user: UserDto }>>(ENDPOINTS.AUTH.USER);
    return toUser(unwrap(res).user);
  },

  registerPushToken: async (fcmToken: string): Promise<void> => {
    await api.put(ENDPOINTS.AUTH.FCM, { fcmToken });
  },

  // Runs after the session is cleared, so it sends the captured token and never refreshes.
  logout: async (accessToken: string | null): Promise<void> => {
    await api.post(ENDPOINTS.AUTH.LOGOUT, undefined, {
      authToken: accessToken,
      timeout: LOGOUT_TIMEOUT_MS,
    });
  },
};
