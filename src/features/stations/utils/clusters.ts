import Supercluster from 'supercluster';

import { regionToBounds, regionToZoom, zoomToDelta } from './geo';
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS_PX } from '../constants/stations.constants';
import type { Coordinates, MapRegion, StationPin } from '../types/stations.types';

type PinProps = { pin: StationPin };

export type ClusterIndex = Supercluster<PinProps>;

export type MapItem =
  | { kind: 'pin'; key: string; pin: StationPin }
  | { kind: 'cluster'; key: string; clusterId: number; count: number; coordinate: Coordinates };

export function createClusterIndex(pins: StationPin[]): ClusterIndex {
  const index = new Supercluster<PinProps>({
    radius: CLUSTER_RADIUS_PX,
    maxZoom: CLUSTER_MAX_ZOOM,
  });

  index.load(
    pins.map(pin => ({
      type: 'Feature',
      properties: { pin },
      geometry: { type: 'Point', coordinates: [pin.longitude, pin.latitude] },
    })),
  );

  return index;
}

export function mapItemsInRegion(index: ClusterIndex, region: MapRegion): MapItem[] {
  const { west, south, east, north } = regionToBounds(region);
  const features = index.getClusters([west, south, east, north], regionToZoom(region));

  return features.map(feature => {
    const [longitude, latitude] = feature.geometry.coordinates;

    if ('cluster' in feature.properties && feature.properties.cluster) {
      const { cluster_id: clusterId, point_count: count } = feature.properties;
      return {
        kind: 'cluster',
        key: `cluster-${clusterId}`,
        clusterId,
        count,
        coordinate: { latitude, longitude },
      };
    }

    const { pin } = feature.properties as PinProps;
    return { kind: 'pin', key: `pin-${pin.id}`, pin };
  });
}

export function clusterExpansionRegion(
  index: ClusterIndex,
  clusterId: number,
  coordinate: Coordinates,
): MapRegion {
  const zoom = Math.min(index.getClusterExpansionZoom(clusterId), CLUSTER_MAX_ZOOM + 1);
  const delta = zoomToDelta(zoom);
  return { ...coordinate, latitudeDelta: delta, longitudeDelta: delta };
}
