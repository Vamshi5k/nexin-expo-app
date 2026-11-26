import { useContext } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabBarHeightContext } from 'expo-router/tabs';
import {
  Bell,
  Car,
  Heart,
  History,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppButton,
  AppDialog,
  AppFade,
  AppListGroup,
  AppListRow,
  AppPressable,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import ProfileHero from '../components/ProfileHero';
import { LogoutDialog } from '@/features/auth';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import { DELETE_COPY, PROFILE_COPY } from '../constants/profile.constants';
import { useProfile } from '../hooks/useProfile';

// Profile tab (BLUEPRINT E1): the account card, counts that link to their screens, support,
// log out and account deletion, then the app version.
const ProfileScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const profile = useProfile();
  const { logout, deletion } = profile;

  const countSkeleton = profile.countsLoading ? (
    <AppSkeleton width={t.space[12] + t.space[4]} height={t.space[3]} />
  ) : undefined;

  const countRow = (
    icon: typeof Car,
    title: string,
    subtitle: string | null,
    onPress: () => void,
  ) => (
    <AppListRow
      icon={icon}
      title={title}
      subtitle={subtitle ?? undefined}
      trailing={countSkeleton}
      chevron
      onPress={onPress}
    />
  );

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <View pointerEvents="none" style={[styles.wash, { height: insets.top + t.space[12] * 4 }]}>
        <AppFade id="profile-tab-wash" color={t.colors.accent} from={0.22} to={0} top />
      </View>

      <ScrollView
        testID="profile-scroll"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: t.space[5],
          paddingTop: insets.top + t.space[2],
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: tabBarHeight + t.space[6],
        }}
        refreshControl={
          <RefreshControl
            refreshing={profile.refreshing}
            onRefresh={profile.refresh}
            tintColor={t.colors.accentText}
            progressViewOffset={insets.top}
          />
        }
      >
        <Animated.View entering={riseIn(0)} style={[styles.row, { gap: t.space[3] }]}>
          <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
            <AppText variant="title2" accessibilityRole="header">
              {PROFILE_COPY.title}
            </AppText>
            {profile.userId ? (
              <AppText variant="caption" tone="secondary" tabular>
                {PROFILE_COPY.userId(profile.userId)}
              </AppText>
            ) : null}
          </View>
          <AppPressable
            onPress={profile.openNotifications}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={PROFILE_COPY.notifications}
            style={[
              styles.center,
              {
                width: t.layout.minTouch,
                height: t.layout.minTouch,
                borderRadius: t.radius.pill,
                borderWidth: t.layout.hairline,
                borderColor: t.colors.border,
                backgroundColor: t.colors.surfaceRaised,
              },
            ]}
          >
            <Bell color={t.colors.textPrimary} size={t.icon.control} strokeWidth={t.icon.stroke} />
          </AppPressable>
        </Animated.View>

        <Animated.View entering={riseIn(1)}>
          <ProfileHero
            name={profile.name}
            initials={profile.initials}
            email={profile.email}
            phone={profile.phone}
            onEdit={profile.openEdit}
          />
        </Animated.View>

        {profile.countsFailed ? (
          <View
            testID="profile-error"
            style={[
              styles.row,
              {
                gap: t.space[3],
                padding: t.space[3],
                paddingLeft: t.space[4],
                borderRadius: t.radius.card,
                backgroundColor: t.colors.dangerSoft,
              },
            ]}
          >
            <AppText variant="subhead" style={[styles.grow, { color: t.colors.dangerText }]}>
              {PROFILE_COPY.loadError}
            </AppText>
            <AppButton
              label={PROFILE_COPY.retry}
              variant="secondary"
              size="medium"
              onPress={profile.retry}
            />
          </View>
        ) : null}

        <Animated.View entering={riseIn(2)}>
          <AppListGroup title={PROFILE_COPY.account}>
            {countRow(Car, PROFILE_COPY.vehicles, profile.vehicles, profile.openVehicles)}
            {countRow(History, PROFILE_COPY.history, profile.sessions, profile.openHistory)}
            {countRow(Heart, PROFILE_COPY.favourites, profile.favourites, profile.openFavourites)}
          </AppListGroup>
        </Animated.View>

        {profile.hasSupport ? (
          <Animated.View entering={riseIn(3)}>
            <AppListGroup title={PROFILE_COPY.support}>
              <AppListRow
                icon={LifeBuoy}
                title={PROFILE_COPY.help}
                subtitle={PROFILE_COPY.helpBody}
                onPress={profile.openSupport}
              />
            </AppListGroup>
          </Animated.View>
        ) : null}

        {profile.showDevTools ? (
          <AppListGroup title={PROFILE_COPY.developer}>
            <AppListRow icon={LayoutGrid} title={PROFILE_COPY.uiKit} onPress={profile.openUiKit} />
            <AppListRow
              icon={ShieldCheck}
              iconTone="neutral"
              title={PROFILE_COPY.cookieCheck}
              onPress={profile.openCookieCheck}
            />
          </AppListGroup>
        ) : null}

        <Animated.View entering={riseIn(4)} style={{ gap: t.space[3] }}>
          <AppListGroup>
            <AppListRow
              icon={LogOut}
              iconTone="neutral"
              title={logout.leaving ? PROFILE_COPY.loggingOut : PROFILE_COPY.logout}
              chevron={false}
              onPress={logout.leaving ? undefined : logout.ask}
            />
          </AppListGroup>
          <AppListGroup>
            <AppListRow
              icon={Trash2}
              title={PROFILE_COPY.deleteAccount}
              destructive
              chevron={false}
              onPress={deletion.ask}
            />
          </AppListGroup>
        </Animated.View>

        <AppText variant="caption" tone="tertiary" align="center" tabular>
          {profile.versionLabel}
        </AppText>
      </ScrollView>

      <LogoutDialog state={logout} />
      <AppDialog
        open={deletion.open}
        icon={Trash2}
        title={DELETE_COPY.title}
        message={deletion.message}
        confirmLabel={deletion.confirmLabel}
        cancelLabel={DELETE_COPY.cancel}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
        loading={deletion.deleting}
        destructive
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
