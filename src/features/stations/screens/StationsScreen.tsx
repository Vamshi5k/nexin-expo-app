import { useContext, useRef, type ComponentRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, type TextInput } from 'react-native';

import { BottomTabBarHeightContext } from 'expo-router/tabs';
import { MapPinOff, PlugZap, SearchX } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppEmptyState, AppErrorState, AppSkeleton, AppText } from '@/shared/components';

import Fade from '../components/Fade';
import SearchCapsule from '../components/SearchCapsule';
import StationListCard from '../components/StationListCard';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';
import { dropIn, riseIn } from '@/shared/utils/motion';

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

// A brand wash behind the title and the map's glass search capsule stay put; the list scrolls under them, loads more near the end and
// refreshes on pull.
const StationsScreen = ({ focusSearch = false }: StationsScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const list = useStationList({ focusSearch, inputRef });
  const cardSkeletonHeight = t.space[12] * 3 + t.space[4];

  const skeletons = (count: number) => (
    <View style={{ gap: t.space[3] }}>
      {Array.from({ length: count }, (_, index) => (
        <AppSkeleton key={index} height={cardSkeletonHeight} radius={t.radius.sheet} />
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
          gap: t.space[4],
          paddingTop: insets.top + t.space[4],
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: t.space[3],
        }}
      >
        <Fade id="stations-wash" color={t.colors.accent} from={0.22} to={0} top />
        <Animated.View entering={riseIn(0)} style={{ gap: t.space[1] }}>
          <AppText variant="title1" accessibilityRole="header">
            {LIST_COPY.title}
          </AppText>
          <AppText variant="subhead" tone="secondary">
            {LIST_COPY.subtitle}
          </AppText>
        </Animated.View>
        <Animated.View entering={dropIn(1)}>
          <SearchCapsule
            value={list.query}
            inputRef={inputRef}
            onChange={list.setQuery}
            onClear={list.clearSearch}
          />
        </Animated.View>
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
              onDirections={list.openDirections}
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
