import { useState } from 'react';
import { Linking } from 'react-native';

import { openLegal, useAuth } from '@/features/auth';
import { useClientConfig } from '@/features/client-config';

import { getErrorMessage } from '@/core/api';
import { brand } from '@/core/config';
import { log } from '@/core/log';
import { useAction } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { profileApi } from '../api/profile.api';
import { DELETE_ACCOUNT_API_ENABLED, DELETE_COPY } from '../constants/profile.constants';
import { deletionPath } from '../utils/profile';

// The one place that decides how an account gets deleted, so switching to DELETE /profile
// later only touches the 'api' branch.
export const useDeleteAccount = () => {
  const config = useClientConfig();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const remove = useAction(profileApi.deleteAccount);

  const path = deletionPath({
    apiEnabled: DELETE_ACCOUNT_API_ENABLED,
    deleteAccountUrl: brand.deleteAccountUrl,
    supportUrl: config.links.support,
    supportEmail: config.contact.email,
  });

  const contactSupport = async (url: string | null, email: string | null) => {
    if (url) return openLegal(url);
    if (!email) {
      toast.error(DELETE_COPY.unavailable);
      return;
    }
    const mail = `mailto:${email}?subject=${encodeURIComponent(DELETE_COPY.supportSubject)}`;
    await Linking.openURL(mail).catch((error: unknown) => {
      log.warn('could not open mail app', { error: String(error) });
      toast.error(DELETE_COPY.unavailable);
    });
  };

  const confirm = async () => {
    if (remove.isPending) return;

    if (path.kind === 'web') {
      setOpen(false);
      await openLegal(path.url);
      return;
    }
    if (path.kind === 'support') {
      setOpen(false);
      await contactSupport(path.url, path.email);
      return;
    }

    // TODO(backend): re-verify with an OTP to the user's phone before this (OPEN_QUESTIONS #19).
    try {
      await remove.run();
      setOpen(false);
      await logout();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
    open,
    ask: () => setOpen(true),
    cancel: () => setOpen(false),
    confirm: () => void confirm(),
    deleting: remove.isPending,
    message: path.kind === 'support' ? DELETE_COPY.support : DELETE_COPY.web,
    confirmLabel: path.kind === 'support' ? DELETE_COPY.contactSupport : DELETE_COPY.continue,
  };
};
