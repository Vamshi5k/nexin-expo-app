import { emailSchema, phoneSchema } from '@/features/auth/utils';

describe('phoneSchema (brand.phoneRegex ^[6-9]\\d{9}$)', () => {
  it.each(['9876543210', '6000000000', ' 7012345678 '])('accepts %p', (v) => {
    expect(phoneSchema.safeParse(v).success).toBe(true);
  });

  it.each([
    ['', 'Mobile number is required'],
    ['5876543210', 'Enter a valid mobile number'],
    ['98765', 'Enter a 10-digit mobile number'],
    ['98765abcde', 'Enter a valid mobile number'],
  ])('rejects %p with "%s"', (v, message) => {
    const r = phoneSchema.safeParse(v);
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe(message);
  });
});

describe('emailSchema', () => {
  it('accepts a normal address', () => {
    expect(emailSchema.safeParse('name@example.com').success).toBe(true);
  });

  it('uses the screen-audit deviation copy', () => {
    expect(emailSchema.safeParse('name@').error?.issues[0]?.message).toBe(
      'Enter a valid email address',
    );
    expect(emailSchema.safeParse('').error?.issues[0]?.message).toBe('Email is required');
  });
});
