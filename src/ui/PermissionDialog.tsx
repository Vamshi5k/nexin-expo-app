import { Linking } from 'react-native';

import { PERMISSION_COPY, usePermissionBlocked } from '@/core/permissions';

import { Dialog } from './Dialog';

export function PermissionDialog() {
  const kind = usePermissionBlocked(s => s.kind);
  const close = usePermissionBlocked(s => s.close);
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
