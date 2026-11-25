import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { TextStyle } from 'react-native';

import { brand } from '@/core/config';

import { buildPalette, type ColorScheme, type Palette } from './palette';
import { layout, motion, radius, space, tabularNums, typography, type TypeVariant } from './tokens';

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

type ThemeContextType = {
  theme: Theme;
  setSchemeOverride: (scheme: ColorScheme | null) => void;
  schemeOverride: ColorScheme | null;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const device = useColorScheme();
  const [schemeOverride, setSchemeOverride] = useState<ColorScheme | null>(null);
  const scheme = resolveScheme(brand.appearance, device, schemeOverride);

  const value = useMemo<ThemeContextType>(
    () => ({ theme: buildTheme(scheme), schemeOverride, setSchemeOverride }),
    [scheme, schemeOverride],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

type ThemeScopeProps = {
  scheme: ColorScheme;
  children: ReactNode;
};

export const ThemeScope = ({ scheme, children }: ThemeScopeProps) => {
  const parent = useContext(ThemeContext);
  if (!parent) {
    throw new Error('ThemeScope must be used inside <ThemeProvider>');
  }

  const value = useMemo<ThemeContextType>(
    () => ({ ...parent, theme: buildTheme(scheme) }),
    [parent, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context.theme;
};

export const useSchemeOverride = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSchemeOverride must be used inside ThemeProvider');
  }
  return { schemeOverride: context.schemeOverride, setSchemeOverride: context.setSchemeOverride };
};
