import { z } from 'zod';

import type { BrandConfig } from '@/core/config';

import type { ClientConfig, ClientInfoDto } from './types';

const text = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

/** Build-time values used until (or when) /client/info doesn't provide them. */
export function fallbackClientConfig(brand: BrandConfig): ClientConfig {
  return {
    brandName: brand.appName,
    logoUri: null,
    termsUrl: null,
    privacyUrl: null,
    supportUrl: null,
    loginType: 'phone',
    features: { fleet: brand.features.fleet, coupons: brand.features.coupons },
    minAppVersion: null,
  };
}

/**
 * DTO -> ClientConfig. Missing fields fall back to brand values.
 * Logo preference: base64 (doesn't expire, safe to cache) > media.url (signed, may expire)
 * > clientDetails.logoUrl.
 */
export function toClientConfig(dto: ClientInfoDto, brand: BrandConfig): ClientConfig {
  const fb = fallbackClientConfig(brand);
  const d = dto.clientDetails ?? {};
  const base64 = text(dto.media?.base64);
  return {
    brandName: text(d.brandName) ?? fb.brandName,
    logoUri:
      (base64?.startsWith('data:image/') ? base64 : null) ??
      text(dto.media?.url) ??
      text(d.logoUrl) ??
      fb.logoUri,
    termsUrl: text(d.termsAndConditionsUrl) ?? fb.termsUrl,
    privacyUrl: text(d.privacyPolicyUrl) ?? fb.privacyUrl,
    supportUrl: text(d.supportUrl) ?? fb.supportUrl,
    loginType: dto.loginConfig?.userLoginType?.toLowerCase() === 'email' ? 'email' : 'phone',
    features: {
      fleet: dto.features?.fleetFeature ?? fb.features.fleet,
      coupons: dto.features?.couponFeature ?? fb.features.coupons,
    },
    minAppVersion: text(dto.minAppVersion) ?? fb.minAppVersion,
  };
}

/** Versioned cache envelope, so the old app's raw CLIENT_CONFIG (migrated) is ignored. */
export const CACHE_VERSION = 1;

const CachedSchema = z.object({
  v: z.literal(CACHE_VERSION),
  config: z.object({
    brandName: z.string().min(1),
    logoUri: z.string().nullable(),
    termsUrl: z.string().nullable(),
    privacyUrl: z.string().nullable(),
    supportUrl: z.string().nullable(),
    loginType: z.enum(['phone', 'email']),
    features: z.object({ fleet: z.boolean(), coupons: z.boolean() }),
    minAppVersion: z.string().nullable(),
  }),
});

export function toCache(config: ClientConfig): unknown {
  return { v: CACHE_VERSION, config };
}

/** Parses a cached value; anything unrecognised (legacy shape, corrupt) returns undefined. */
export function fromCache(value: unknown): ClientConfig | undefined {
  const parsed = CachedSchema.safeParse(value);
  return parsed.success ? parsed.data.config : undefined;
}
