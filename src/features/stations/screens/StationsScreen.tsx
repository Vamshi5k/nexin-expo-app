import { useContext, useRef, type ComponentRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, type TextInput } from 'react-native';

import { BottomTabBarHeightContext } from 'expo-router/tabs';
import { MapPinOff, PlugZap, Search, SearchX, X } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppEmptyState,
  AppErrorState,
  AppInput,
  AppPressable,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import StationListCard from '../components/StationListCard';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';
import { riseIn } from '@/shared/utils/motion';

import {
  LIST_COPY,
  LOAD_MORE_THRESHOLD,
  STATIONS_PAGE_SIZE,
} from '../constants/stations.constants';
import { useStationList } from '../hooks/useStationList';

type StationsScreenProps = {
  focusSearch?: boolean;
};

const SKELETON_COUNT = 3;

// Title and search stay put; the list scrolls under them, loads more near the end and
// refreshes on pull.
const StationsScreen = ({ focusSearch = false }: StationsScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const list = useStationList({ focusSearch, inputRef });
  const cardSkeletonHeight = t.space[12] * 2;

  const skeletons = (count: number) => (
    <View style={{ gap: t.space[3] }}>
      {Array.from({ length: count }, (_, index) => (
        <AppSkeleton key={index} height={cardSkeletonHeight} radius={t.radius.card} />
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (list.state === 'loading') return skeletons(SKELETON_COUNT);

    if (list.state === 'location-off') {
      return (
        <AppEmptyState
          icon={MapPinOff}
          title={LIST_COPY.locationOffTitle}
          description={LIST_COPY.locationOffBody}
          actionLabel={LIST_COPY.enableLocation}
          onAction={() => void list.enableLocation()}
        />
      );
    }

    if (list.state === 'error') {
      return (
        <AppErrorState
          title={LIST_COPY.loadError}
          message={getErrorMessage(list.error)}
          onRetry={list.retry}
          retryLabel={LIST_COPY.retry}
        />
      );
    }

    if (list.search) {
      return (
        <AppEmptyState
          icon={SearchX}
          title={LIST_COPY.noResults}
          description={LIST_COPY.noResultsBody}
          actionLabel={LIST_COPY.clearSearchAction}
          onAction={list.clearSearch}
        />
      );
    }

    return (
      <AppEmptyState
        icon={PlugZap}
        title={LIST_COPY.emptyTitle}
        description={LIST_COPY.emptyBody}
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <View
        style={{
          gap: t.space[3],
          paddingTop: insets.top + t.space[3],
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: t.space[3],
        }}
      >
        <AppText variant="title1" accessibilityRole="header">
          {LIST_COPY.title}
        </AppText>
        <AppInput
          ref={inputRef}
          icon={Search}
          value={list.query}
          onChangeText={list.setQuery}
          placeholder={LIST_COPY.searchPlaceholder}
          accessibilityLabel={LIST_COPY.searchPlaceholder}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
          trailing={
            list.query ? (
              <AppPressable
                onPress={list.clearSearch}
                haptic="light"
                accessibilityRole="button"
                accessibilityLabel={LIST_COPY.clearSearch}
                hitSlop={t.space[2]}
              >
                <X color={t.colors.textSecondary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
              </AppPressable>
            ) : null
          }
        />
      </View>

      <FlatList
        testID="stations-list"
        data={list.state === 'ready' ? list.stations : []}
        keyExtractor={station => station.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={riseIn(index % STATIONS_PAGE_SIZE)}>
            <StationListCard
              station={item}
              favourite={list.isFavourite(item.id)}
              onPress={list.openStation}
              onToggleFavourite={id => void list.toggleFavourite(id)}
            />
          </Animated.View>
        )}
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={list.loadingMore ? skeletons(1) : undefined}
        onEndReached={() => void list.loadMore()}
        onEndReachedThreshold={LOAD_MORE_THRESHOLD}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          gap: t.space[3],
          paddingHorizontal: t.layout.screenPadding,
          paddingTop: t.space[1],
          paddingBottom: tabBarHeight + t.space[4],
        }}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={() => void list.refresh()}
            tintColor={t.colors.accentText}
          />
        }
      />
    </View>
  );
};

export default StationsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
