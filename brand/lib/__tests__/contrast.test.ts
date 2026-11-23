import { contrastRatio, darkenUntilContrast, luminance } from '../contrast';

describe('contrast', () => {
  it('matches WCAG reference values', () => {
    expect(luminance('#FFFFFF')).toBeCloseTo(1);
    expect(luminance('#000000')).toBeCloseTo(0);
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#00C8D0', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#00C8D0'));
  });
});

describe('darkenUntilContrast', () => {
  it('returns a colour that passes AA on every background', () => {
    const bgs = ['#FFFFFF', '#F4FBFC'];
    const derived = darkenUntilContrast('#00C8D0', bgs);
    for (const bg of bgs) expect(contrastRatio(derived, bg)).toBeGreaterThanOrEqual(4.5);
    expect(derived).not.toBe('#000000');
  });

  it('returns the colour unchanged when it already passes', () => {
    expect(darkenUntilContrast('#117A83', ['#FFFFFF'])).toBe('#117A83');
  });
});
