import type { RefObject } from 'react';
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

const CARD_WIDTH_RATIO = 0.82;

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
  const sidePadding = t.layout.screenPadding;

  if (loading && !stations.length) {
    return (
      <View style={[styles.row, { paddingHorizontal: sidePadding, gap }]}>
        <AppSkeleton width={cardWidth} height={150} radius={t.radius.card} />
        <AppSkeleton width={cardWidth} height={150} radius={t.radius.card} />
      </View>
    );
  }

  if (!stations.length) {
    return (
      <View style={{ paddingHorizontal: sidePadding }}>
        <AppCard style={{ gap: t.space[3] }}>
          <View style={[styles.row, { gap: t.space[3] }]}>
            <MapPinOff color={t.colors.textTertiary} size={22} />
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
          onPress={onViewAll}
          accessibilityLabel={MAP_COPY.viewAll}
          style={[styles.viewAll, { gap: t.space[3] }]}
        >
          <View
            style={[
              styles.arrow,
              { backgroundColor: t.colors.accentSoft, borderRadius: t.radius.pill },
            ]}
          >
            <ArrowRight color={t.colors.accentText} size={22} />
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
    width: 140,
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
