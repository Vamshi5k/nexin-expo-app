import { Platform, StyleSheet, View } from 'react-native';

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { AppButton, AppCard, AppText } from '@/shared/components';

import ClusterMarker from '../components/ClusterMarker';
import FiltersSheet from '../components/FiltersSheet';
import MapLocateButton from '../components/MapLocateButton';
import MapTopBar from '../components/MapTopBar';
import NearbyCarousel from '../components/NearbyCarousel';
import StationMarker from '../components/StationMarker';
import StationPeekCard from '../components/StationPeekCard';

import { useTheme } from '@/shared/theme';

import { googleMapsOnIos, mapStyle } from '@/core/config';

import { MAP_COPY } from '../constants/stations.constants';
import { useMapScreen } from '../hooks/useMapScreen';

const useGoogle = Platform.OS === 'android' || googleMapsOnIos;

const MapScreen = () => {
  const t = useTheme();
  const { mapRef, carouselRef, ...map } = useMapScreen();

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <MapView
        ref={mapRef}
        testID="station-map"
        style={StyleSheet.absoluteFill}
        provider={useGoogle ? PROVIDER_GOOGLE : undefined}
        customMapStyle={useGoogle ? mapStyle : undefined}
        initialRegion={map.initialRegion}
        showsUserLocation={map.showUserDot}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onRegionChangeComplete={map.onRegionChangeComplete}
        onPress={map.onMapPress}
      >
        {map.mapItems.map(item =>
          item.kind === 'cluster' ? (
            <ClusterMarker
              key={item.key}
              clusterId={item.clusterId}
              count={item.count}
              coordinate={item.coordinate}
              onPress={map.onClusterPress}
            />
          ) : (
            <StationMarker
              key={item.key}
              pin={item.pin}
              selected={item.pin.id === map.selectedId}
              onPress={map.onPinPress}
            />
          ),
        )}
      </MapView>

      <MapTopBar
        activeFilterCount={map.activeFilterCount}
        onSearch={map.openStationList}
        onFilters={map.openFilters}
      />

      <View
        pointerEvents="box-none"
        style={[styles.bottom, { gap: t.space[3], paddingBottom: t.space[4] }]}
      >
        <View
          pointerEvents="box-none"
          style={[styles.fabs, { paddingHorizontal: t.layout.screenPadding }]}
        >
          <MapLocateButton locating={map.locating} onPress={map.onLocate} />
        </View>

        {map.failed ? (
          <View style={{ paddingHorizontal: t.layout.screenPadding }}>
            <AppCard style={[styles.row, { gap: t.space[3] }]}>
              <AppText variant="callout" style={styles.grow}>
                {MAP_COPY.loadErrorShort}
              </AppText>
              <AppButton
                label={MAP_COPY.retry}
                size="medium"
                variant="secondary"
                onPress={map.retry}
              />
            </AppCard>
          </View>
        ) : null}

        <View>
          <View
            style={map.peekPin ? styles.hidden : undefined}
            pointerEvents={map.peekPin ? 'none' : 'auto'}
          >
            <NearbyCarousel
              listRef={carouselRef}
              stations={map.nearby}
              loading={map.loadingNearby}
              selectedId={map.selectedId}
              hasFilters={map.activeFilterCount > 0}
              onFocus={map.onCardFocus}
              onPressStation={map.openStation}
              onViewAll={map.openStationList}
              onClearFilters={map.onClearFilters}
            />
          </View>
          {map.peekPin ? (
            <View style={[styles.peek, { paddingHorizontal: t.layout.screenPadding }]}>
              <StationPeekCard pin={map.peekPin} onPress={map.openStation} />
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
    bottom: 0,
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
  hidden: {
    opacity: 0,
  },
  peek: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
