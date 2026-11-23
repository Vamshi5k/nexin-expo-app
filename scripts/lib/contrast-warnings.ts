/** Contrast warnings for brand:check, computed on the palettes the app actually renders. */
import { AA_NORMAL_TEXT, contrastRatio } from '../../brand/lib/contrast';
import type { BrandConfig } from '../../brand/schema';
import { buildPalette } from '../../src/theme/palette';

export function contrastWarnings(brand: BrandConfig): string[] {
  const warnings: string[] = [];
  const { primary, accentFill } = brand.colors;

  for (const scheme of ['light', 'dark'] as const) {
    const p = buildPalette(brand, scheme);
    // accentText is the brand colour as text: it must pass on every surface it sits on.
    for (const [name, bg] of Object.entries({
      bg: p.bg,
      surface: p.surface,
      surfaceRaised: p.surfaceRaised,
      accentSoft: p.accentSoft,
    })) {
      const ratio = contrastRatio(p.accentText, bg);
      if (ratio < AA_NORMAL_TEXT) {
        warnings.push(
          `Low contrast (${scheme}): accentText ${p.accentText} on ${name} ${bg} is ` +
            `${ratio.toFixed(2)}:1, below ${AA_NORMAL_TEXT}:1.`,
        );
      }
    }
    // onAccent is computed (white or dark text, whichever reads better) on the accent fill.
    const onAccent = contrastRatio(p.onAccent, p.accent);
    if (onAccent < AA_NORMAL_TEXT) {
      warnings.push(
        `Low contrast (${scheme}): onAccent ${p.onAccent} on accentFill ${p.accent} is ` +
          `${onAccent.toFixed(2)}:1, below ${AA_NORMAL_TEXT}:1. Pick an accentFill where white ` +
          `or dark text passes${accentFill === primary ? ' (accentFill defaults to primary)' : ''}.`,
      );
    }
  }
  return warnings;
}
