import { useState } from 'react';

import { toast } from '@/shared/utils/toast';

import { useAuth } from './useAuth';
import { LOGOUT_DIALOG_EXIT_MS } from '../constants/auth.constants';

// Confirm first; on "Yes" the dialog fades out, then the session clears and the guard shows Login.
export const useLogoutConfirm = () => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const confirm = () => {
    if (leaving) return;

    setLeaving(true);
    setOpen(false);
    setTimeout(() => {
      logout().catch(() => {
        setLeaving(false);
        toast.error('Could not log out');
      });
    }, LOGOUT_DIALOG_EXIT_MS);
  };

  return {
    open,
    leaving,
    ask: () => setOpen(true),
    cancel: () => setOpen(false),
    confirm,
  };
};
