import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BellOff, Filter } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppEmptyState,
  AppErrorState,
  AppFade,
  AppPageHeader,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import FilterChips from '../components/FilterChips';
import NotificationCard from '../components/NotificationCard';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';
import { riseIn } from '@/shared/utils/motion';

import {
  KIND_LABEL,
  NOTIFICATIONS_COPY,
  NOTIFICATIONS_HREF,
} from '../constants/notifications.constants';
import { useNotifications } from '../hooks/useNotifications';
import { formatDay, formatWhen, type DayGroup } from '../utils/notifications';

const SKELETONS = 5;
// How close to the bottom (in points) before the next page loads.
const LOAD_MORE_OFFSET = 400;

const dayLabel = (group: DayGroup) => {
  if (group.day === 'today') return NOTIFICATIONS_COPY.today;
  if (group.day === 'yesterday') return NOTIFICATIONS_COPY.yesterday;
  return formatDay(group.date, brand.locale);
};

// Notifications (BLUEPRINT E8): category pills (All, Offers, New Station, Maintenance,
// Customer Support, Information), grouped by day, unread ones highlighted; tap to read in full.
const NotificationsScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const list = useNotifications();
  const now = new Date();

  const body = () => {
    if (list.loading) {
      return (
        <View testID="notifications-loading" style={{ gap: t.space[2] }}>
          {Array.from({ length: SKELETONS }, (_, index) => (
            <AppSkeleton key={index} height={t.space[12] * 2} radius={t.radius.card} />
          ))}
        </View>
      );
    }
    if (list.failed) {
      return (
        <AppErrorState
          title={NOTIFICATIONS_COPY.loadError}
          message={list.errorMessage}
          onRetry={list.retry}
          retryLabel={NOTIFICATIONS_COPY.retry}
        />
      );
    }
    if (list.empty) {
      return list.filter === 'all' ? (
        <AppEmptyState
          icon={BellOff}
          title={NOTIFICATIONS_COPY.emptyTitle}
          description={NOTIFICATIONS_COPY.emptyBody}
        />
      ) : (
        <AppEmptyState
          icon={Filter}
          title={NOTIFICATIONS_COPY.emptyFiltered(KIND_LABEL[list.filter])}
          description={NOTIFICATIONS_COPY.emptyFilteredBody}
          actionLabel={NOTIFICATIONS_COPY.showAll}
          onAction={() => list.setFilter('all')}
        />
      );
    }
    return list.groups.map((group, groupIndex) => (
      <View key={group.key} style={{ gap: t.space[2] }}>
        {dayLabel(group) ? (
          <AppText
            variant="caption"
            tone="secondary"
            accessibilityRole="header"
            style={[styles.overline, { paddingHorizontal: t.space[1] }]}
          >
            {dayLabel(group)}
          </AppText>
        ) : null}
        {group.items.map((item, index) => (
          <Animated.View key={item.id} entering={riseIn(Math.min(groupIndex + index, 6) + 1)}>
            <NotificationCard
              item={item}
              when={formatWhen(item.createdAt, now, brand.locale, NOTIFICATIONS_COPY)}
              open={list.isOpen(item)}
              onPress={() => list.press(item)}
            />
          </Animated.View>
        ))}
      </View>
    ));
  };

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <View pointerEvents="none" style={[styles.wash, { height: insets.top + t.space[12] * 4 }]}>
        <AppFade id="notifications-wash" color={t.colors.accent} from={0.22} to={0} top />
      </View>

      <ScrollView
        testID="notifications-scroll"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={200}
        onScroll={({ nativeEvent: e }) => {
          if (
            e.layoutMeasurement.height + e.contentOffset.y >=
            e.contentSize.height - LOAD_MORE_OFFSET
          ) {
            list.loadMore();
          }
        }}
        contentContainerStyle={{
          flexGrow: 1,
          gap: t.space[4],
          paddingTop: insets.top + t.space[2],
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[4],
        }}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={list.refresh}
            tintColor={t.colors.accentText}
            progressViewOffset={insets.top}
          />
        }
      >
        <View style={{ gap: t.space[3] }}>
          <AppPageHeader
            title={NOTIFICATIONS_COPY.title}
            subtitle={
              list.unread ? NOTIFICATIONS_COPY.unread(list.unread) : NOTIFICATIONS_COPY.caughtUp
            }
            fallbackHref={NOTIFICATIONS_HREF.profile}
          />
          <FilterChips filters={list.filters} value={list.filter} onChange={list.setFilter} />
        </View>

        {body()}

        {list.loadingMore ? <AppSkeleton height={t.space[12] * 2} radius={t.radius.card} /> : null}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;

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
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
