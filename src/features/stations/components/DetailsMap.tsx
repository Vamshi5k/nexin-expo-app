import { Platform, StyleSheet } from 'react-native';

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import StationMarker from './StationMarker';

import { googleMapsOnIos, mapStyle } from '@/core/config';

import type { StationDetails } from '../types/stations.types';

export type DetailsMapProps = {
  station: StationDetails;
};

const USE_GOOGLE = Platform.OS === 'android' || googleMapsOnIos;
const ZOOM_DELTA = 0.012;
// Android's lite map ignores mapPadding, so centre a little north and the pin lands in the
// open space between the top buttons and the sheet.
const PIN_OFFSET = 0.18;

// A still map of the station, Uber-style: no gestures, the pin sits above the sheet.
const DetailsMap = ({ station }: DetailsMapProps) => (
  <MapView
    testID="station-details-map"
    style={StyleSheet.absoluteFill}
    provider={USE_GOOGLE ? PROVIDER_GOOGLE : undefined}
    customMapStyle={USE_GOOGLE ? mapStyle : undefined}
    initialRegion={{
      latitude: station.latitude + ZOOM_DELTA * PIN_OFFSET,
      longitude: station.longitude,
      latitudeDelta: ZOOM_DELTA,
      longitudeDelta: ZOOM_DELTA,
    }}
    liteMode
    scrollEnabled={false}
    zoomEnabled={false}
    rotateEnabled={false}
    pitchEnabled={false}
    toolbarEnabled={false}
    showsPointsOfInterests={false}
    pointerEvents="none"
  >
    <StationMarker
      pin={{
        id: station.id,
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        status: station.status,
      }}
      selected
      onPress={() => undefined}
    />
  </MapView>
);

export default DetailsMap;
