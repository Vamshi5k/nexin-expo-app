export type ClientInfoDto = {
  clientDetails?: {
    brandName?: string | null;
    termsAndConditionsUrl?: string | null;
    privacyPolicyUrl?: string | null;
    supportUrl?: string | null;
    logoUrl?: string | null;
  } | null;
  media?: { url?: string | null; base64?: string | null } | null;
  loginConfig?: { userLoginType?: string | null } | null;
  features?: { fleetFeature?: boolean | null; couponFeature?: boolean | null } | null;
  minAppVersion?: string | null;
};

export type LoginType = 'phone' | 'email';

export type ClientConfig = {
  brandName: string;
  logoUri: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  supportUrl: string | null;
  loginType: LoginType;
  features: { fleet: boolean; coupons: boolean };
  minAppVersion: string | null;
};
