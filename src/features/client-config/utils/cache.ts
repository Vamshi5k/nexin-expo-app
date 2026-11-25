import { z } from 'zod';

import { CLIENT_CONFIG_CACHE_VERSION } from '../constants/clientConfig.constants';
import type { ClientConfig } from '../types/clientConfig.types';

const nullableText = z.string().nullable();

const CachedSchema = z.object({
  v: z.literal(CLIENT_CONFIG_CACHE_VERSION),
  config: z.object({
    clientId: nullableText,
    brandName: z.string().min(1),
    logoUri: nullableText,
    company: z.object({ name: nullableText, gst: nullableText }),
    contact: z.object({
      email: nullableText,
      phone: nullableText,
      address: nullableText,
      state: nullableText,
    }),
    links: z.object({
      terms: nullableText,
      privacy: nullableText,
      refund: nullableText,
      shipping: nullableText,
      support: nullableText,
      website: nullableText,
      userPortal: nullableText,
    }),
    loginType: z.enum(['phone', 'email']),
    features: z.object({ fleet: z.boolean(), coupons: z.boolean() }),
    minAppVersion: nullableText,
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
