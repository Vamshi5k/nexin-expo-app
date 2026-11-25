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

import { useProfile } from '../hooks/useProfile';

const ProfileScreen = () => {
  const t = useTheme();
  const profile = useProfile();
  const { logout } = profile;

  return (
    <AppLargeTitleScroll title="Profile" subtitle={profile.brandName}>
      <View style={{ gap: t.layout.sectionGapLarge }}>
        <AppCard elevation="elevated" style={{ gap: t.space[1] }}>
          <AppText variant="subhead" tone="secondary">
            Signed in as
          </AppText>
          <AppText variant="title2">{profile.name}</AppText>
          {profile.phone ? (
            <AppText tone="secondary" tabular>
              {profile.phone}
            </AppText>
          ) : null}
          {profile.email ? <AppText tone="secondary">{profile.email}</AppText> : null}
        </AppCard>
        {profile.showDevTools ? (
          <AppListGroup title="Developer">
            <AppListRow icon={LayoutGrid} title="UI kit" onPress={profile.openUiKit} />
            <AppListRow
              icon={ShieldCheck}
              iconTone="neutral"
              title="Cookie check"
              onPress={profile.openCookieCheck}
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

export default ProfileScreen;
