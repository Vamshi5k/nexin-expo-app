import { api, unwrap, type Envelope } from '@/core/api';
import { brand, type BrandConfig } from '@/core/config';
import { ENDPOINTS } from '@/core/endpoints';

import type { ClientConfig, ClientInfoDto } from '../types/clientConfig.types';

const text = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export const webUrl = (v: string | null | undefined): string | null => {
  const s = text(v);
  return s && /^https?:\/\/[^\s/]+/i.test(s) ? s : null;
};

export const fallbackClientConfig = (brand: BrandConfig): ClientConfig => ({
  brandName: brand.appName,
  logoUri: null,
  termsUrl: brand.links.terms ?? null,
  privacyUrl: brand.links.privacy ?? null,
  supportUrl: brand.links.support ?? null,
  loginType: 'phone',
  features: { fleet: brand.features.fleet, coupons: brand.features.coupons },
  minAppVersion: null,
});

export const toClientConfig = (dto: ClientInfoDto, brand: BrandConfig): ClientConfig => {
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
};

export const clientConfigApi = {
  getConfig: async (): Promise<ClientConfig> => {
    const res = await api.get<Envelope<ClientInfoDto>>(ENDPOINTS.CLIENT.INFO, {
      params: { details: true, login: true, logo: true, clientDetails: true },
    });
    return toClientConfig(unwrap(res), brand);
  },
};
