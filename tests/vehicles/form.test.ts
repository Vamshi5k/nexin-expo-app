import {
  customCapacitySchema,
  detailsSchema,
  formatCapacity,
  matchesQuery,
} from '@/features/vehicles/utils/form';

const firstError = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.error?.issues[0]?.message;

describe('detailsSchema (screen-audit 2.6)', () => {
  const valid = { regNo: 'KA01AB1234', macId: '', maxAmount: '' };

  it('accepts a registration number with the optional fields empty', () => {
    expect(detailsSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ['', 'Registration number is required'],
    ['KA01', 'Invalid registration number'],
  ])('regNo %p -> "%s"', (regNo, message) => {
    expect(firstError(detailsSchema.safeParse({ ...valid, regNo }))).toBe(message);
  });

  it('MAC ID: optional, 6 to 17 characters (the old app capped it at 12)', () => {
    expect(detailsSchema.safeParse({ ...valid, macId: 'AA:BB:CC:DD:EE:FF' }).success).toBe(true);
    expect(firstError(detailsSchema.safeParse({ ...valid, macId: 'AA:BB' }))).toBe(
      'Invalid MAC ID',
    );
    expect(firstError(detailsSchema.safeParse({ ...valid, macId: 'AA:BB:CC:DD:EE:FF:00' }))).toBe(
      'Invalid MAC ID',
    );
  });

  it('max amount: optional whole number', () => {
    expect(detailsSchema.safeParse({ ...valid, maxAmount: '500' }).success).toBe(true);
    expect(firstError(detailsSchema.safeParse({ ...valid, maxAmount: '50.5' }))).toBe(
      'Must be a valid number',
    );
  });
});

describe('customCapacitySchema (10 to 500 kWh)', () => {
  it.each([
    ['', 'Capacity is required'],
    ['abc', 'Must be a valid number'],
    ['9', 'Minimum 10 kWh'],
    ['501', 'Maximum 500 kWh'],
  ])('%p -> "%s"', (raw, message) => {
    expect(firstError(customCapacitySchema.safeParse(raw))).toBe(message);
  });

  it('parses a valid value to a number', () => {
    expect(customCapacitySchema.parse(' 40.5 ')).toBe(40.5);
  });
});

it('formatCapacity', () => {
  expect(formatCapacity(40)).toBe('40 kWh');
  expect(formatCapacity(40.55)).toBe('40.5 kWh');
});

it('matchesQuery: case-insensitive, empty query matches all', () => {
  expect(matchesQuery('Windsor EV', ' winD ')).toBe(true);
  expect(matchesQuery('ZS EV', 'comet')).toBe(false);
  expect(matchesQuery('ZS EV', '')).toBe(true);
});
