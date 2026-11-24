import brandConfig from '@brand/brand.config';
import { parseBrand } from '@brand/schema';

import { contrastRatio, ensureContrast } from '@/theme/color';
import {
  AA_TEXT,
  AA_UI,
  buildPalette,
  neutralScale,
  type ColorScheme,
  type Palette,
} from '@/theme/palette';
import { resolveScheme } from '@/theme/ThemeProvider';

const base = parseBrand(brandConfig);

/** Cruze teal plus deliberately awkward brand colours. */
const PRIMARIES = [base.colors.primary, '#FFD400', '#1E3A8A', '#E11D48', '#7C3AED', '#16A34A'];

function brandWith(primary: string) {
  const { accentText, ...colors } = brandConfig.colors;
  void accentText;
  return parseBrand({ ...brandConfig, colors: { ...colors, primary } });
}

function failures(p: Palette): string[] {
  const out: string[] = [];
  const check = (name: string, fg: string, bg: string, min: number) => {
    const r = contrastRatio(fg, bg);
    if (r < min) out.push(`${p.scheme} ${name}: ${fg} on ${bg} = ${r.toFixed(2)} < ${min}`);
  };
  const surfaces = {
    bg: p.bg,
    surface: p.surface,
    surfaceRaised: p.surfaceRaised,
    surfaceSunken: p.surfaceSunken,
  };
  for (const [sName, s] of Object.entries(surfaces)) {
    check(`textPrimary/${sName}`, p.textPrimary, s, AA_TEXT);
    check(`textSecondary/${sName}`, p.textSecondary, s, AA_TEXT);
    check(`textTertiary/${sName}`, p.textTertiary, s, AA_TEXT);
    check(`successText/${sName}`, p.successText, s, AA_TEXT);
    check(`warningText/${sName}`, p.warningText, s, AA_TEXT);
    check(`dangerText/${sName}`, p.dangerText, s, AA_TEXT);
  }
  for (const s of [p.bg, p.surface, p.surfaceRaised, p.accentSoft])
    check('accentText', p.accentText, s, AA_TEXT);
  check('onAccent/accent', p.onAccent, p.accent, AA_TEXT);
  check('onAccent/accentPressed', p.onAccent, p.accentPressed, AA_UI);
  check('onDanger/danger', p.onDanger, p.danger, AA_UI);
  check('successText/successSoft', p.successText, p.successSoft, AA_TEXT);
  check('warningText/warningSoft', p.warningText, p.warningSoft, AA_TEXT);
  check('dangerText/dangerSoft', p.dangerText, p.dangerSoft, AA_TEXT);
  check('accent/bg (UI)', p.accent, p.bg, p.scheme === 'dark' ? AA_UI : 1);
  check('danger/surface (UI)', p.danger, p.surface, AA_UI);
  return out;
}

describe('palette contrast (WCAG AA)', () => {
  const schemes: ColorScheme[] = ['light', 'dark'];
  it.each(schemes)('Cruze EV passes every pair in %s', (scheme) => {
    expect(failures(buildPalette(base, scheme))).toEqual([]);
  });

  it.each(PRIMARIES.flatMap((p) => schemes.map((s) => [p, s] as const)))(
    'primary %s passes every pair in %s',
    (primary, scheme) => {
      expect(failures(buildPalette(brandWith(primary), scheme))).toEqual([]);
    },
  );
});

