import { fromCache, toCache } from '@/features/client-config/utils/cache';
import type { ClientConfig } from '@/features/client-config/types/clientConfig.types';

const CONFIG: ClientConfig = {
  clientId: '9',
  brandName: 'CRUZE ev',
  logoUri: 'https://cdn.example.com/signed.png?X-Amz=1',
  company: { name: 'JCD ELECTRIC PRIVATE LIMITED', gst: '36AAHCJ6405E1ZQ' },
  contact: { email: 'support@cruzeev.in', phone: '7989048025', address: null, state: 'Telangana' },
  links: {
    terms: 'https://example.com/terms',
    privacy: 'https://example.com/privacy',
    refund: null,
    shipping: null,
    support: 'https://example.com/#contact',
    website: 'https://example.com',
    userPortal: null,
  },
  loginType: 'phone',
  features: { fleet: false, coupons: true },
  minAppVersion: '2.1.0',
};

describe('client config cache', () => {
  it('round-trips', () => {
    expect(fromCache(JSON.parse(JSON.stringify(toCache(CONFIG))))).toEqual(CONFIG);
  });

  it("ignores the old app's raw CLIENT_CONFIG and corrupt values", () => {
    expect(fromCache({ loginType: 'Phone', fleetFeature: true })).toBeUndefined();
    expect(fromCache('nope')).toBeUndefined();
    expect(fromCache(undefined)).toBeUndefined();
  });

  it('ignores a version 1 cache (flat termsUrl / privacyUrl shape)', () => {
    expect(
      fromCache({
        v: 1,
        config: {
          brandName: 'X',
          logoUri: null,
          termsUrl: null,
          privacyUrl: null,
          supportUrl: null,
          loginType: 'phone',
          features: { fleet: false, coupons: false },
          minAppVersion: null,
        },
      }),
    ).toBeUndefined();
  });
});
