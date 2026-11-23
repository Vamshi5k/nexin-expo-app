import { showPermissionBlocked } from './blocked.store';
import { requestPermission, type PermissionKind, type PermissionResult } from './permissions';

/** Request; if blocked, show the Open Settings dialog. Callers always get a settled result. */
export async function ensurePermission(kind: PermissionKind): Promise<PermissionResult> {
  const result = await requestPermission(kind);
  if (result === 'blocked') await showPermissionBlocked(kind);
  return result;
}
