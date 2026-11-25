import { toDriverId, toFleetTokens, toFleetUser } from '@/features/fleet/api/fleet.api';

describe('toFleetUser', () => {
  it('maps ids to strings and drId to driverId', () => {
    expect(
      toFleetUser({ id: 4, fleetId: 2, name: ' Ravi ', phone: '9876543210', drId: 'DR-1' }),
    ).toEqual({
      id: '4',
      fleetId: '2',
      name: 'Ravi',
      phone: '9876543210',
      email: null,
      driverId: 'DR-1',
    });
  });
});

describe('toDriverId', () => {
  it('stringifies the id and rejects a missing one', () => {
    expect(toDriverId({ driverId: 12 })).toBe('12');
    expect(() => toDriverId({ driverId: null })).toThrow(/driver id/);
    expect(() => toDriverId(null)).toThrow(/driver id/);
  });
});

describe('toFleetTokens', () => {
  it('reads tokens at the top level or under data', () => {
    expect(toFleetTokens({ userAccessToken: 'a', userRefreshToken: 'r' })).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
    expect(toFleetTokens({ data: { accessToken: 'a', refreshToken: 'r' } })).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
    expect(() => toFleetTokens({ message: 'ok' })).toThrow(/tokens/);
  });
});
