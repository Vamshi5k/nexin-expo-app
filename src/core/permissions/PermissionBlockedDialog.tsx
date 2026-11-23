import { Linking } from 'react-native';

import { Dialog } from '@/ui';

import { usePermissionBlocked } from './blocked.store';
import type { PermissionKind } from './permissions';

/** Copy from docs/screen-audit.md 8.1 (camera text corrected: the camera scans QR codes). */
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

/** Mount once in the root layout. */
export function PermissionBlockedDialog() {
  const kind = usePermissionBlocked((s) => s.kind);
  const close = usePermissionBlocked((s) => s.close);
  const copy = kind ? PERMISSION_COPY[kind] : null;
  return (
    <Dialog
      open={!!copy}
      title={copy?.title ?? ''}
      message={copy?.message}
      confirmLabel="Open Settings"
      cancelLabel="Cancel"
      onConfirm={() => {
        close(true);
        void Linking.openSettings();
      }}
      onCancel={() => close(false)}
    />
  );
}
