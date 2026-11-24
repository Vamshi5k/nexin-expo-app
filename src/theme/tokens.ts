import { Platform, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

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
  maxFontScale: 1.3,
  // Auth top bar; the splash logo docks into its logo slot.
  topBarHeight: 56,
  logoHeight: 28,
} as const;

export const radius = {
  control: 14,
  card: 20,
  sheet: 28,
  pill: 999,
} as const;

export const FONT_WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold'] as const;
export type FontWeightName = (typeof FONT_WEIGHTS)[number];

export function fontFamilies(family: string): Record<FontWeightName, string> {
  return Object.fromEntries(FONT_WEIGHTS.map((w) => [w, `${family}-${w}`])) as Record<
    FontWeightName,
    string
  >;
}

export type TypeVariant =
  | 'hero'
  | 'display'
  | 'title1'
  | 'title2'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'caption';

type TypeSpec = { size: number; line: number; weight: FontWeightName; tracking?: number };

export const TYPE_SCALE: Record<TypeVariant, TypeSpec> = {
  hero: { size: 30, line: 36, weight: 'SemiBold', tracking: -0.8 },
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

export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

export function floatingShadow(shadowColor: string): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: { shadowColor, shadowOpacity: 1, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
    default: { boxShadow: `0px 4px 16px ${shadowColor}` },
  });
}

export const motion = {
  spring: { damping: 20, stiffness: 220, mass: 1 },
  springSnappy: { damping: 16, stiffness: 320, mass: 0.8 },
  durationFast: 200,
  duration: 260,
  durationSlow: 520,
  stagger: 70,
  pressedScale: 0.97,
  pressedOpacity: 0.7,
} as const;
