import { LogOut } from 'lucide-react-native';

import { AppDialog } from '@/shared/components';

import { LOGOUT_COPY } from '../constants/auth.constants';
import type { useLogoutConfirm } from '../hooks/useLogoutConfirm';

type LogoutDialogProps = { state: ReturnType<typeof useLogoutConfirm> };

const LogoutDialog = ({ state }: LogoutDialogProps) => {
  return (
    <AppDialog
      open={state.open}
      icon={LogOut}
      destructive
      title={LOGOUT_COPY.title}
      message={LOGOUT_COPY.message}
      confirmLabel={LOGOUT_COPY.confirm}
      cancelLabel={LOGOUT_COPY.cancel}
      onConfirm={state.confirm}
      onCancel={state.cancel}
    />
  );
};

export default LogoutDialog;
