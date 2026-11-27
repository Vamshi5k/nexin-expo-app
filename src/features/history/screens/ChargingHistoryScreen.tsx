import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Zap } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppEmptyState,
  AppErrorState,
  AppFade,
  AppPageHeader,
  AppSegmentedControl,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import SessionCard from '../components/SessionCard';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';
import { riseIn } from '@/shared/utils/motion';

import { HISTORY_COPY, HISTORY_HREF, HISTORY_TABS } from '../constants/history.constants';
import { useChargingHistory } from '../hooks/useChargingHistory';
import { formatMonth } from '../utils/history';

const SKELETONS = 4;

// Charging History (BLUEPRINT E6): All / Completed / Active, newest first under month labels;
// every card opens its invoice.
const ChargingHistoryScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const history = useChargingHistory();

  const body = () => {
    if (history.loading) {
      return (
        <View testID="history-loading" style={{ gap: t.space[3] }}>
          {Array.from({ length: SKELETONS }, (_, index) => (
            <AppSkeleton key={index} height={t.space[12] * 2 + t.space[6]} radius={t.radius.card} />
          ))}
        </View>
      );
    }
    if (history.failed) {
      return (
        <AppErrorState
          title={HISTORY_COPY.loadError}
          message={history.errorMessage}
          onRetry={history.retry}
          retryLabel={HISTORY_COPY.retry}
        />
      );
    }
    if (history.empty) {
      return (
        <AppEmptyState
          icon={Zap}
          title={
            history.tab === 'all'
              ? HISTORY_COPY.emptyTitle
              : HISTORY_COPY.emptyFiltered[history.tab]
          }
          description={HISTORY_COPY.emptyBody}
        />
      );
    }
    return history.groups.map((group, groupIndex) => (
      <View key={group.key} style={{ gap: t.space[2] }}>
        {group.date ? (
          <AppText
            variant="caption"
            tone="secondary"
            accessibilityRole="header"
            style={[styles.overline, { paddingHorizontal: t.space[1] }]}
          >
            {formatMonth(group.date, brand.locale)}
          </AppText>
        ) : null}
        {group.sessions.map((session, index) => (
          <Animated.View key={session.id} entering={riseIn(groupIndex + index + 1)}>
            <SessionCard session={session} onPress={() => history.open(session)} />
          </Animated.View>
        ))}
      </View>
    ));
  };

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <View pointerEvents="none" style={[styles.wash, { height: insets.top + t.space[12] * 4 }]}>
        <AppFade id="history-wash" color={t.colors.accent} from={0.22} to={0} top />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          gap: t.space[3],
          paddingTop: insets.top + t.space[2],
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[4],
        }}
        refreshControl={
          <RefreshControl
            refreshing={history.refreshing}
            onRefresh={history.refresh}
            tintColor={t.colors.accentText}
            progressViewOffset={insets.top}
          />
        }
      >
        <AppPageHeader
          title={HISTORY_COPY.title}
          subtitle={
            history.total ? HISTORY_COPY.subtitle(history.total) : HISTORY_COPY.subtitleEmpty
          }
          fallbackHref={HISTORY_HREF.profile}
        />

        <AppSegmentedControl
          segments={HISTORY_TABS.map(key => ({
            value: key,
            label: HISTORY_COPY.tabs[key],
            badge: history.counts[key] ? String(history.counts[key]) : undefined,
          }))}
          value={history.tab}
          onChange={history.setTab}
          accessibilityLabel={HISTORY_COPY.tabsLabel}
        />

        {body()}
      </ScrollView>
    </View>
  );
};

export default ChargingHistoryScreen;

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
