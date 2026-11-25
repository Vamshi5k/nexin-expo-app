export type ClientInfoDto = {
  clientDetails?: {
    id?: number | string | null;
    clientId?: number | string | null;
    companyName?: string | null;
    brandName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    gst?: string | null;
    address?: string | null;
    state?: string | null;
    businessUrl?: string | null;
    logoUrl?: string | null;
    termsAndConditionsUrl?: string | null;
    privacyPolicyUrl?: string | null;
    refundPolicyUrl?: string | null;
    shippingPolicyUrl?: string | null;
    supportUrl?: string | null;
    userPortalUrl?: string | null;
  } | null;
  media?: { url?: string | null; base64?: string | null } | null;
  loginConfig?: { userLoginType?: string | null } | null;
  features?: { fleetFeature?: boolean | null; couponFeature?: boolean | null } | null;
  minAppVersion?: string | null;
};

export type LoginType = 'phone' | 'email';

export type ClientLinks = {
  terms: string | null;
  privacy: string | null;
  refund: string | null;
  shipping: string | null;
  support: string | null;
  website: string | null;
  userPortal: string | null;
};

export type ClientContact = {
  email: string | null;
  phone: string | null;
  address: string | null;
  state: string | null;
};

export type ClientCompany = {
  name: string | null;
  gst: string | null;
};

export type ClientConfig = {
  clientId: string | null;
  brandName: string;
  logoUri: string | null;
  company: ClientCompany;
  contact: ClientContact;
  links: ClientLinks;
  loginType: LoginType;
  features: { fleet: boolean; coupons: boolean };
  minAppVersion: string | null;
};
