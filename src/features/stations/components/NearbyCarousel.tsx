import { useEffect, type ReactNode, type RefObject } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ArrowRight, MapPinOff } from 'lucide-react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AppButton, AppCard, AppPressable, AppSkeleton, AppText } from '@/shared/components';

import StationCard, { stationCardHeight } from './StationCard';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import { MAP_COPY } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';

type NearbyCarouselProps = {
  listRef: RefObject<FlatList<NearbyStation> | null>;
  stations: NearbyStation[];
  loading: boolean;
  hidden: boolean;
  selectedId: string | null;
  hasFilters: boolean;
  onFocus: (index: number) => void;
  onPressStation: (stationId: string) => void;
  onDirections: (station: NearbyStation) => void;
  onViewAll: () => void;
  onClearFilters: () => void;
};

type CarouselItemProps = {
  index: number;
  step: number;
  scrollX: SharedValue<number>;
  animate: boolean;
  children: ReactNode;
};

const CARD_WIDTH_RATIO = 0.86;
const NEIGHBOUR_OPACITY = 0.85;
const NEIGHBOUR_SCALE = 0.96;

// Cards next to the centred one shrink and fade a little, following the finger.
const CarouselItem = ({ index, step, scrollX, animate, children }: CarouselItemProps) => {
  const style = useAnimatedStyle(() => {
    if (!animate) return {};

    const input = [(index - 1) * step, index * step, (index + 1) * step];
    return {
      opacity: interpolate(
        scrollX.value,
        input,
        [NEIGHBOUR_OPACITY, 1, NEIGHBOUR_OPACITY],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            input,
            [NEIGHBOUR_SCALE, 1, NEIGHBOUR_SCALE],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
};

const NearbyCarousel = ({
  listRef,
  stations,
  loading,
  hidden,
  selectedId,
  hasFilters,
  onFocus,
  onPressStation,
  onDirections,
  onViewAll,
  onClearFilters,
}: NearbyCarouselProps) => {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const { width: screenWidth } = useWindowDimensions();

  const cardWidth = Math.round(screenWidth * CARD_WIDTH_RATIO);
  const gap = t.space[3];
  const step = cardWidth + gap;
  const sidePadding = t.space[4];
  const count = stations.length;
  const cardHeight = stationCardHeight(t);

  const scrollX = useSharedValue(0);
  // Only a swipe by the user picks a station; scroll events on mount or from code don't.
  const dragging = useSharedValue(false);
  const visible = useSharedValue(hidden ? 0 : 1);

  useEffect(() => {
    visible.set(withTiming(hidden ? 0 : 1, { duration: t.motion.durationFast }));
  }, [hidden, visible, t.motion.durationFast]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ translateY: (1 - visible.value) * 16 }],
  }));

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
    onBeginDrag: () => {
      dragging.value = true;
    },
    onMomentumEnd: event => {
      if (!dragging.value) return;
      dragging.value = false;

      const index = Math.min(Math.max(Math.round(event.contentOffset.x / step), 0), count - 1);
      scheduleOnRN(onFocus, index);
    },
  });

  const renderContent = () => {
    if (loading && !count) {
      return (
        <Animated.View
          key="loading"
          entering={FadeIn}
          style={[styles.row, { paddingHorizontal: sidePadding, gap }]}
        >
          <AppSkeleton width={cardWidth} height={cardHeight} radius={t.radius.sheet} />
          <AppSkeleton width={cardWidth} height={cardHeight} radius={t.radius.sheet} />
        </Animated.View>
      );
    }

    if (!count) {
      return (
        <Animated.View key="empty" entering={FadeIn} style={{ paddingHorizontal: sidePadding }}>
          <AppCard
            elevation="elevated"
            style={[styles.row, { gap: t.space[3], padding: t.space[4] }]}
          >
            <View
              style={[
                styles.icon,
                {
                  width: t.layout.minTouch,
                  height: t.layout.minTouch,
                  backgroundColor: t.colors.accentSoft,
                  borderRadius: t.radius.card - t.space[4],
                },
              ]}
            >
              <MapPinOff
                color={t.colors.accentText}
                size={t.icon.control}
                strokeWidth={t.icon.stroke}
              />
            </View>
            <View style={styles.grow}>
              <AppText variant="headline" numberOfLines={1}>
                {MAP_COPY.emptyTitle}
              </AppText>
              {hasFilters ? (
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                  {MAP_COPY.emptyFiltered}
                </AppText>
              ) : null}
            </View>
            <AppButton
              label={hasFilters ? MAP_COPY.clearFilters : MAP_COPY.viewAll}
              variant="secondary"
              size="medium"
              onPress={hasFilters ? onClearFilters : onViewAll}
            />
          </AppCard>
        </Animated.View>
      );
    }

    return (
      <Animated.View key="list" entering={riseIn(1)}>
        <Animated.FlatList
          ref={listRef}
          horizontal
          data={stations}
          keyExtractor={station => station.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={step}
          decelerationRate="fast"
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: sidePadding, gap }}
          getItemLayout={(_, index) => ({ length: step, offset: step * index, index })}
          onScroll={onScroll}
          renderItem={({ item, index }) => (
            <CarouselItem index={index} step={step} scrollX={scrollX} animate={!reduceMotion}>
              <StationCard
                station={item}
                width={cardWidth}
                selected={item.id === selectedId}
                onPress={onPressStation}
                onDirections={onDirections}
              />
            </CarouselItem>
          )}
          ListFooterComponent={
            <CarouselItem index={count} step={step} scrollX={scrollX} animate={!reduceMotion}>
              <AppPressable
                onPress={onViewAll}
                accessibilityRole="button"
                accessibilityLabel={MAP_COPY.viewAll}
                style={[
                  styles.viewAll,
                  {
                    gap: t.space[2],
                    width: t.space[12] * 2 + t.space[6],
                    height: cardHeight,
                    borderRadius: t.radius.sheet,
                    borderWidth: t.layout.selectedBorder,
                    backgroundColor: t.colors.surfaceRaised,
                    borderColor: t.colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.arrow,
                    {
                      width: t.space[10],
                      height: t.space[10],
                      backgroundColor: t.colors.accentSoft,
                      borderRadius: t.radius.pill,
                    },
                  ]}
                >
                  <ArrowRight
                    color={t.colors.accentText}
                    size={t.icon.control}
                    strokeWidth={t.icon.stroke}
                  />
                </View>
                <AppText variant="caption" tone="accent">
                  {MAP_COPY.viewAll}
                </AppText>
              </AppPressable>
            </CarouselItem>
          }
        />
      </Animated.View>
    );
  };

  return (
    <Animated.View pointerEvents={hidden ? 'none' : 'auto'} style={fadeStyle}>
      {renderContent()}
    </Animated.View>
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
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAll: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