describe('palette derivation', () => {
  it('uses the brand colour as the accent fill and Cruze accentText as given', () => {
    const p = buildPalette(base, 'light');
    expect(p.accent).toBe(base.colors.primary);
    expect(p.accentText).toBe(base.colors.accentText.toUpperCase());
  });

  it('picks dark text on Cruze teal (DESIGN.md: onAccent #0E2E31)', () => {
    expect(buildPalette(base, 'light').onAccent).toBe('#0E2E31');
  });

  it('recolours accent tokens when only primary changes', () => {
    const a = buildPalette(brandWith('#00C8D0'), 'light');
    const b = buildPalette(brandWith('#E11D48'), 'light');
    for (const k of ['accent', 'accentPressed', 'accentSoft', 'accentText'] as const) {
      expect(a[k]).not.toBe(b[k]);
    }
    expect(a.neutral[500]).not.toBe(b.neutral[500]);
  });

  it('builds a dark palette that is not an inversion', () => {
    const d = buildPalette(base, 'dark');
    expect(contrastRatio(d.bg, '#000000')).toBeLessThan(2);
    expect(d.bg).not.toBe(buildPalette(base, 'light').bg);
  });

  it('builds an 11-step neutral scale from light to dark', () => {
    const n = neutralScale('#00C8D0');
    const steps = Object.values(n);
    expect(steps).toHaveLength(11);
    for (let i = 1; i < steps.length; i++) {
      expect(contrastRatio(steps[i], '#FFFFFF')).toBeGreaterThan(
        contrastRatio(steps[i - 1], '#FFFFFF'),
      );
    }
  });

  it('ensureContrast returns passing colours unchanged', () => {
    expect(ensureContrast('#000000', ['#FFFFFF'], 4.5, 'darken')).toBe('#000000');
  });
});

describe('neutrals by default (DESIGN.md)', () => {
  /** Saturation of a colour, 0 to 1: how far it is from grey. */
  function saturation(hex: string): number {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    return max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  }

  it.each(PRIMARIES)('derives near-grey light surfaces for primary %s', (primary) => {
    const p = buildPalette(brandWith(primary), 'light');
    expect(p.surface).toBe('#FFFFFF');
    for (const k of ['bg', 'surfaceSunken', 'border', 'borderStrong'] as const) {
      expect(saturation(p[k])).toBeLessThan(0.12);
    }
    // Cards must separate from the page.
    expect(p.bg).not.toBe(p.surface);
  });

  it('honours brand overrides for background, surface and border', () => {
    const b = parseBrand({
      ...brandConfig,
      colors: {
        ...brandConfig.colors,
        background: '#F4FBFC',
        surface: '#FEFEFE',
        border: '#C2EBEE',
      },
    });
    const p = buildPalette(b, 'light');
    expect([p.bg, p.surface, p.border]).toEqual(['#F4FBFC', '#FEFEFE', '#C2EBEE']);
    expect(failures(p)).toEqual([]);
  });

  it('ignores light overrides in dark mode', () => {
    const b = parseBrand({
      ...brandConfig,
      colors: { ...brandConfig.colors, background: '#F4FBFC' },
    });
    expect(buildPalette(b, 'dark').bg).toBe(buildPalette(base, 'dark').bg);
  });
});

describe('accentFill', () => {
  it('defaults to primary', () => {
    expect(base.colors.accentFill).toBe(base.colors.primary);
  });

  it('fills the accent and recomputes onAccent from contrast', () => {
    const b = parseBrand({
      ...brandConfig,
      colors: { ...brandConfig.colors, accentFill: '#1E3A8A' },
    });
    const p = buildPalette(b, 'light');
    expect(p.accent).toBe('#1E3A8A');
    expect(p.onAccent).toBe('#FFFFFF');
    expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(AA_TEXT);
    // accentText stays readable on the new accentSoft tint.
    expect(contrastRatio(p.accentText, p.accentSoft)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('keeps dark onAccent on a light fill even when white is close (#0AA5AE)', () => {
    const b = parseBrand({
      ...brandConfig,
      colors: { ...brandConfig.colors, accentFill: '#0AA5AE' },
    });
    const p = buildPalette(b, 'light');
    expect(p.onAccent).toBe('#0E2E31');
    expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe('resolveScheme', () => {
  it('honours override, then appearance, then device', () => {
    expect(resolveScheme('light', 'dark', null)).toBe('light');
    expect(resolveScheme('system', 'dark', null)).toBe('dark');
    expect(resolveScheme('system', null, null)).toBe('light');
    expect(resolveScheme('light', 'light', 'dark')).toBe('dark');
  });
});
