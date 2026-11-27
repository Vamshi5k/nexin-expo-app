import { useContext } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabBarHeightContext } from 'expo-router/tabs';
import { LayoutGrid, ShieldCheck } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppDialog, AppFade, AppPressable, AppText } from '@/shared/components';

import ProfileGlyph, { type ProfileGlyphName } from '../components/ProfileGlyph';
import ProfileGroup from '../components/ProfileGroup';
import ProfileHero from '../components/ProfileHero';
import ProfileRow from '../components/ProfileRow';
import { LogoutDialog } from '@/features/auth';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import { DELETE_COPY, PROFILE_COPY } from '../constants/profile.constants';
import { useProfile } from '../hooks/useProfile';

// Profile tab (BLUEPRINT E1): the account card, counts that link to their screens, support,
// log out and account deletion, then the app version. Rows use the Profile duotone icons.
const ProfileScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const profile = useProfile();
  const { logout, deletion } = profile;

  const glyph = (name: ProfileGlyphName, tone: 'accent' | 'neutral' | 'danger' = 'accent') => {
    const inks = {
      accent: t.colors.accentText,
      neutral: t.colors.textSecondary,
      danger: t.colors.dangerText,
    };
    return <ProfileGlyph name={name} color={inks[tone]} size={t.icon.control} />;
  };

  const lucide = (Icon: typeof LayoutGrid) => (
    <Icon color={t.colors.textSecondary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
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
          gap: t.space[4],
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
            <AppText variant="title3" accessibilityRole="header">
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
            hitSlop={t.space[1]}
            accessibilityRole="button"
            accessibilityLabel={PROFILE_COPY.notifications}
            style={[
              styles.center,
              {
                width: t.space[10],
                height: t.space[10],
                borderRadius: t.radius.pill,
                borderWidth: t.layout.hairline,
                borderColor: t.colors.border,
                backgroundColor: t.colors.surfaceRaised,
              },
            ]}
          >
            <ProfileGlyph name="bell" color={t.colors.textPrimary} size={t.icon.control} />
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
                padding: t.space[2],
                paddingLeft: t.space[3],
                borderRadius: t.radius.control,
                backgroundColor: t.colors.dangerSoft,
              },
            ]}
          >
            <AppText variant="caption" style={[styles.grow, { color: t.colors.dangerText }]}>
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
          <ProfileGroup title={PROFILE_COPY.account}>
            <ProfileRow
              first
              icon={glyph('car')}
              title={PROFILE_COPY.vehicles}
              subtitle={profile.vehicles}
              loading={profile.countsLoading}
              onPress={profile.openVehicles}
            />
            <ProfileRow
              icon={glyph('history')}
              title={PROFILE_COPY.history}
              subtitle={profile.sessions}
              loading={profile.countsLoading}
              onPress={profile.openHistory}
            />
            <ProfileRow
              icon={glyph('heart')}
              title={PROFILE_COPY.favourites}
              subtitle={profile.favourites}
              loading={profile.countsLoading}
              onPress={profile.openFavourites}
            />
          </ProfileGroup>
        </Animated.View>

        {profile.hasSupport ? (
          <Animated.View entering={riseIn(3)}>
            <ProfileGroup title={PROFILE_COPY.support}>
              <ProfileRow
                first
                icon={glyph('support')}
                title={PROFILE_COPY.help}
                subtitle={PROFILE_COPY.helpBody}
                onPress={profile.openSupport}
              />
            </ProfileGroup>
          </Animated.View>
        ) : null}

        {profile.showDevTools ? (
          <ProfileGroup title={PROFILE_COPY.developer}>
            <ProfileRow
              first
              tone="neutral"
              icon={lucide(LayoutGrid)}
              title={PROFILE_COPY.uiKit}
              onPress={profile.openUiKit}
            />
            <ProfileRow
              tone="neutral"
              icon={lucide(ShieldCheck)}
              title={PROFILE_COPY.cookieCheck}
              onPress={profile.openCookieCheck}
            />
          </ProfileGroup>
        ) : null}

        <Animated.View entering={riseIn(4)} style={{ gap: t.space[3] }}>
          <ProfileGroup>
            <ProfileRow
              first
              tone="neutral"
              icon={glyph('logout', 'neutral')}
              title={logout.leaving ? PROFILE_COPY.loggingOut : PROFILE_COPY.logout}
              chevron={false}
              onPress={logout.leaving ? undefined : logout.ask}
            />
          </ProfileGroup>
          <ProfileGroup>
            <ProfileRow
              first
              tone="danger"
              icon={glyph('delete', 'danger')}
              title={PROFILE_COPY.deleteAccount}
              chevron={false}
              onPress={deletion.ask}
            />
          </ProfileGroup>
        </Animated.View>

        <AppText variant="caption" tone="tertiary" align="center" tabular>
          {profile.versionLabel}
        </AppText>
      </ScrollView>

      <LogoutDialog state={logout} />
      <AppDialog
        open={deletion.open}
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
