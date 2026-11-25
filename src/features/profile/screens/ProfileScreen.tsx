import { View } from 'react-native';

import { LayoutGrid, LogOut, ShieldCheck } from 'lucide-react-native';

import {
  AppCard,
  AppLargeTitleScroll,
  AppListGroup,
  AppListRow,
  AppText,
} from '@/shared/components';

import { LogoutDialog } from '@/features/auth';

import { useTheme } from '@/shared/theme';

import { useHome } from '../hooks/useHome';

const HomeScreen = () => {
  const t = useTheme();
  const home = useHome();
  const { logout } = home;

  return (
    <AppLargeTitleScroll title={home.brandName} subtitle="You're signed in">
      <View style={{ gap: t.layout.sectionGapLarge }}>
        <AppCard elevation="elevated" style={{ gap: t.space[1] }}>
          <AppText variant="subhead" tone="secondary">
            Signed in as
          </AppText>
          <AppText variant="title2">{home.name}</AppText>
          {home.phone ? (
            <AppText tone="secondary" tabular>
              {home.phone}
            </AppText>
          ) : null}
          {home.email ? <AppText tone="secondary">{home.email}</AppText> : null}
        </AppCard>
        {home.showDevTools ? (
          <AppListGroup title="Developer">
            <AppListRow icon={LayoutGrid} title="UI kit" onPress={home.openUiKit} />
            <AppListRow
              icon={ShieldCheck}
              iconTone="neutral"
              title="Cookie check"
              onPress={home.openCookieCheck}
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
};

export default HomeScreen;
