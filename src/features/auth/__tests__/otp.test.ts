import { formatContact, otpCells, sanitizeOtp } from '../otp';

describe('sanitizeOtp', () => {
  it('keeps digits only, up to length', () => {
    expect(sanitizeOtp('12a3', 4)).toBe('123');
    expect(sanitizeOtp('123456', 4)).toBe('1234');
  });

  it('extracts a pasted or autofilled code', () => {
    expect(sanitizeOtp('Your code is 4821.', 4)).toBe('4821');
    expect(sanitizeOtp(' 4 8 2 1 ', 4)).toBe('4821');
  });

  it('supports other lengths (fleet)', () => {
    expect(sanitizeOtp('123456', 6)).toBe('123456');
  });
});

describe('otpCells', () => {
  it('marks filled, active and empty boxes', () => {
    expect(otpCells('12', 4).map((c) => c.state)).toEqual(['filled', 'filled', 'active', 'empty']);
    expect(otpCells('12', 4).map((c) => c.digit)).toEqual(['1', '2', '', '']);
  });

  it('has no active box when complete', () => {
    expect(otpCells('1234', 4).map((c) => c.state)).toEqual(['filled', 'filled', 'filled', 'filled']);
  });
});

describe('formatContact', () => {
  it('groups a phone number after the country code', () => {
    expect(formatContact('phone', '9876543210', '+91')).toBe('+91 98765 43210');
  });
  it('leaves email unchanged', () => {
    expect(formatContact('email', 'a@b.co', '+91')).toBe('a@b.co');
  });
});
