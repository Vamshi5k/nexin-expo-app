/** Raw GET /client/info shape (only the fields the app reads). */
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
  /** Not sent by the backend yet; read if it appears. */
  minAppVersion?: string | null;
};

export type LoginType = 'phone' | 'email';

/** Runtime client config. Wins over build-time brand values where both exist. */
export type ClientConfig = {
  brandName: string;
  /** Image source for the client logo: a data: URI or an https URL. Null = build-time asset. */
  logoUri: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  supportUrl: string | null;
  loginType: LoginType;
  features: { fleet: boolean; coupons: boolean };
  minAppVersion: string | null;
};
