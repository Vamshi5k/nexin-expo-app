import { rupeesToPaise, toTokens, toUser } from '../mappers';

describe('toTokens', () => {
  it('accepts userAccessToken / userRefreshToken', () => {
    expect(toTokens({ userAccessToken: 'a', userRefreshToken: 'r' })).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
  });

  it('accepts accessToken / refreshToken', () => {
    expect(toTokens({ accessToken: 'a', refreshToken: 'r' })).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
  });

  it('prefers the user* names when both are present', () => {
    expect(
      toTokens({
        userAccessToken: 'ua',
        accessToken: 'a',
        userRefreshToken: 'ur',
        refreshToken: 'r',
      }),
    ).toEqual({ accessToken: 'ua', refreshToken: 'ur' });
  });

  it('throws when a token is missing or blank', () => {
    expect(() => toTokens({ accessToken: 'a' })).toThrow(/tokens/);
    expect(() => toTokens({ accessToken: ' ', refreshToken: 'r' })).toThrow(/tokens/);
  });
});

describe('rupeesToPaise', () => {
  it.each([
    [100, 10000],
    ['250.50', 25050],
    [0.1 + 0.2, 30],
    [null, 0],
    [undefined, 0],
    ['abc', 0],
  ])('%p -> %p', (input, expected) => {
    expect(rupeesToPaise(input)).toBe(expected);
  });
});

describe('toUser', () => {
  it('maps user-by-token fields', () => {
    expect(
      toUser({
        id: 12,
        userId: 'U12',
        first_name: 'Asha',
        last_name: null,
        email: 'a@example.com',
        phone: '9876543210',
        isFirstLogin: true,
        wallet: { balance: '1250.75' },
        is_email_verified: false,
        is_phone_verified: true,
        gst: null,
      }),
    ).toEqual({
      id: '12',
      userId: 'U12',
      firstName: 'Asha',
      lastName: '',
      email: 'a@example.com',
      phone: '9876543210',
      isFirstLogin: true,
      walletBalancePaise: 125075,
      isEmailVerified: false,
      isPhoneVerified: true,
      gst: null,
    });
  });

  it('defaults missing flags and wallet', () => {
    const u = toUser({ id: 'x' });
    expect(u.isFirstLogin).toBe(false);
    expect(u.walletBalancePaise).toBe(0);
  });
});
