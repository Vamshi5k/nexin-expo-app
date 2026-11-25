import { brand } from '@/core/config';

import {
  fallbackClientConfig,
  toClientConfig,
  webUrl,
} from '@/features/client-config/api/clientConfig.api';

// The staging response (2026-11-25), with the logo shortened.
const FULL = {
  clientDetails: {
    id: 7,
    companyName: 'JCD ELECTRIC PRIVATE LIMITED',
    brandName: 'CRUZE ev',
    contactEmail: 'support@cruzeev.in',
    contactPhone: '7989048025',
    gst: '36AAHCJ6405E1ZQ',
    address: ' 1-10/ACS/D/2007, Nallagandla, Lingampalli ',
    businessUrl: 'https://www.cruzeev.in',
    logoUrl: 'https://example.com/logo.png',
    termsAndConditionsUrl: 'https://www.cruzeev.in/terms-and-conditions',
    privacyPolicyUrl: 'https://www.cruzeev.in/privacy-policy',
    refundPolicyUrl: 'https://www.cruzeev.in/refund-cancellation-policy',
    supportUrl: 'https://www.cruzeev.in/#contact',
    shippingPolicyUrl: 'https://www.cruzeev.in/shipping-delivery-policy',
    userPortalUrl: 'https://web.cruzeev.in',
    state: 'Telangana',
    clientId: 9,
  },
  media: {
    url: 'https://cdn.example.com/signed.png?X-Amz=1',
    base64: 'data:image/png;base64,AAAA',
  },
  loginConfig: { userLoginType: 'Phone' },
  features: { fleetFeature: false, couponFeature: true },
};

describe('toClientConfig', () => {
  it('maps every field of the staging response', () => {
    expect(toClientConfig(FULL, brand)).toEqual({
      clientId: '9',
      brandName: 'CRUZE ev',
      logoUri: 'data:image/png;base64,AAAA',
      company: { name: 'JCD ELECTRIC PRIVATE LIMITED', gst: '36AAHCJ6405E1ZQ' },
      contact: {
        email: 'support@cruzeev.in',
        phone: '7989048025',
        address: '1-10/ACS/D/2007, Nallagandla, Lingampalli',
        state: 'Telangana',
      },
      links: {
        terms: 'https://www.cruzeev.in/terms-and-conditions',
        privacy: 'https://www.cruzeev.in/privacy-policy',
        refund: 'https://www.cruzeev.in/refund-cancellation-policy',
        shipping: 'https://www.cruzeev.in/shipping-delivery-policy',
        support: 'https://www.cruzeev.in/#contact',
        website: 'https://www.cruzeev.in',
        userPortal: 'https://web.cruzeev.in',
      },
      loginType: 'phone',
      features: { fleet: false, coupons: true },
      minAppVersion: null,
    });
  });

  it('drops a contact email that is not an address', () => {
    expect(
      toClientConfig({ clientDetails: { contactEmail: 'support' } }, brand).contact.email,
    ).toBeNull();
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
    expect(c.links.terms).toBeNull();
  });

  it('honours fleetFeature true', () => {
    expect(toClientConfig({ features: { fleetFeature: true } }, brand).features.fleet).toBe(true);
  });
});

describe('webUrl', () => {
  it('accepts http(s) URLs, trimmed', () => {
    expect(webUrl(' https://example.com/terms ')).toBe('https://example.com/terms');
    expect(webUrl('http://example.com')).toBe('http://example.com');
  });
  it.each([null, undefined, '', '  ', 'example.com', 'javascript:alert(1)', 'ftp://x', 'https://'])(
    'rejects %p',
    v => {
      expect(webUrl(v)).toBeNull();
    },
  );
});

describe('legal and support links', () => {
  const withLinks = {
    ...brand,
    links: {
      terms: 'https://brand.example/terms',
      privacy: 'https://brand.example/privacy',
      support: 'https://brand.example/support',
    },
  };

  it('fall back to brand.links when /client/info omits them', () => {
    const c = toClientConfig({}, withLinks);
    expect([c.links.terms, c.links.privacy, c.links.support]).toEqual([
      'https://brand.example/terms',
      'https://brand.example/privacy',
      'https://brand.example/support',
    ]);
  });

  it('runtime URLs win; non-http(s) runtime values fall back', () => {
    const c = toClientConfig(
      {
        clientDetails: {
          termsAndConditionsUrl: 'https://runtime/terms',
          privacyPolicyUrl: 'not a url',
        },
      },
      withLinks,
    );
    expect(c.links.terms).toBe('https://runtime/terms');
    expect(c.links.privacy).toBe('https://brand.example/privacy');
  });

  it('are null when neither side has them', () => {
    expect(toClientConfig({}, { ...brand, links: {} }).links.terms).toBeNull();
  });
});
