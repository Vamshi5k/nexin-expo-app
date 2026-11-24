import { isDevToolsEnabled } from '@/dev/devTools';

describe('isDevToolsEnabled', () => {
  it('is off only in production', () => {
    expect(isDevToolsEnabled('development')).toBe(true);
    expect(isDevToolsEnabled('staging')).toBe(true);
    expect(isDevToolsEnabled('production')).toBe(false);
  });
});
