import type { Tokens, User, UserDto, VerifyResponseDto } from './types';

const str = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

/** Accepts both token naming styles; throws if either token is missing. */
export function toTokens(dto: VerifyResponseDto): Tokens {
  const accessToken = str(dto.userAccessToken) ?? str(dto.accessToken);
  const refreshToken = str(dto.userRefreshToken) ?? str(dto.refreshToken);
  if (!accessToken || !refreshToken) {
    throw new Error('Login response did not include tokens');
  }
  return { accessToken, refreshToken };
}

/** Rupees (number or numeric string, may have paise decimals) -> integer paise. */
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
