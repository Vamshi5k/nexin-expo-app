/**
 * Brand schema: the contract every client's brand/brand.config.ts must satisfy.
 *
 * Template code (src/, app.config.ts) reads brand values only through this
 * schema. To add a new brand-specific value, add it here with a sensible
 * default, then read it via `src/core/config`.
 */
import { z } from 'zod';

import { darkenUntilContrast } from './lib/contrast';

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

const BrandObjectSchema = z.object({
  /** Display name. "(Dev)" / "(Stg)" is appended for non-production builds. */
  appName: z.string().min(1),
  /**
   * App identifier the backend expects in POST /auth/app/verify `appName`. Not the display
   * name. If omitted, appName with whitespace removed (e.g. "Cruze EV" -> "CruzeEV").
   */
  apiAppName: z.string().min(1).optional(),
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
  /**
   * Build-time fallbacks for the legal and support links. Runtime URLs from GET /client/info
   * win; these are used before it has ever loaded (fresh install offline) or if it omits one.
   */
  links: z
    .object({
      terms: z.url().optional(),
      privacy: z.url().optional(),
      support: z.url().optional(),
    })
    .default({}),

  colors: z.object({
    /** The brand colour. Used for derived tints, the neutral grey hue and notification icons. */
    primary: hex,
    primaryLight: hex,
    primaryDark: hex,
    /**
     * Brand colour as a FILL (primary buttons, active tab, selected chips, progress ring).
     * Defaults to `primary`. Text on it (onAccent) is always computed from contrast, so pick
     * a fill where white or dark text reaches 4.5:1 (brand:check warns if not).
     */
    accentFill: hex.optional(),
    /**
     * Optional light-mode overrides. Leave them out to get the template's neutral defaults
     * (DESIGN.md "neutrals by default"): a near-white grey background, white surfaces and
     * neutral hairline borders, all derived from `primary`'s hue.
     */
    background: hex.optional(),
    surface: hex.optional(),
    textPrimary: hex,
    textSecondary: hex,
    textTertiary: hex,
    border: hex.optional(),
    borderLight: hex,
    success: hex,
    warning: hex,
    error: hex,
    /**
     * Brand colour as TEXT or ICONS on light surfaces (links, selected tab label).
     * Must reach 4.5:1 on white and on `background`. If omitted, it is derived by
     * darkening `primary` until it does. Never use `primary` itself as text.
     */
    accentText: hex.optional(),
  }),
  /** OCPP connector status colours. All statuses are required. */
  connectorColors: z.record(z.enum(CONNECTOR_STATUSES), hex),

  /**
   * Colour scheme the app follows. 'system' follows the device setting; 'light' / 'dark'
   * force one. Maps to Expo's userInterfaceStyle (system -> automatic).
   */
  appearance: z.enum(['system', 'light', 'dark']).default('system'),

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
  /** Dialling code shown as a fixed prefix in the phone input. Display only; not sent. */
  phoneCountryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, 'Expected e.g. +91')
    .default('+91'),
  /** Example number shown as the phone input placeholder. */
  phonePlaceholder: z.string().min(1).default('9876543210'),
  /** Example vehicle registration number shown in vehicle forms. */
  regNoPlaceholder: z.string().min(1).default('KA01AB1234'),
  /** GST_SPLIT = CGST + SGST shown separately; SINGLE = one tax line. */
  taxModel: z.enum(['GST_SPLIT', 'SINGLE']).default('GST_SPLIT'),

  /** Money in whole rupees (the unit is in the field name). Convert to paise in src before any arithmetic. */
  minTopUpRupees: z.number().int().positive(),
  quickTopUpRupees: positiveInts,
  quickChargeRupees: positiveInts,
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

/**
 * A grey at least as dark as any derived neutral light background or sunken surface
 * (src/theme/palette.ts). Text that passes on it passes on all of them.
 */
export const DERIVED_LIGHT_SURFACE_FLOOR = '#E8ECEC';

/** The light surfaces accentText must be readable on. */
export function lightSurfaces(colors: { background?: string }): string[] {
  return ['#FFFFFF', colors.background ?? DERIVED_LIGHT_SURFACE_FLOOR];
}

export const BrandSchema = BrandObjectSchema.transform((b) => ({
  ...b,
  apiAppName: b.apiAppName ?? b.appName.replace(/\s+/g, ''),
  colors: {
    ...b.colors,
    accentFill: b.colors.accentFill ?? b.colors.primary,
    accentText:
      b.colors.accentText ?? darkenUntilContrast(b.colors.primary, lightSurfaces(b.colors)),
  },
}));

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
