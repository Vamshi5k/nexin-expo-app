import {
  FlatList,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFade, AppGlass, AppText } from '@/shared/components';

import StationScene from './StationScene';
import StatusDot from './StatusDot';

import { useTheme, withAlpha } from '@/shared/theme';

import { DETAILS_COPY, pageLabel } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationHeroProps = {
  station: StationDetails;
  images: string[];
  page: number;
  width: number;
  height: number;
  // How far the page's rounded sheet rises over the bottom of the hero.
  overlap: number;
  onPageChange: (page: number) => void;
  onImageError: (url: string) => void;
};

const TOP_SCRIM = 0.45;
const BASE_SCRIM = 0.3;
const DOT = 6;
const ACTIVE_DOT = 18;

// Edge-to-edge photos (or the brand illustration on a layered accent wash). The page rises over
// its base as a rounded sheet, so the glass status chip and photo dots float just above it.
const StationHero = ({
  station,
  images,
  page,
  width,
  height,
  overlap,
  onPageChange,
  onImageError,
}: StationHeroProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const hasPhoto = images.length > 0;
  const many = images.length > 1;
  const statusColor = t.colors.connector[pinColorKey(station.status)];
  const floatBottom = overlap + t.space[3];

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
          scrollEnabled={many}
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
          <AppFade
            id={`hero-wash-${station.id}`}
            color={t.colors.accent}
            from={0.3}
            to={0.04}
            top
          />
          <View
            style={[
              styles.glow,
              {
                width: width * 0.9,
                height: width * 0.9,
                left: width * 0.05,
                top: height * 0.1,
                borderRadius: t.radius.pill,
                backgroundColor: withAlpha(t.colors.surface, 0.55),
              },
            ]}
          />
          <View
            style={[styles.fill, { top: insets.top + t.space[12], bottom: overlap + t.space[2] }]}
          >
            <StationScene />
          </View>
        </View>
      )}

      <View style={[styles.top, { height: insets.top + t.space[12] * 2 }]} pointerEvents="none">
        <AppFade
          id={`hero-top-${station.id}`}
          color={hasPhoto ? t.colors.textPrimary : t.colors.bg}
          from={hasPhoto ? TOP_SCRIM : 0.6}
          to={0}
          top
        />
      </View>
      {hasPhoto ? (
        <View style={[styles.base, { height: height * 0.45 }]} pointerEvents="none">
          <AppFade
            id={`hero-base-${station.id}`}
            color={t.colors.textPrimary}
            from={BASE_SCRIM}
            to={0}
          />
        </View>
      ) : null}

      <View
        pointerEvents="none"
        style={[
          styles.float,
          { left: t.space[4], right: t.space[4], bottom: floatBottom, gap: t.space[2] },
        ]}
      >
        <AppGlass radius={t.radius.pill} appearance="light">
          <View
            style={[
              styles.row,
              { gap: t.space[2], height: t.space[8], paddingHorizontal: t.space[3] },
            ]}
          >
            <StatusDot color={statusColor} glow live={station.status === 'available'} />
            <AppText variant="caption" style={{ fontFamily: t.type.headline.fontFamily }}>
              {station.rawStatus || STATUS_LABEL[station.status]}
            </AppText>
          </View>
        </AppGlass>

        {many ? (
          <AppGlass radius={t.radius.pill} appearance="light">
            <View
              accessible
              accessibilityLabel={pageLabel(page + 1, images.length)}
              style={[
                styles.row,
                { gap: t.space[1], height: t.space[8], paddingHorizontal: t.space[3] },
              ]}
            >
              {images.map((url, index) => (
                <View
                  key={url}
                  style={{
                    width: index === page ? ACTIVE_DOT : DOT,
                    height: DOT,
                    borderRadius: t.radius.pill,
                    backgroundColor:
                      index === page ? t.colors.textPrimary : withAlpha(t.colors.textPrimary, 0.25),
                  }}
                />
              ))}
            </View>
          </AppGlass>
        ) : null}
      </View>
    </View>
  );
};

export default StationHero;

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  glow: {
    position: 'absolute',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  base: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  float: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
