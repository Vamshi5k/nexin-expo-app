import { z } from 'zod';

import { CLIENT_CONFIG_CACHE_VERSION } from '../constants/clientConfig.constants';
import type { ClientConfig } from '../types/clientConfig.types';

const CachedSchema = z.object({
  v: z.literal(CLIENT_CONFIG_CACHE_VERSION),
  config: z.object({
    brandName: z.string().min(1),
    logoUri: z.string().nullable(),
    termsUrl: z.string().nullable(),
    privacyUrl: z.string().nullable(),
    supportUrl: z.string().nullable(),
    loginType: z.enum(['phone', 'email']),
    features: z.object({ fleet: z.boolean(), coupons: z.boolean() }),
    minAppVersion: z.string().nullable(),
  }) satisfies z.ZodType<ClientConfig>,
});

export const toCache = (config: ClientConfig): unknown => ({
  v: CLIENT_CONFIG_CACHE_VERSION,
  config,
});

export const fromCache = (value: unknown): ClientConfig | undefined => {
  const parsed = CachedSchema.safeParse(value);
  return parsed.success ? parsed.data.config : undefined;
};
