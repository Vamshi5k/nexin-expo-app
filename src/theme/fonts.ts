import { useFonts } from 'expo-font';

import { brand } from '@/core/config';

import { fontFamilies } from './tokens';

/**
 * Brand font files live in brand/fonts/ under fixed weight names so the requires stay
 * static; the family name comes from brand.fontFamily (e.g. "Inter-SemiBold").
 */
const families = fontFamilies(brand.fontFamily);

export const fontSources = {
  [families.Regular]: require('../../brand/fonts/Regular.otf'),
  [families.Medium]: require('../../brand/fonts/Medium.otf'),
  [families.SemiBold]: require('../../brand/fonts/SemiBold.otf'),
  [families.Bold]: require('../../brand/fonts/Bold.otf'),
};

/** Loads the brand font. The root layout keeps the splash up until this resolves. */
export function useBrandFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useFonts(fontSources);
  return { loaded, error };
}
