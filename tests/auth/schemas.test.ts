import { emailSchema, fleetLoginFormSchema, phoneSchema } from '@/features/auth/utils/contact';

describe('phoneSchema (brand.phoneRegex ^[6-9]\\d{9}$)', () => {
  it.each(['9876543210', '6000000000', ' 7012345678 '])('accepts %p', v => {
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

describe('fleetLoginFormSchema (screen-audit 7.1)', () => {
  const errorFor = (fleetId: string, contact = '9876543210') => {
    const r = fleetLoginFormSchema.safeParse({ fleetId, contact });
    return r.success ? null : r.error.issues[0]?.message;
  };

  it('accepts a Fleet ID of letters, numbers and hyphens, trimmed', () => {
    expect(errorFor('FLT-2024-001')).toBeNull();
    expect(fleetLoginFormSchema.parse({ fleetId: '  FLT1 ', contact: '9876543210' }).fleetId).toBe(
      'FLT1',
    );
  });

  it('uses the old messages for a bad Fleet ID', () => {
    expect(errorFor('')).toBe('Fleet ID is required');
    expect(errorFor('FL1')).toBe('Fleet ID must be at least 4 characters');
    expect(errorFor('FLT_001')).toBe('Fleet ID can only contain letters, numbers, and hyphens');
  });

  it('checks the mobile number with the brand phone rules', () => {
    expect(errorFor('FLT-1', '')).toBe('Mobile number is required');
    expect(errorFor('FLT-1', '5876543210')).toBe('Enter a valid mobile number');
  });
});
