import {
  FlatList,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/shared/components';

import ChargerArt from './ChargerArt';
import StatRow, { type Stat } from './StatRow';

import { useTheme, withAlpha } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { DETAILS_COPY, MAX_ETA_KM, pageLabel } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

const ART_RATIO = 0.3;

type StationHeroProps = {
  station: StationDetails;
  distance: number | null;
  images: string[];
  page: number;
  width: number;
  height: number;
  onPageChange: (page: number) => void;
  onImageError: (url: string) => void;
};

type FadeProps = { id: string; color: string; from: number; to: number; top?: boolean };

const SCRIM_OPACITY = 0.78;
const TOP_SCRIM_OPACITY = 0.35;

const heroStats = (station: StationDetails, distance: number | null): Stat[] => {
  const powers = station.chargers.map(charger => charger.capacityKw).filter(isNumber);
  const prices = station.chargers.map(charger => charger.pricePerKwhPaise).filter(isNumber);

  const stats: (Stat | null)[] = [
    distance !== null
      ? { value: formatDistance(distance, brand.locale), label: DETAILS_COPY.distance }
      : null,
    distance !== null && distance <= MAX_ETA_KM
      ? { value: formatEta(distance), label: DETAILS_COPY.drive }
      : null,
    powers.length ? { value: `${Math.max(...powers)} kW`, label: DETAILS_COPY.power } : null,
    prices.length ? { value: formatRate(Math.min(...prices)), label: DETAILS_COPY.perKwh } : null,
  ];
  return stats.filter((stat): stat is Stat => stat !== null);
};

function isNumber(value: number | null): value is number {
  return value !== null;
}

// A vertical fade from `color` at `from` opacity to `to`, top-down (or bottom-up for the base).
const Fade = ({ id, color, from, to, top }: FadeProps) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <LinearGradient id={id} x1="0" y1={top ? '0' : '1'} x2="0" y2={top ? '1' : '0'}>
        <Stop offset="0" stopColor={color} stopOpacity={from} />
        <Stop offset="1" stopColor={color} stopOpacity={to} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
  </Svg>
);

// Station photos from the backend (slider for many, still for one), or the brand illustration
// when there are none or all of them fail. A fixed height keeps the page from jumping.
const StationHero = ({
  station,
  distance,
  images,
  page,
  width,
  height,
  onPageChange,
  onImageError,
}: StationHeroProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  // Centred between the back button and the actions, clear of the status pill below.
  const artSize = height * ART_RATIO;
  const hasPhoto = images.length > 0;
  const statusColor = t.colors.connector[pinColorKey(station.status)];
  const ink = hasPhoto ? t.colors.surface : t.colors.textPrimary;
  const subInk = hasPhoto ? withAlpha(t.colors.surface, 0.85) : t.colors.textSecondary;
  const stats = heroStats(station, distance);

  const onPageEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onPageChange(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ width, height, backgroundColor: t.colors.surfaceSunken }}>
      {hasPhoto ? (
        <FlatList
          testID="station-hero-slider"
          data={images}
          horizontal
          pagingEnabled
          scrollEnabled={images.length > 1}
          showsHorizontalScrollIndicator={false}
          keyExtractor={url => url}
          onMomentumScrollEnd={onPageEnd}
          initialNumToRender={1}
          windowSize={3}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item }) => (
            <Image
              testID="station-hero-image"
              source={{ uri: item }}
              style={{ width, height }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={t.motion.duration}
              onError={() => onImageError(item)}
              accessibilityLabel={DETAILS_COPY.photo}
            />
          )}
        />
      ) : (
        <View testID="station-hero-fallback" style={StyleSheet.absoluteFill}>
          <Fade id={`hero-wash-${station.id}`} color={t.colors.accent} from={0.28} to={0.06} top />
          <View style={[styles.art, { top: insets.top + t.space[1], left: (width - artSize) / 2 }]}>
            <ChargerArt size={artSize} glow={t.colors.accent} />
          </View>
        </View>
      )}

      {hasPhoto ? (
        <>
          <View style={[styles.topScrim, { height: t.space[12] * 3 }]} pointerEvents="none">
            <Fade
              id={`hero-top-${station.id}`}
              color={t.colors.textPrimary}
              from={TOP_SCRIM_OPACITY}
              to={0}
              top
            />
          </View>
          <View style={[styles.bottomScrim, { height: height * 0.7 }]} pointerEvents="none">
            <Fade
              id={`hero-base-${station.id}`}
              color={t.colors.textPrimary}
              from={SCRIM_OPACITY}
              to={0}
            />
          </View>
        </>
      ) : (
        <View style={[styles.bottomScrim, { height: height * 0.55 }]} pointerEvents="none">
          <Fade id={`hero-base-${station.id}`} color={t.colors.bg} from={1} to={0} />
        </View>
      )}

      <View
        pointerEvents="box-none"
        style={[
          styles.content,
          { gap: t.space[2], padding: t.layout.screenPadding, paddingBottom: t.space[5] },
        ]}
      >
        <View style={[styles.row, styles.between]}>
          <View
            style={[
              styles.row,
              {
                gap: t.space[2],
                paddingHorizontal: t.space[3],
                paddingVertical: t.space[1],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.surface,
              },
            ]}
          >
            <View
              style={{
                width: t.space[2],
                height: t.space[2],
                borderRadius: t.radius.pill,
                backgroundColor: statusColor,
              }}
            />
            <AppText variant="caption">{station.rawStatus || STATUS_LABEL[station.status]}</AppText>
          </View>
          {images.length > 1 ? (
            <View
              style={{
                paddingHorizontal: t.space[3],
                paddingVertical: t.space[1],
                borderRadius: t.radius.pill,
                backgroundColor: withAlpha(t.colors.textPrimary, 0.55),
              }}
            >
              <AppText variant="caption" tabular style={{ color: t.colors.surface }}>
                {pageLabel(page + 1, images.length)}
              </AppText>
            </View>
          ) : null}
        </View>

        <AppText
          variant="title1"
          numberOfLines={2}
          accessibilityRole="header"
          style={{ color: ink }}
        >
          {station.name}
        </AppText>
        {station.address ? (
          <AppText variant="subhead" numberOfLines={1} style={{ color: subInk }}>
            {station.address}
          </AppText>
        ) : null}
        {stats.length ? (
          <View style={{ marginTop: t.space[2] }}>
            <StatRow stats={stats} inverse={hasPhoto} />
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default StationHero;

const styles = StyleSheet.create({
  art: {
    position: 'absolute',
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
});
