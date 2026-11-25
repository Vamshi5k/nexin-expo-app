import { toFleetUser } from '@/features/fleet/api/fleet.api';

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
