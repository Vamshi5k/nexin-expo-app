import brandConfig from '@brand/brand.config';
import { parseBrand } from '@brand/schema';
import { contrastWarnings } from '../../scripts/lib/contrast-warnings';

function withColors(colors: Record<string, string>) {
  return parseBrand({ ...brandConfig, colors: { ...brandConfig.colors, ...colors } });
}

describe('contrastWarnings', () => {
  it('passes Cruze EV (teal fill, dark onAccent at 7:1)', () => {
    expect(contrastWarnings(parseBrand(brandConfig))).toEqual([]);
  });

  it('passes #0AA5AE because the computed onAccent is dark text (4.8:1), not white (3.0:1)', () => {
    expect(contrastWarnings(withColors({ accentFill: '#0AA5AE' }))).toEqual([]);
  });

  it('warns when neither white nor dark text reaches 4.5:1 on accentFill', () => {
    const warnings = contrastWarnings(withColors({ accentFill: '#E53935' }));
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toMatch(/\(light\): onAccent #FFFFFF on accentFill #E53935 is 4\.23:1/);
  });
});
