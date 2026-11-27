import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import type { TextStyle } from 'react-native';

import { brand } from '@/core/config';
import { KV_KEYS, kv } from '@/core/storage';

import { buildPalette, type ColorScheme, type Palette } from './palette';
import {
  icon,
  layout,
  motion,
  radius,
  space,
  tabularNums,
  typography,
  type TypeVariant,
} from './tokens';

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
  space: typeof space;
  layout: typeof layout;
  radius: typeof radius;
  icon: typeof icon;
  type: Record<TypeVariant, TextStyle>;
  tabularNums: TextStyle;
  motion: typeof motion;
};

export type AppearancePreference = 'system' | 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setSchemeOverride: (scheme: ColorScheme | null) => void;
  schemeOverride: ColorScheme | null;
  appearance: AppearancePreference;
  setAppearance: (appearance: AppearancePreference) => void;
};

const APPEARANCES: AppearancePreference[] = ['system', 'light', 'dark'];

// The driver's saved choice, else the brand's default.
const readAppearance = (): AppearancePreference => {
  const saved = kv.getString(KV_KEYS.appearance);
  return APPEARANCES.includes(saved as AppearancePreference)
    ? (saved as AppearancePreference)
    : brand.appearance;
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
    icon,
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
  const [appearance, setAppearanceState] = useState<AppearancePreference>(readAppearance);
  const scheme = resolveScheme(appearance, device, schemeOverride);

  // Native parts (switches, keyboard, alerts) follow the same choice; "system" hands it back.
  useEffect(() => {
    Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
  }, [appearance]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: buildTheme(scheme),
      schemeOverride,
      setSchemeOverride,
      appearance,
      setAppearance: (next: AppearancePreference) => {
        kv.setString(KV_KEYS.appearance, next);
        setAppearanceState(next);
      },
    }),
    [scheme, schemeOverride, appearance],
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

export const useAppearance = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppearance must be used inside ThemeProvider');
  }
  return { appearance: context.appearance, setAppearance: context.setAppearance };
};
