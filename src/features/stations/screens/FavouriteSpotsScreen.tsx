import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Heart, SearchX } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppEmptyState,
  AppErrorState,
  AppFade,
  AppPageHeader,
  AppSearchBar,
  AppSkeleton,
} from '@/shared/components';

import FavouriteCard from '../components/FavouriteCard';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import {
  FAVOURITES_COPY,
  FAVOURITES_HREF,
  LOAD_MORE_THRESHOLD,
} from '../constants/stations.constants';
import { useFavouriteSpots } from '../hooks/useFavouriteSpots';

const SKELETONS = 4;

// Favourite Spots (BLUEPRINT E7): every station the driver hearted, with search, paging and a
// filled heart to remove one. A station hearted elsewhere shows up when the screen opens again.
const FavouriteSpotsScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const spots = useFavouriteSpots();
  const card = t.space[12] * 2 + t.space[4];

  const skeletons = (count: number) => (
    <View style={{ gap: t.space[3] }}>
      {Array.from({ length: count }, (_, index) => (
        <AppSkeleton key={index} height={card} radius={t.radius.card} />
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (spots.loading) return <View testID="favourites-loading">{skeletons(SKELETONS)}</View>;
    if (spots.failed) {
      return (
        <AppErrorState
          title={FAVOURITES_COPY.loadError}
          message={spots.errorMessage}
          onRetry={spots.retry}
          retryLabel={FAVOURITES_COPY.retry}
        />
      );
    }
    if (spots.searching) {
      return (
        <AppEmptyState
          icon={SearchX}
          title={FAVOURITES_COPY.noResults}
          description={FAVOURITES_COPY.noResultsBody}
          actionLabel={FAVOURITES_COPY.clearSearchAction}
          onAction={spots.clearSearch}
        />
      );
    }
    return (
      <AppEmptyState
        icon={Heart}
        title={FAVOURITES_COPY.emptyTitle}
        description={FAVOURITES_COPY.emptyBody}
        actionLabel={FAVOURITES_COPY.findStations}
        onAction={spots.findStations}
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <View pointerEvents="none" style={[styles.wash, { height: insets.top + t.space[12] * 4 }]}>
        <AppFade id="favourites-wash" color={t.colors.accent} from={0.22} to={0} top />
      </View>

      <FlatList
        testID="favourites-list"
        data={spots.stations}
        keyExtractor={station => station.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={riseIn(Math.min(index, 6) + 1)}>
            <FavouriteCard
              station={item}
              onPress={() => spots.open(item)}
              onRemove={() => spots.remove(item)}
              onDirections={() => spots.directions(item)}
            />
          </Animated.View>
        )}
        ListHeaderComponent={
          <View style={{ gap: t.space[3], marginBottom: t.space[1] }}>
            <AppPageHeader
              title={FAVOURITES_COPY.title}
              subtitle={
                spots.stations.length && !spots.searching
                  ? FAVOURITES_COPY.subtitle(spots.stations.length)
                  : FAVOURITES_COPY.subtitleEmpty
              }
              fallbackHref={FAVOURITES_HREF.profile}
            />
            <AppSearchBar
              value={spots.query}
              onChangeText={spots.setQuery}
              placeholder={FAVOURITES_COPY.searchPlaceholder}
              clearLabel={FAVOURITES_COPY.clearSearch}
            />
          </View>
        }
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={spots.loadingMore ? skeletons(1) : undefined}
        onEndReached={spots.loadMore}
        onEndReachedThreshold={LOAD_MORE_THRESHOLD}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
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
            refreshing={spots.refreshing}
            onRefresh={spots.refresh}
            tintColor={t.colors.accentText}
            progressViewOffset={insets.top}
          />
        }
      />
    </View>
  );
};

export default FavouriteSpotsScreen;

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
});
