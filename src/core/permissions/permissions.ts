import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export type PermissionKind = 'location' | 'camera' | 'notifications';
export type PermissionResult = 'granted' | 'denied' | 'blocked';

type ExpoPermission = { granted: boolean; canAskAgain: boolean };

/** blocked = the OS won't show the prompt again (canAskAgain false); only Settings can fix it. */
export function toPermissionResult(p: ExpoPermission): PermissionResult {
  if (p.granted) return 'granted';
  return p.canAskAgain ? 'denied' : 'blocked';
}

const api: Record<
  PermissionKind,
  { check: () => Promise<ExpoPermission>; request: () => Promise<ExpoPermission> }
> = {
  location: {
    check: () => Location.getForegroundPermissionsAsync(),
    request: () => Location.requestForegroundPermissionsAsync(),
  },
  camera: {
    check: () => Camera.getCameraPermissionsAsync(),
    request: () => Camera.requestCameraPermissionsAsync(),
  },
  notifications: {
    check: () => Notifications.getPermissionsAsync(),
    request: () => Notifications.requestPermissionsAsync(),
  },
};

/** Current status without prompting. */
export async function checkPermission(kind: PermissionKind): Promise<PermissionResult> {
  return toPermissionResult(await api[kind].check());
}

/** Prompts if the OS still allows it; returns the resulting status. */
export async function requestPermission(kind: PermissionKind): Promise<PermissionResult> {
  const current = await api[kind].check();
  if (current.granted || !current.canAskAgain) return toPermissionResult(current);
  return toPermissionResult(await api[kind].request());
}
