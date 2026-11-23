import { parseBrand, type BrandConfig } from '@brand/schema';

import { readExtra } from './extra';

/**
 * The resolved brand config, validated at startup. This is the only way src/
 * reads brand values. Runtime values from /client/info (useClientConfig) win over
 * these for brand name, logo, legal/support URLs, login type and feature flags.
 */
export const brand: BrandConfig = parseBrand(readExtra().brand);

/** Compiled phone validator from brand.phoneRegex. */
export const phonePattern = new RegExp(brand.phoneRegex);

export type { BrandConfig, ConnectorStatus } from '@brand/schema';
