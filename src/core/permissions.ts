import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';

export type PermissionKind = 'location' | 'camera' | 'notifications';
export type PermissionResult = 'granted' | 'denied' | 'blocked';

type ExpoPermission = { granted: boolean; canAskAgain: boolean };

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

export async function checkPermission(kind: PermissionKind): Promise<PermissionResult> {
  return toPermissionResult(await api[kind].check());
}

export async function requestPermission(kind: PermissionKind): Promise<PermissionResult> {
  const current = await api[kind].check();
  if (current.granted || !current.canAskAgain) return toPermissionResult(current);
  return toPermissionResult(await api[kind].request());
}

type BlockedState = {
  kind: PermissionKind | null;
  resolve: ((openedSettings: boolean) => void) | null;
  show: (kind: PermissionKind) => Promise<boolean>;
  close: (openedSettings: boolean) => void;
};

export const usePermissionBlocked = create<BlockedState>((set, get) => ({
  kind: null,
  resolve: null,
  show: kind =>
    new Promise<boolean>(resolve => {
      get().resolve?.(false); // settle any previous caller
      set({ kind, resolve });
    }),
  close: openedSettings => {
    get().resolve?.(openedSettings);
    set({ kind: null, resolve: null });
  },
}));

export function showPermissionBlocked(kind: PermissionKind): Promise<boolean> {
  return usePermissionBlocked.getState().show(kind);
}

export async function ensurePermission(kind: PermissionKind): Promise<PermissionResult> {
  const result = await requestPermission(kind);
  if (result === 'blocked') await showPermissionBlocked(kind);
  return result;
}

export const PERMISSION_COPY: Record<PermissionKind, { title: string; message: string }> = {
  location: {
    title: 'Location Access Required',
    message: 'Please enable location permission in settings to use this feature.',
  },
  camera: {
    title: 'Camera Access Required',
    message: 'Please enable camera permission in settings to scan QR codes.',
  },
  notifications: {
    title: 'Notifications Required',
    message: 'Please enable notifications in settings to receive important updates.',
  },
};
