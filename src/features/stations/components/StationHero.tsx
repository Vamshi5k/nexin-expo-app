import {
  FlatList,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFade, AppText } from '@/shared/components';

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
  onPageChange: (page: number) => void;
  onImageError: (url: string) => void;
};

// The scene fills the hero below the floating buttons, like a photo would.
const SCENE_TOP = 0.18;
const TOP_SCRIM_OPACITY = 0.4;
const BASE_SCRIM_OPACITY = 0.35;

// Photos (a paging slider with story-style segments) or the brand illustration, in a panel
// with a rounded base. Only the live status and the photo count sit on it; the name and
// figures live below on the page.
const StationHero = ({
  station,
  images,
  page,
  width,
  height,
  onPageChange,
  onImageError,
}: StationHeroProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const hasPhoto = images.length > 0;
  const many = images.length > 1;
  const statusColor = t.colors.connector[pinColorKey(station.status)];
  const segmentInk = hasPhoto ? t.colors.surface : t.colors.textPrimary;

  const onPageEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onPageChange(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const chip = {
    paddingHorizontal: t.space[3],
    height: t.space[6] + t.space[1],
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surface,
  };

  return (
    <View
      style={[
        styles.clip,
        {
          width,
          height,
          borderBottomLeftRadius: t.radius.card,
          borderBottomRightRadius: t.radius.card,
          backgroundColor: t.colors.surfaceSunken,
        },
      ]}
    >
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
            from={0.22}
            to={0.08}
            top
          />
          <View style={[styles.scene, { top: height * SCENE_TOP, bottom: t.space[12] }]}>
            <StationScene />
          </View>
        </View>
      )}

      {hasPhoto ? (
        <>
          <View style={[styles.top, { height: t.space[12] * 3 }]} pointerEvents="none">
            <AppFade
              id={`hero-top-${station.id}`}
              color={t.colors.textPrimary}
              from={TOP_SCRIM_OPACITY}
              to={0}
              top
            />
          </View>
          <View style={[styles.base, { height: t.space[12] * 2 }]} pointerEvents="none">
            <AppFade
              id={`hero-base-${station.id}`}
              color={t.colors.textPrimary}
              from={BASE_SCRIM_OPACITY}
              to={0}
            />
          </View>
        </>
      ) : null}

      {many ? (
        <View
          pointerEvents="none"
          style={[
            styles.segments,
            {
              top: insets.top + t.space[1],
              left: t.layout.screenPadding,
              right: t.layout.screenPadding,
              gap: t.space[1] + t.space[1] / 2,
            },
          ]}
        >
          {images.map((url, index) => (
            <View
              key={url}
              style={[
                styles.grow,
                {
                  height: 3,
                  borderRadius: t.radius.pill,
                  backgroundColor: withAlpha(segmentInk, index === page ? 0.95 : 0.3),
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      <View
        pointerEvents="none"
        style={[styles.chips, { left: t.space[3], right: t.space[3], bottom: t.space[3] }]}
      >
        <View style={[styles.row, chip, { gap: t.space[2] }]}>
          <StatusDot color={statusColor} live={station.status === 'available'} />
          <AppText variant="caption">{station.rawStatus || STATUS_LABEL[station.status]}</AppText>
        </View>
        {many ? (
          <View style={[styles.row, chip]}>
            <AppText variant="caption" tabular>
              {pageLabel(page + 1, images.length)}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default StationHero;

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  scene: {
    position: 'absolute',
    left: 0,
    right: 0,
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
  segments: {
    position: 'absolute',
    flexDirection: 'row',
  },
  chips: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
});
