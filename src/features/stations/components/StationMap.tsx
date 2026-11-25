import type { RefObject } from 'react';
import { Platform, StyleSheet } from 'react-native';

import MapView, { PROVIDER_GOOGLE, type EdgePadding, type MapPressEvent } from 'react-native-maps';

import ClusterMarker from './ClusterMarker';
import StationMarker from './StationMarker';

import { googleMapsOnIos, mapStyle } from '@/core/config';

import type { Coordinates, MapRegion, StationPin } from '../types/stations.types';
import type { MapItem } from '../utils/clusters';

export type StationMapProps = {
  mapRef: RefObject<MapView | null>;
  initialRegion: MapRegion;
  items: MapItem[];
  selectedId: string | null;
  showUserDot: boolean;
  padding: EdgePadding;
  onMapReady: () => void;
  onRegionChangeComplete: (region: MapRegion) => void;
  onMapPress: (event: MapPressEvent) => void;
  onPinPress: (pin: StationPin) => void;
  onClusterPress: (clusterId: number, coordinate: Coordinates) => void;
};

const USE_GOOGLE = Platform.OS === 'android' || googleMapsOnIos;

const StationMap = ({
  mapRef,
  initialRegion,
  items,
  selectedId,
  showUserDot,
  padding,
  onMapReady,
  onRegionChangeComplete,
  onMapPress,
  onPinPress,
  onClusterPress,
}: StationMapProps) => (
  <MapView
    ref={mapRef}
    testID="station-map"
    style={StyleSheet.absoluteFill}
    provider={USE_GOOGLE ? PROVIDER_GOOGLE : undefined}
    customMapStyle={USE_GOOGLE ? mapStyle : undefined}
    initialRegion={initialRegion}
    mapPadding={padding}
    showsUserLocation={showUserDot}
    showsMyLocationButton={false}
    showsCompass={false}
    toolbarEnabled={false}
    onMapReady={onMapReady}
    onRegionChangeComplete={onRegionChangeComplete}
    onPress={onMapPress}
  >
    {items.map(item =>
      item.kind === 'cluster' ? (
        <ClusterMarker
          key={item.key}
          clusterId={item.clusterId}
          count={item.count}
          coordinate={item.coordinate}
          onPress={onClusterPress}
        />
      ) : (
        <StationMarker
          key={item.key}
          pin={item.pin}
          selected={item.pin.id === selectedId}
          onPress={onPinPress}
        />
      ),
    )}
  </MapView>
);

export default StationMap;
