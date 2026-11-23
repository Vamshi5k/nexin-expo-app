/** Layout, shape and type tokens from docs/DESIGN.md. Brand-independent except the font family. */
import { Platform, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

/** 4 pt grid. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const layout = {
  screenPadding: 20,
  sectionGap: 24,
  sectionGapLarge: 32,
  cardPadding: 16,
  buttonHeight: 52,
  inputHeight: 52,
  minTouch: 44,
  hairline: StyleSheet.hairlineWidth,
  /** Layouts must survive font scaling up to this factor. */
  maxFontScale: 1.3,
} as const;

export const radius = {
  control: 12,
  card: 16,
  sheet: 28,
  pill: 999,
} as const;

export const FONT_WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold'] as const;
export type FontWeightName = (typeof FONT_WEIGHTS)[number];

/** Registered font family names, e.g. "Inter-SemiBold". Loaded in the root layout. */
export function fontFamilies(family: string): Record<FontWeightName, string> {
  return Object.fromEntries(FONT_WEIGHTS.map((w) => [w, `${family}-${w}`])) as Record<
    FontWeightName,
    string
  >;
}

export type TypeVariant =
  'display' | 'title1' | 'title2' | 'headline' | 'body' | 'callout' | 'subhead' | 'caption';

type TypeSpec = { size: number; line: number; weight: FontWeightName; tracking?: number };

/** DESIGN.md type scale. Slight negative letter-spacing at 22 and above. */
export const TYPE_SCALE: Record<TypeVariant, TypeSpec> = {
  display: { size: 34, line: 40, weight: 'SemiBold', tracking: -0.5 },
  title1: { size: 28, line: 34, weight: 'SemiBold', tracking: -0.4 },
  title2: { size: 22, line: 28, weight: 'SemiBold', tracking: -0.25 },
  headline: { size: 17, line: 24, weight: 'SemiBold' },
  body: { size: 16, line: 24, weight: 'Regular' },
  callout: { size: 15, line: 20, weight: 'Regular' },
  subhead: { size: 14, line: 20, weight: 'Medium' },
  caption: { size: 12, line: 16, weight: 'Medium' },
};

export function typography(family: string): Record<TypeVariant, TextStyle> {
  const fonts = fontFamilies(family);
  return Object.fromEntries(
    Object.entries(TYPE_SCALE).map(([variant, t]) => [
      variant,
      {
        fontFamily: fonts[t.weight],
        fontSize: t.size,
        lineHeight: t.line,
        letterSpacing: t.tracking ?? 0,
      } satisfies TextStyle,
    ]),
  ) as Record<TypeVariant, TextStyle>;
}

/** Tabular figures so live numbers (₹, kWh, %, timers) don't jitter. */
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

/** The one soft shadow level for floating items (FAB, map search, sheets). */
export function floatingShadow(shadowColor: string): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: { shadowColor, shadowOpacity: 1, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
    default: { boxShadow: `0px 4px 16px ${shadowColor}` },
  });
}

export const motion = {
  spring: { damping: 20, stiffness: 220, mass: 1 },
  durationFast: 200,
  duration: 260,
  pressedScale: 0.98,
  pressedOpacity: 0.7,
} as const;
