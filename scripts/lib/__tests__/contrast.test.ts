import { contrastRatio, luminance } from '../contrast';

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
