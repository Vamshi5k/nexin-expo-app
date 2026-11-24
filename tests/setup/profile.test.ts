import { nameSchema } from '@/features/setup/profile';

describe('nameSchema (screen-audit 2.5)', () => {
  it.each([
    ['', 'Name is required'],
    ['A', 'Name must be at least 2 characters'],
  ])('%p -> "%s"', (name, message) => {
    expect(nameSchema.safeParse(name).error?.issues[0]?.message).toBe(message);
  });

  it('accepts a trimmed name', () => {
    expect(nameSchema.parse('  Asha Rao ')).toBe('Asha Rao');
  });
});
