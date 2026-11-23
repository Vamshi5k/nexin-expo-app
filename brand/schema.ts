/**
 * Brand schema: the contract every client's brand/brand.config.ts must satisfy.
 *
 * Template code (src/, app.config.ts) reads brand values only through this
 * schema. To add a new brand-specific value, add it here with a sensible
 * default, then read it via `src/core/config`.
 */
import { z } from 'zod';

const hex = z
  .string()
  .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, 'Expected a #RRGGBB or #RRGGBBAA colour');

const reverseDomain = z
  .string()
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/,
    'Expected reverse-DNS, e.g. com.acme.app',
  );

const domain = z
  .string()
  .regex(/^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/, 'Expected a bare domain, e.g. acme.com');

const positiveInts = z.array(z.number().int().positive()).min(1);

export const CONNECTOR_STATUSES = [
  'Available',
  'Charging',
  'Unavailable',
  'Faulted',
  'Reserved',
  'Unknown',
] as const;
export type ConnectorStatus = (typeof CONNECTOR_STATUSES)[number];

export const BrandSchema = z.object({
  /** Display name. "(Dev)" / "(Stg)" is appended for non-production builds. */
  appName: z.string().min(1),
  /** Expo slug (must match the EAS project). */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** Custom URL scheme for deep links. Non-production builds get a "-dev"/"-staging" suffix. */
  scheme: z.string().regex(/^[a-z][a-z0-9+.-]*$/),
  /** iOS bundle identifier for production. */
  bundleId: reverseDomain,
  /** Android application id for production. */
  androidPackage: reverseDomain,
  /** Primary marketing / web domain, e.g. for share links. */
  webDomain: domain,
  /** Domains for iOS universal links and Android app links. */
  deepLinkDomains: z.array(domain).default([]),
  /** Web page where users request account deletion (opened from Profile). */
  deleteAccountUrl: z.url(),

  colors: z.object({
    primary: hex,
    primaryLight: hex,
    primaryDark: hex,
    background: hex,
    surface: hex,
    textPrimary: hex,
    textSecondary: hex,
    textTertiary: hex,
    border: hex,
    borderLight: hex,
    success: hex,
    warning: hex,
    error: hex,
  }),
  /** OCPP connector status colours. All statuses are required. */
  connectorColors: z.record(z.enum(CONNECTOR_STATUSES), hex),

  /** Android adaptive icon. The foreground image is brand/assets/adaptive-icon.png. */
  adaptiveIcon: z.object({ backgroundColor: hex }).default({ backgroundColor: '#FFFFFF' }),

  /** Splash screen (expo-splash-screen). The image is brand/assets/splash.png (usually the logo). */
  splash: z
    .object({
      /** Rendered width of the splash image in dp. */
      imageWidth: z.number().int().min(50).max(400).default(200),
      backgroundColor: hex.default('#FFFFFF'),
      /** Used when the device is in dark mode; falls back to backgroundColor. */
      darkBackgroundColor: hex.optional(),
    })
    .default({ imageWidth: 200, backgroundColor: '#FFFFFF' }),

  fontFamily: z.string().min(1).default('Inter'),
  /** BCP 47 locale used for number, date and currency formatting. */
  locale: z.string().min(2).default('en-IN'),
  currency: z
    .object({ code: z.string().length(3), symbol: z.string().min(1) })
    .default({ code: 'INR', symbol: '₹' }),

  /** Phone number pattern as a string (it must survive JSON in `extra`); compiled in src. */
  phoneRegex: z
    .string()
    .refine((s) => {
      try {
        new RegExp(s);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid regular expression')
    .default('^[6-9]\\d{9}$'),
  phoneLength: z.number().int().positive().default(10),
  /** GST_SPLIT = CGST + SGST shown separately; SINGLE = one tax line. */
  taxModel: z.enum(['GST_SPLIT', 'SINGLE']).default('GST_SPLIT'),

  /** Money in whole rupees (the unit is in the field name). Convert to paise in src before any arithmetic. */
  minTopUp: z.number().int().positive(),
  quickTopUpAmounts: positiveInts,
  quickChargeAmounts: positiveInts,
  quickChargeKwh: z.array(z.number().positive()).min(1),

  /** Map region shown before the user's location is known. */
  defaultRegion: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    latDelta: z.number().positive(),
    lngDelta: z.number().positive(),
  }),

  /** Build-time fallback only. Runtime flags from GET /client/info win. */
  features: z
    .object({ fleet: z.boolean(), coupons: z.boolean() })
    .default({ fleet: false, coupons: false }),

  /** EAS project id (from `eas init`). Optional until the client's EAS project exists. */
  easProjectId: z.uuid().optional(),
  /** Expo account / organisation that owns the EAS project. */
  owner: z.string().min(1).optional(),
});

/** Brand config as written in brand.config.ts (defaults may be omitted). */
export type BrandConfigInput = z.input<typeof BrandSchema>;
/** Fully resolved brand config (defaults applied). */
export type BrandConfig = z.output<typeof BrandSchema>;

/** Marker for values a new client must fill in. brand:check fails if any remain. */
export const PLACEHOLDER = 'CHANGE_ME';

export function findPlaceholders(value: unknown, path: string[] = []): string[] {
  if (typeof value === 'string') {
    return value.includes(PLACEHOLDER) ? [path.join('.') || '(root)'] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => findPlaceholders(v, [...path, String(i)]));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => findPlaceholders(v, [...path, k]));
  }
  return [];
}

export function parseBrand(input: unknown): BrandConfig {
  const result = BrandSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid brand config:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
