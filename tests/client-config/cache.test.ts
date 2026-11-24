import { fromCache, toCache } from '@/features/client-config/hooks';
import type { ClientConfig } from '@/features/client-config/types';

const CONFIG: ClientConfig = {
  brandName: 'CRUZE ev',
  logoUri: 'https://cdn.example.com/signed.png?X-Amz=1',
  termsUrl: 'https://example.com/terms',
  privacyUrl: 'https://example.com/privacy',
  supportUrl: 'https://example.com/#contact',
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
});
