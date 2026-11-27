import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';

import { Wallet } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppEmptyState,
  AppErrorState,
  AppHeader,
  AppSegmentedControl,
  AppText,
  type Segment,
} from '@/shared/components';

import { TransactionSkeleton } from '../components/TransactionList';
import TransactionRow from '../components/TransactionRow';

import { useTheme } from '@/shared/theme';

import { dropIn } from '@/shared/utils/motion';

import { HISTORY_COPY, LOAD_MORE_THRESHOLD } from '../constants/wallet.constants';
import { useWalletHistory } from '../hooks/useWalletHistory';
import type { TransactionFilter } from '../types/wallet.types';

const FILTERS: Segment<TransactionFilter>[] = [
  { value: 'all', label: HISTORY_COPY.all },
  { value: 'credit', label: HISTORY_COPY.credit },
  { value: 'debit', label: HISTORY_COPY.debit },
];

const SKELETON_ROWS = 6;

// Wallet History (BLUEPRINT D2): All / Credit / Debit, months as sticky headers, more pages
// as you scroll. Pull to refresh keeps the list on screen instead of swapping in a skeleton.
const WalletHistoryScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const history = useWalletHistory();

  const empty = (() => {
    if (history.state === 'loading') return <TransactionSkeleton rows={SKELETON_ROWS} />;
    if (history.state === 'error') {
      return (
        <AppErrorState
          title={HISTORY_COPY.loadError}
          message={HISTORY_COPY.loadError}
          onRetry={history.retry}
          retryLabel={HISTORY_COPY.retry}
        />
      );
    }
    return (
      <AppEmptyState
        icon={Wallet}
        title={HISTORY_COPY.emptyTitle}
        description={HISTORY_COPY.emptyBody}
      />
    );
  })();

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg, paddingTop: insets.top }]}>
      <AppHeader title={HISTORY_COPY.title} back />

      <Animated.View
        entering={dropIn()}
        style={{ paddingHorizontal: t.layout.screenPadding, paddingBottom: t.space[3] }}
      >
        <AppSegmentedControl
          segments={FILTERS}
          value={history.filter}
          onChange={history.setFilter}
          accessibilityLabel={HISTORY_COPY.title}
        />
      </Animated.View>

      <SectionList
        testID="wallet-history-list"
        sections={history.state === 'ready' ? history.sections : []}
        keyExtractor={tx => tx.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View
            style={{
              paddingTop: t.space[4],
              paddingBottom: t.space[2],
              backgroundColor: t.colors.bg,
            }}
          >
            <AppText variant="caption" tone="secondary" accessibilityRole="header">
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item, index }) => (
          <View
            style={[
              {
                paddingHorizontal: t.space[4],
                backgroundColor: t.colors.surfaceRaised,
                borderColor: t.colors.border,
                borderLeftWidth: t.layout.hairline,
                borderRightWidth: t.layout.hairline,
              },
              index === 0 && {
                borderTopWidth: t.layout.hairline,
                borderTopLeftRadius: t.radius.card,
                borderTopRightRadius: t.radius.card,
              },
            ]}
          >
            {index > 0 ? (
              <View style={{ height: t.layout.hairline, backgroundColor: t.colors.border }} />
            ) : null}
            <TransactionRow transaction={item} />
          </View>
        )}
        renderSectionFooter={() => (
          <View
            style={{
              height: t.radius.card,
              marginTop: -t.layout.hairline,
              backgroundColor: t.colors.surfaceRaised,
              borderColor: t.colors.border,
              borderWidth: t.layout.hairline,
              borderTopWidth: 0,
              borderBottomLeftRadius: t.radius.card,
              borderBottomRightRadius: t.radius.card,
            }}
          />
        )}
        ListEmptyComponent={empty}
        ListFooterComponent={history.loadingMore ? <TransactionSkeleton rows={2} /> : undefined}
        onEndReached={() => void history.loadMore()}
        onEndReachedThreshold={LOAD_MORE_THRESHOLD}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[4],
        }}
        refreshControl={
          <RefreshControl
            refreshing={history.refreshing}
            onRefresh={() => void history.refresh()}
            tintColor={t.colors.accentText}
          />
        }
      />
    </View>
  );
};

export default WalletHistoryScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
