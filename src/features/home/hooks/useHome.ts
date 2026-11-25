import { router } from 'expo-router';

import { formatContact, useAuth, useLogoutConfirm } from '@/features/auth';
import { useClientConfig } from '@/features/client-config';
import { isDevToolsEnabled } from '@/features/dev';

import { APP_ENV, brand } from '@/core/config';

export const useHome = () => {
  const config = useClientConfig();
  const { user } = useAuth();
  const logout = useLogoutConfirm();

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  return {
    brandName: config.brandName,
    name: name || 'New user',
    phone: user?.phone ? formatContact('phone', user.phone, brand.phoneCountryCode) : null,
    email: user?.email ?? null,
    showDevTools: isDevToolsEnabled(APP_ENV),
    openUiKit: () => router.push('/dev/ui'),
    openCookieCheck: () => router.push('/dev/cookie-check'),
    logout,
  };
};
