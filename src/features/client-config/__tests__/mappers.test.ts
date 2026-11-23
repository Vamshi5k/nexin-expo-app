import { brand } from '@/core/config';

import { fallbackClientConfig, fromCache, toCache, toClientConfig } from '../mappers';

const FULL = {
  clientDetails: {
    brandName: 'CRUZE ev',
    termsAndConditionsUrl: 'https://example.com/terms',
    privacyPolicyUrl: 'https://example.com/privacy',
    supportUrl: 'https://example.com/#contact',
    logoUrl: 'https://example.com/logo.png',
  },
  media: {
    url: 'https://cdn.example.com/signed.png?X-Amz=1',
    base64: 'data:image/png;base64,AAAA',
  },
  loginConfig: { userLoginType: 'Phone' },
  features: { fleetFeature: false, couponFeature: true },
};

describe('toClientConfig', () => {
  it('maps the staging response', () => {
    expect(toClientConfig(FULL, brand)).toEqual({
      brandName: 'CRUZE ev',
      logoUri: 'data:image/png;base64,AAAA',
      termsUrl: 'https://example.com/terms',
      privacyUrl: 'https://example.com/privacy',
      supportUrl: 'https://example.com/#contact',
      loginType: 'phone',
      features: { fleet: false, coupons: true },
      minAppVersion: null,
    });
  });

  it('reads Email login type case-insensitively', () => {
    expect(toClientConfig({ loginConfig: { userLoginType: 'Email' } }, brand).loginType).toBe(
      'email',
    );
    expect(toClientConfig({ loginConfig: { userLoginType: 'EMAIL' } }, brand).loginType).toBe(
      'email',
    );
  });

  it('prefers base64, then media.url, then clientDetails.logoUrl', () => {
    expect(
      toClientConfig({ ...FULL, media: { url: 'https://m', base64: null } }, brand).logoUri,
    ).toBe('https://m');
    expect(toClientConfig({ ...FULL, media: null }, brand).logoUri).toBe(
      'https://example.com/logo.png',
    );
    // A base64 value that isn't an image data URI is ignored.
    expect(toClientConfig({ ...FULL, media: { base64: 'garbage' } }, brand).logoUri).toBe(
      'https://example.com/logo.png',
    );
  });

  it('falls back to brand values for every missing field', () => {
    expect(toClientConfig({}, brand)).toEqual(fallbackClientConfig(brand));
    expect(fallbackClientConfig(brand).brandName).toBe(brand.appName);
    expect(fallbackClientConfig(brand).features).toEqual(brand.features);
  });

  it('treats blank strings as missing', () => {
    const c = toClientConfig(
      { clientDetails: { brandName: '  ', termsAndConditionsUrl: '' } },
      brand,
    );
    expect(c.brandName).toBe(brand.appName);
    expect(c.termsUrl).toBeNull();
  });

  it('honours fleetFeature true', () => {
    expect(toClientConfig({ features: { fleetFeature: true } }, brand).features.fleet).toBe(true);
  });
});

describe('client config cache', () => {
  it('round-trips', () => {
    const c = toClientConfig(FULL, brand);
    expect(fromCache(JSON.parse(JSON.stringify(toCache(c))))).toEqual(c);
  });

  it("ignores the old app's raw CLIENT_CONFIG and corrupt values", () => {
    expect(fromCache({ loginType: 'Phone', fleetFeature: true })).toBeUndefined();
    expect(fromCache('nope')).toBeUndefined();
    expect(fromCache(undefined)).toBeUndefined();
  });
});
