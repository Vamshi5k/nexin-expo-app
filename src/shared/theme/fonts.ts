import { useFonts } from 'expo-font';

import { brand } from '@/core/config';

import { fontFamilies } from './tokens';

const families = fontFamilies(brand.fontFamily);

export const fontSources = {
  [families.Regular]: require('../../../brand/fonts/Regular.otf'),
  [families.Medium]: require('../../../brand/fonts/Medium.otf'),
  [families.SemiBold]: require('../../../brand/fonts/SemiBold.otf'),
  [families.Bold]: require('../../../brand/fonts/Bold.otf'),
};

export function useBrandFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useFonts(fontSources);
  return { loaded, error };
}
