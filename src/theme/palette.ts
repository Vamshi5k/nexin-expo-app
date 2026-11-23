/**
 * Semantic palette derived from the brand (docs/DESIGN.md "Colour").
 * Components use these tokens only; no raw hex outside src/theme and brand/.
 */
import type { BrandConfig, ConnectorStatus } from '@brand/schema';

import { ensureContrast, hslToHex, hue, mix, readableOn, withAlpha } from './color';

export type ColorScheme = 'light' | 'dark';

export const NEUTRAL_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type NeutralStep = (typeof NEUTRAL_STEPS)[number];

export type Palette = {
  scheme: ColorScheme;
  bg: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  /** Brand colour as a FILL: buttons, active tab, selected chips, progress ring, map pins. */
  accent: string;
  accentPressed: string;
  /** Tinted background for accent icons, chips and selected rows. */
  accentSoft: string;
  /** Brand colour as TEXT or ICONS on bg / surface / accentSoft. */
  accentText: string;
  /** Text and icons on an accent fill. */
  onAccent: string;
  success: string;
  successSoft: string;
  successText: string;
  warning: string;
  warningSoft: string;
  warningText: string;
  danger: string;
  dangerSoft: string;
  dangerText: string;
  onDanger: string;
  connector: Record<ConnectorStatus, string>;
  neutral: Record<NeutralStep, string>;
  overlay: string;
  shadow: string;
  skeleton: string;
  skeletonHighlight: string;
};

/** WCAG AA thresholds (DESIGN.md: 4.5 body text, 3 large text, icons and UI parts). */
export const AA_TEXT = 4.5;
export const AA_UI = 3;

const LIGHTNESS: Record<NeutralStep, number> = {
  50: 0.975,
  100: 0.955,
  200: 0.91,
  300: 0.84,
  400: 0.66,
  500: 0.5,
  600: 0.4,
  700: 0.3,
  800: 0.21,
  900: 0.14,
  950: 0.09,
};

/** Neutral grey scale slightly tinted towards the brand hue. */
export function neutralScale(primary: string): Record<NeutralStep, string> {
  const h = hue(primary);
  return Object.fromEntries(
    NEUTRAL_STEPS.map((step) => [step, hslToHex(h, step >= 700 ? 0.14 : 0.1, LIGHTNESS[step])]),
  ) as Record<NeutralStep, string>;
}

/**
 * Text colour on a filled control: dark text or white, whichever reads better. If dark text
 * still misses AA it is pushed darker; white cannot be improved (brand:check warns).
 */
function onFill(fill: string, darkText: string): string {
  const pick = readableOn(fill, darkText);
  return pick === '#FFFFFF' ? pick : ensureContrast(pick, [fill], AA_TEXT, 'darken');
}

type StatusTokens = { base: string; soft: string; text: string };

function status(
  color: string,
  surfaces: string[],
  surface: string,
  scheme: ColorScheme,
): StatusTokens {
  const dir = scheme === 'light' ? 'darken' : 'lighten';
  const base = ensureContrast(color, surfaces, AA_UI, dir);
  const soft = mix(surface, base, scheme === 'light' ? 0.12 : 0.2);
  const text = ensureContrast(base, [...surfaces, soft], AA_TEXT, dir);
  return { base, soft, text };
}

export function buildPalette(brand: BrandConfig, scheme: ColorScheme): Palette {
  const c = brand.colors;
  const neutral = neutralScale(c.primary);
  const light = scheme === 'light';
  const dir = light ? 'darken' : 'lighten';

  const bg = light ? c.background : neutral[950];
  const surface = light ? c.surface : neutral[900];
  const surfaceRaised = light ? c.surface : neutral[800];
  const surfaceSunken = light
    ? mix(c.background, neutral[200], 0.5)
    : mix(neutral[950], '#000000', 0.4);
  const surfaces = [bg, surface, surfaceRaised, surfaceSunken];

  const accent = light ? c.primary : ensureContrast(c.primary, [bg, surface], AA_UI, 'lighten');
  const accentSoft = mix(surface, accent, light ? 0.12 : 0.22);
  const accentText = light
    ? ensureContrast(c.accentText, [bg, surface, surfaceRaised, accentSoft], AA_TEXT, 'darken')
    : ensureContrast(accent, [bg, surface, surfaceRaised, accentSoft], AA_TEXT, 'lighten');

  const textPrimary = light ? c.textPrimary : neutral[50];
  // Text on fills always chooses between white and a genuinely dark colour, in both schemes.
  const darkText = light ? c.textPrimary : neutral[950];
  const onAccent = onFill(accent, darkText);

  const success = status(c.success, surfaces, surface, scheme);
  const warning = status(c.warning, surfaces, surface, scheme);
  const danger = status(c.error, surfaces, surface, scheme);

  return {
    scheme,
    bg,
    surface,
    surfaceRaised,
    surfaceSunken,
    border: light ? c.border : neutral[700],
    borderStrong: light ? mix(c.border, c.textTertiary, 0.5) : neutral[600],
    textPrimary: ensureContrast(textPrimary, surfaces, AA_TEXT, dir),
    textSecondary: ensureContrast(light ? c.textSecondary : neutral[300], surfaces, AA_TEXT, dir),
    textTertiary: ensureContrast(light ? c.textTertiary : neutral[400], surfaces, AA_TEXT, dir),
    accent,
    accentPressed: mix(accent, light ? '#000000' : '#FFFFFF', 0.12),
    accentSoft,
    accentText,
    onAccent,
    success: success.base,
    successSoft: success.soft,
    successText: success.text,
    warning: warning.base,
    warningSoft: warning.soft,
    warningText: warning.text,
    danger: danger.base,
    dangerSoft: danger.soft,
    dangerText: danger.text,
    onDanger: onFill(danger.base, darkText),
    connector: brand.connectorColors,
    neutral,
    overlay: withAlpha(neutral[950], light ? 0.45 : 0.6),
    shadow: light ? withAlpha(neutral[950], 0.08) : withAlpha('#000000', 0.5),
    skeleton: light ? mix(surface, neutral[300], 0.45) : neutral[800],
    skeletonHighlight: light ? mix(surface, neutral[300], 0.15) : neutral[700],
  };
}
