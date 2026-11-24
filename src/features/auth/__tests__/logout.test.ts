import { serverLogout } from '../hooks';

jest.mock('@/core/log');
jest.mock('@/features/client-config', () => ({ primeClientConfig: jest.fn() }));
jest.mock('@/features/fleet', () => ({ fleetLogout: jest.fn(async () => undefined) }));
jest.mock('../api', () => ({ logout: jest.fn(async () => undefined) }));

const { fleetLogout } = jest.requireMock('@/features/fleet') as { fleetLogout: jest.Mock };
const { logout } = jest.requireMock('../api') as { logout: jest.Mock };

describe('serverLogout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('consumer -> POST /auth/logout', async () => {
    await serverLogout('consumer');
    expect(logout).toHaveBeenCalledTimes(1);
    expect(fleetLogout).not.toHaveBeenCalled();
  });

  it('fleet -> GET /fleet/logout (BLUEPRINT)', async () => {
    await serverLogout('fleet');
    expect(fleetLogout).toHaveBeenCalledTimes(1);
    expect(logout).not.toHaveBeenCalled();
  });

  it('no session -> no request', async () => {
    await serverLogout('none');
    expect(logout).not.toHaveBeenCalled();
    expect(fleetLogout).not.toHaveBeenCalled();
  });
});
