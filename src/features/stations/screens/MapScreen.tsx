import { useContext, useState, type ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomTabBarHeightContext } from 'expo-router/tabs';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppGlass, AppText } from '@/shared/components';

import FiltersSheet from '../components/FiltersSheet';
import MapLocateButton from '../components/MapLocateButton';
import MapTopBar, { mapTopBarHeight } from '../components/MapTopBar';
import MapUnavailable from '../components/MapUnavailable';
import NearbyCarousel from '../components/NearbyCarousel';
import type { StationMapProps } from '../components/StationMap';
import StationPeekCard from '../components/StationPeekCard';

import { useTheme } from '@/shared/theme';

import { mapsSupport } from '@/core/maps';
import { riseIn } from '@/shared/utils/motion';

import { MAP_COPY } from '../constants/stations.constants';
import { useMapScreen } from '../hooks/useMapScreen';

// Loaded only when the native module exists, so an old build shows a notice instead of crashing.
const StationMap: ComponentType<StationMapProps> | null =
  mapsSupport === 'ready'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('../components/StationMap') as typeof import('../components/StationMap')).default
    : null;

const MapScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? insets.bottom;
  const [overlayHeight, setOverlayHeight] = useState(0);
  const { mapRef, carouselRef, ...map } = useMapScreen();

  const mapPadding = {
    top: insets.top + mapTopBarHeight(t) + t.space[2],
    right: 0,
    bottom: tabBarHeight + overlayHeight,
    left: 0,
  };

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.surfaceSunken }]}>
      {StationMap ? (
        <StationMap
          mapRef={mapRef}
          initialRegion={map.initialRegion}
          items={map.mapItems}
          selectedId={map.selectedId}
          showUserDot={map.showUserDot}
          padding={mapPadding}
          onMapReady={map.onMapReady}
          onRegionChangeComplete={map.onRegionChangeComplete}
          onMapPress={map.onMapPress}
          onPinPress={map.onPinPress}
          onClusterPress={map.onClusterPress}
        />
      ) : (
        <MapUnavailable reason={mapsSupport === 'ready' ? 'needs-rebuild' : mapsSupport} />
      )}

      <MapTopBar
        activeFilterCount={map.activeFilterCount}
        onSearch={map.openStationList}
        onFilters={map.openFilters}
      />

      <View
        pointerEvents="box-none"
        onLayout={event => setOverlayHeight(event.nativeEvent.layout.height)}
        style={[
          styles.bottom,
          { bottom: tabBarHeight, gap: t.space[3], paddingBottom: t.space[3] },
        ]}
      >
        <Animated.View
          entering={riseIn(2)}
          pointerEvents="box-none"
          style={[styles.fabs, { paddingHorizontal: t.space[4] }]}
        >
          <MapLocateButton locating={map.locating} onPress={map.onLocate} />
        </Animated.View>

        {map.failed ? (
          <View style={{ paddingHorizontal: t.space[4] }}>
            <AppGlass
              radius={t.radius.card}
              style={[
                styles.row,
                { gap: t.space[3], padding: t.space[3], paddingLeft: t.space[4] },
              ]}
            >
              <AppText variant="subhead" style={styles.grow}>
                {MAP_COPY.loadErrorShort}
              </AppText>
              <AppButton
                label={MAP_COPY.retry}
                size="medium"
                variant="secondary"
                onPress={map.retry}
              />
            </AppGlass>
          </View>
        ) : null}

        <View>
          <NearbyCarousel
            listRef={carouselRef}
            stations={map.nearby}
            loading={map.loadingNearby}
            hidden={map.peekPin !== null}
            selectedId={map.selectedId}
            hasFilters={map.activeFilterCount > 0}
            onFocus={map.onCardFocus}
            onPressStation={map.openStation}
            onDirections={map.openDirections}
            onViewAll={map.openStationList}
            onClearFilters={map.onClearFilters}
          />
          {map.peekPin ? (
            <View pointerEvents="box-none" style={[styles.peek, { paddingHorizontal: t.space[4] }]}>
              <StationPeekCard key={map.peekPin.id} pin={map.peekPin} onPress={map.openStation} />
            </View>
          ) : null}
        </View>
      </View>

      <FiltersSheet
        open={map.filtersOpen}
        filters={map.filters}
        onApply={map.onApplyFilters}
        onClear={map.onClearFilters}
        onClose={map.closeFilters}
      />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fabs: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  peek: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
