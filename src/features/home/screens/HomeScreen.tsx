import { View } from 'react-native';

import { router } from 'expo-router';
import { LayoutGrid, LogOut, ShieldCheck } from 'lucide-react-native';

import {
  AppCard,
  AppLargeTitleScroll,
  AppListGroup,
  AppListRow,
  AppText,
} from '@/shared/components';

import { formatContact, LogoutDialog, useAuth, useLogoutConfirm } from '@/features/auth';
import { useClientConfig } from '@/features/client-config';

import { useTheme } from '@/shared/theme';

import { APP_ENV, brand } from '@/core/config';

export function HomeScreen() {
  const t = useTheme();
  const config = useClientConfig();
  const auth = useAuth();
  const logout = useLogoutConfirm();
  const user = auth.user;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const devTools = APP_ENV !== 'production';

  return (
    <AppLargeTitleScroll title={config.brandName} subtitle="You're signed in">
      <View style={{ gap: t.layout.sectionGapLarge }}>
        <AppCard elevation="elevated" style={{ gap: t.space[1] }}>
          <AppText variant="subhead" tone="secondary">
            Signed in as
          </AppText>
          <AppText variant="title2">{name || 'New user'}</AppText>
          {user?.phone ? (
            <AppText tone="secondary" tabular>
              {formatContact('phone', user.phone, brand.phoneCountryCode)}
            </AppText>
          ) : null}
          {user?.email ? <AppText tone="secondary">{user.email}</AppText> : null}
        </AppCard>
        {devTools ? (
          <AppListGroup title="Developer">
            <AppListRow icon={LayoutGrid} title="UI kit" onPress={() => router.push('/dev/ui')} />
            <AppListRow
              icon={ShieldCheck}
              iconTone="neutral"
              title="Cookie check"
              onPress={() => router.push('/dev/cookie-check')}
            />
          </AppListGroup>
        ) : null}
        <AppListGroup>
          <AppListRow
            icon={LogOut}
            title={logout.leaving ? 'Logging out…' : 'Log out'}
            destructive
            onPress={logout.leaving ? undefined : logout.ask}
          />
        </AppListGroup>
        <LogoutDialog state={logout} />
      </View>
    </AppLargeTitleScroll>
  );
}
