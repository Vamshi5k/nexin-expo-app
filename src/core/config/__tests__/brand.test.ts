import brandConfig from '@brand/brand.config';
import { resolveAppEnv, resolveEnv } from '@brand/env';
import { BrandSchema, findPlaceholders, parseBrand } from '@brand/schema';

describe('brand schema', () => {
  it('accepts the committed brand config', () => {
    expect(BrandSchema.safeParse(brandConfig).success).toBe(true);
  });

  it('applies defaults for omitted optional values', () => {
    const { fontFamily, locale, currency, features, ...rest } = brandConfig;
    void fontFamily;
    void locale;
    void currency;
    void features;
    const parsed = parseBrand(rest);
    expect(parsed.fontFamily).toBe('Inter');
    expect(parsed.locale).toBe('en-IN');
    expect(parsed.currency).toEqual({ code: 'INR', symbol: '₹' });
    expect(parsed.features).toEqual({ fleet: false, coupons: false });
  });

  it('rejects a bad hex colour', () => {
    const bad = { ...brandConfig, colors: { ...brandConfig.colors, primary: 'teal' } };
    expect(() => parseBrand(bad)).toThrow(/colors\.primary/);
  });

  it('rejects a missing connector status colour', () => {
    const { Unknown, ...connectorColors } = brandConfig.connectorColors;
    void Unknown;
    expect(BrandSchema.safeParse({ ...brandConfig, connectorColors }).success).toBe(false);
  });

  it('finds CHANGE_ME placeholders with their paths', () => {
    const withPlaceholder = {
      ...brandConfig,
      appName: 'CHANGE_ME',
      deepLinkDomains: ['ok.com', 'CHANGE_ME.com'],
    };
    expect(findPlaceholders(withPlaceholder)).toEqual(['appName', 'deepLinkDomains.1']);
    expect(findPlaceholders(brandConfig)).toEqual([]);
  });
});

describe('brand env', () => {
  it('defaults to development and rejects unknown envs', () => {
    expect(resolveAppEnv(undefined)).toBe('development');
    expect(() => resolveAppEnv('prod')).toThrow(/Unknown APP_ENV/);
  });

  it('lets build env vars override hosts and token', () => {
    const env = resolveEnv('staging', { API_HOST: 'http://localhost:8080/', CLIENT_TOKEN: 't' });
    expect(env.apiHost).toBe('http://localhost:8080');
    expect(env.clientToken).toBe('t');
  });
});

describe('appearance', () => {
  it("defaults to 'system' and rejects unknown values", () => {
    const { appearance, ...rest } = brandConfig;
    void appearance;
    expect(parseBrand(rest).appearance).toBe('system');
    expect(BrandSchema.safeParse({ ...brandConfig, appearance: 'auto' }).success).toBe(false);
  });
});
