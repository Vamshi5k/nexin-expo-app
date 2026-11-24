import { z } from 'zod';

import { api, unwrap, type Envelope } from '@/core/api';
import type { BrandConfig } from '@/core/config';

import type { ClientInfoDto, ClientConfig } from './types';

export const CLIENT_INFO_PATH = '/client/info';

export async function getClientInfo(): Promise<ClientInfoDto> {
  const res = await api.get<Envelope<ClientInfoDto>>(CLIENT_INFO_PATH, {
    params: { details: true, login: true, logo: true, clientDetails: true },
  });
  return unwrap(res);
}

const text = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export function webUrl(v: string | null | undefined): string | null {
  const s = text(v);
  return s && /^https?:\/\/[^\s/]+/i.test(s) ? s : null;
}

export function fallbackClientConfig(brand: BrandConfig): ClientConfig {
  return {
    brandName: brand.appName,
    logoUri: null,
    termsUrl: brand.links.terms ?? null,
    privacyUrl: brand.links.privacy ?? null,
    supportUrl: brand.links.support ?? null,
    loginType: 'phone',
    features: { fleet: brand.features.fleet, coupons: brand.features.coupons },
    minAppVersion: null,
  };
}

export function toClientConfig(dto: ClientInfoDto, brand: BrandConfig): ClientConfig {
  const fb = fallbackClientConfig(brand);
  const d = dto.clientDetails ?? {};
  const base64 = text(dto.media?.base64);
  return {
    brandName: text(d.brandName) ?? fb.brandName,
    logoUri:
      (base64?.startsWith('data:image/') ? base64 : null) ??
      webUrl(dto.media?.url) ??
      webUrl(d.logoUrl) ??
      fb.logoUri,
    termsUrl: webUrl(d.termsAndConditionsUrl) ?? fb.termsUrl,
    privacyUrl: webUrl(d.privacyPolicyUrl) ?? fb.privacyUrl,
    supportUrl: webUrl(d.supportUrl) ?? fb.supportUrl,
    loginType: dto.loginConfig?.userLoginType?.toLowerCase() === 'email' ? 'email' : 'phone',
    features: {
      fleet: dto.features?.fleetFeature ?? fb.features.fleet,
      coupons: dto.features?.couponFeature ?? fb.features.coupons,
    },
    minAppVersion: text(dto.minAppVersion) ?? fb.minAppVersion,
  };
}

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

export function fromCache(value: unknown): ClientConfig | undefined {
  const parsed = CachedSchema.safeParse(value);
  return parsed.success ? parsed.data.config : undefined;
}
