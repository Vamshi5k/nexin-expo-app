import { Linking } from 'react-native';

import AppDialog from './AppDialog';

import { PERMISSION_COPY, usePermissionBlocked } from '@/core/permissions';

const AppPermissionDialog = () => {
  const kind = usePermissionBlocked(s => s.kind);
  const close = usePermissionBlocked(s => s.close);
  const copy = kind ? PERMISSION_COPY[kind] : null;

  return (
    <AppDialog
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
};

export default AppPermissionDialog;
