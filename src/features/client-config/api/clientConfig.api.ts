import { api, unwrap, type Envelope } from '@/core/api';
import { brand, type BrandConfig } from '@/core/config';
import { ENDPOINTS } from '@/core/endpoints';

import type { ClientConfig, ClientInfoDto } from '../types/clientConfig.types';

const text = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export const webUrl = (v: string | null | undefined): string | null => {
  const s = text(v);
  return s && /^https?:\/\/[^\s/]+/i.test(s) ? s : null;
};

const id = (v: number | string | null | undefined): string | null =>
  v == null ? null : text(String(v));

const email = (v: string | null | undefined): string | null => {
  const s = text(v);
  return s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
};

export const fallbackClientConfig = (brand: BrandConfig): ClientConfig => ({
  clientId: null,
  brandName: brand.appName,
  logoUri: null,
  company: { name: null, gst: null },
  contact: { email: null, phone: null, address: null, state: null },
  links: {
    terms: brand.links.terms ?? null,
    privacy: brand.links.privacy ?? null,
    refund: null,
    shipping: null,
    support: brand.links.support ?? null,
    website: null,
    userPortal: null,
  },
  loginType: 'phone',
  features: { fleet: brand.features.fleet, coupons: brand.features.coupons },
  minAppVersion: null,
});

export const toClientConfig = (dto: ClientInfoDto, brand: BrandConfig): ClientConfig => {
  const fb = fallbackClientConfig(brand);
  const d = dto.clientDetails ?? {};
  const base64 = text(dto.media?.base64);

  return {
    clientId: id(d.clientId),
    brandName: text(d.brandName) ?? fb.brandName,
    // Inline base64 first: media.url is a signed link that expires.
    logoUri:
      (base64?.startsWith('data:image/') ? base64 : null) ??
      webUrl(dto.media?.url) ??
      webUrl(d.logoUrl) ??
      fb.logoUri,
    company: { name: text(d.companyName), gst: text(d.gst) },
    contact: {
      email: email(d.contactEmail),
      phone: text(d.contactPhone),
      address: text(d.address),
      state: text(d.state),
    },
    links: {
      terms: webUrl(d.termsAndConditionsUrl) ?? fb.links.terms,
      privacy: webUrl(d.privacyPolicyUrl) ?? fb.links.privacy,
      refund: webUrl(d.refundPolicyUrl) ?? fb.links.refund,
      shipping: webUrl(d.shippingPolicyUrl) ?? fb.links.shipping,
      support: webUrl(d.supportUrl) ?? fb.links.support,
      website: webUrl(d.businessUrl) ?? fb.links.website,
      userPortal: webUrl(d.userPortalUrl) ?? fb.links.userPortal,
    },
    loginType: dto.loginConfig?.userLoginType?.trim().toLowerCase() === 'email' ? 'email' : 'phone',
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
