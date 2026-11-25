import { useRef, type RefObject } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ArrowRight, MapPinOff } from 'lucide-react-native';

import { AppButton, AppCard, AppSkeleton, AppText } from '@/shared/components';

import StationCard from './StationCard';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';

type NearbyCarouselProps = {
  listRef: RefObject<FlatList<NearbyStation> | null>;
  stations: NearbyStation[];
  loading: boolean;
  selectedId: string | null;
  hasFilters: boolean;
  onFocus: (index: number) => void;
  onPressStation: (stationId: string) => void;
  onViewAll: () => void;
  onClearFilters: () => void;
};

const CARD_WIDTH_RATIO = 0.84;
const CARD_HEIGHT = 196;

const NearbyCarousel = ({
  listRef,
  stations,
  loading,
  selectedId,
  hasFilters,
  onFocus,
  onPressStation,
  onViewAll,
  onClearFilters,
}: NearbyCarouselProps) => {
  const t = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const cardWidth = Math.round(screenWidth * CARD_WIDTH_RATIO);
  const gap = t.space[3];
  const step = cardWidth + gap;
  // Only a swipe by the user picks a station; scroll events on mount or from code don't.
  const dragging = useRef(false);
  const sidePadding = t.space[4];

  if (loading && !stations.length) {
    return (
      <View style={[styles.row, { paddingHorizontal: sidePadding, gap }]}>
        <AppSkeleton width={cardWidth} height={CARD_HEIGHT} radius={t.radius.sheet} />
        <AppSkeleton width={cardWidth} height={CARD_HEIGHT} radius={t.radius.sheet} />
      </View>
    );
  }

  if (!stations.length) {
    return (
      <View style={{ paddingHorizontal: sidePadding }}>
        <AppCard
          elevation="elevated"
          style={{ gap: t.space[4], padding: t.space[5], borderRadius: t.radius.sheet }}
        >
          <View style={[styles.row, { gap: t.space[3] }]}>
            <View
              style={[
                styles.arrow,
                { backgroundColor: t.colors.accentSoft, borderRadius: t.radius.pill },
              ]}
            >
              <MapPinOff color={t.colors.accentText} size={22} strokeWidth={1.75} />
            </View>
            <View style={styles.grow}>
              <AppText variant="headline">{MAP_COPY.emptyTitle}</AppText>
              {hasFilters ? (
                <AppText variant="callout" tone="secondary">
                  {MAP_COPY.emptyFiltered}
                </AppText>
              ) : null}
            </View>
          </View>
          <AppButton
            label={hasFilters ? MAP_COPY.clearFilters : MAP_COPY.viewAll}
            variant="secondary"
            size="medium"
            onPress={hasFilters ? onClearFilters : onViewAll}
          />
        </AppCard>
      </View>
    );
  }

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!dragging.current) return;
    dragging.current = false;

    const index = Math.round(event.nativeEvent.contentOffset.x / step);
    onFocus(Math.min(Math.max(index, 0), stations.length - 1));
  };

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={stations}
      keyExtractor={station => station.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={step}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: sidePadding, gap }}
      getItemLayout={(_, index) => ({ length: step, offset: step * index, index })}
      onScrollBeginDrag={() => {
        dragging.current = true;
      }}
      onMomentumScrollEnd={onScrollEnd}
      renderItem={({ item }) => (
        <StationCard
          station={item}
          width={cardWidth}
          selected={item.id === selectedId}
          onPress={onPressStation}
        />
      )}
      ListFooterComponent={
        <AppCard
          elevation="elevated"
          onPress={onViewAll}
          accessibilityLabel={MAP_COPY.viewAll}
          style={[styles.viewAll, { gap: t.space[3], borderRadius: t.radius.sheet }]}
        >
          <View
            style={[
              styles.arrow,
              { backgroundColor: t.colors.accentSoft, borderRadius: t.radius.pill },
            ]}
          >
            <ArrowRight color={t.colors.accentText} size={22} strokeWidth={1.75} />
          </View>
          <AppText variant="subhead" tone="accent">
            {MAP_COPY.viewAll}
          </AppText>
        </AppCard>
      }
    />
  );
};

export default NearbyCarousel;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  viewAll: {
    width: 148,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
