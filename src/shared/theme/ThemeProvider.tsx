import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { brand } from '@/core/config';

import { buildPalette, type ColorScheme, type Palette } from './palette';
import { layout, motion, radius, space, tabularNums, typography, type TypeVariant } from './tokens';
import type { TextStyle } from 'react-native';

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
  space: typeof space;
  layout: typeof layout;
  radius: typeof radius;
  type: Record<TypeVariant, TextStyle>;
  tabularNums: TextStyle;
  motion: typeof motion;
};

type ThemeContextValue = {
  theme: Theme;
  setSchemeOverride: (scheme: ColorScheme | null) => void;
  schemeOverride: ColorScheme | null;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function buildTheme(scheme: ColorScheme, b = brand): Theme {
  const colors = buildPalette(b, scheme);
  return {
    scheme,
    colors,
    space,
    layout,
    radius,
    type: typography(b.fontFamily),
    tabularNums,
    motion,
  };
}

export function resolveScheme(
  appearance: 'system' | 'light' | 'dark',
  device: string | null | undefined,
  override: ColorScheme | null,
): ColorScheme {
  if (override) return override;
  if (appearance !== 'system') return appearance;
  return device === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const device = useColorScheme();
  const [schemeOverride, setSchemeOverride] = useState<ColorScheme | null>(null);
  const scheme = resolveScheme(brand.appearance, device, schemeOverride);
  const value = useMemo(
    () => ({ theme: buildTheme(scheme), schemeOverride, setSchemeOverride }),
    [scheme, schemeOverride],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeScope({ scheme, children }: { scheme: ColorScheme; children: ReactNode }) {
  const parent = useContext(ThemeContext);
  if (!parent) throw new Error('ThemeScope must be used inside <ThemeProvider>');
  const value = useMemo(() => ({ ...parent, theme: buildTheme(scheme) }), [parent, scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx.theme;
}

export function useSchemeOverride() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useSchemeOverride must be used inside <ThemeProvider>');
  return { schemeOverride: ctx.schemeOverride, setSchemeOverride: ctx.setSchemeOverride };
}
