import {
  usePermissionBlocked,
  ensurePermission,
  checkPermission,
  requestPermission,
  toPermissionResult,
} from '@/core/permissions';

const perm = (granted: boolean, canAskAgain: boolean) => ({
  granted,
  canAskAgain,
  status: 'x',
  expires: 'never',
});

const mockLocation = { check: jest.fn(), request: jest.fn() };
// the blocked dialog lives in the same module; keep the UI kit out of this test
jest.mock('@/shared/components', () => ({ Dialog: () => null }));
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: () => mockLocation.check(),
  requestForegroundPermissionsAsync: () => mockLocation.request(),
}));
jest.mock('expo-camera', () => ({
  Camera: { getCameraPermissionsAsync: jest.fn(), requestCameraPermissionsAsync: jest.fn() },
}));
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

beforeEach(() => {
  mockLocation.check.mockReset();
  mockLocation.request.mockReset();
  usePermissionBlocked.setState({ kind: null, resolve: null });
});

describe('toPermissionResult', () => {
  it('maps granted / denied / blocked', () => {
    expect(toPermissionResult(perm(true, true))).toBe('granted');
    expect(toPermissionResult(perm(false, true))).toBe('denied');
    expect(toPermissionResult(perm(false, false))).toBe('blocked');
  });
});

describe('request / check', () => {
  it('prompts only when the OS still allows it', async () => {
    mockLocation.check.mockResolvedValue(perm(false, true));
    mockLocation.request.mockResolvedValue(perm(true, true));
    expect(await requestPermission('location')).toBe('granted');
    expect(mockLocation.request).toHaveBeenCalledTimes(1);
  });

  it('returns blocked without prompting', async () => {
    mockLocation.check.mockResolvedValue(perm(false, false));
    expect(await requestPermission('location')).toBe('blocked');
    expect(mockLocation.request).not.toHaveBeenCalled();
    expect(await checkPermission('location')).toBe('blocked');
  });
});

describe('ensurePermission', () => {
  it('shows the blocked dialog and always settles', async () => {
    mockLocation.check.mockResolvedValue(perm(false, false));
    const pending = ensurePermission('location');
    await new Promise(r => setTimeout(r, 0));
    expect(usePermissionBlocked.getState().kind).toBe('location');
    usePermissionBlocked.getState().close(false);
    await expect(pending).resolves.toBe('blocked');
    expect(usePermissionBlocked.getState().kind).toBeNull();
  });

  it('a second dialog settles the first caller instead of leaving it pending', async () => {
    const first = usePermissionBlocked.getState().show('camera');
    const second = usePermissionBlocked.getState().show('location');
    await expect(first).resolves.toBe(false);
    usePermissionBlocked.getState().close(true);
    await expect(second).resolves.toBe(true);
  });
});
