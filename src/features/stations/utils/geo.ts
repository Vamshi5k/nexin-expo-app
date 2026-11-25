import type { Coordinates, MapRegion } from '../types/stations.types';

const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMH = 30;

export type Bounds = { west: number; south: number; east: number; north: number };

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function distanceKm(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

// Rough drive time at city speed, same rule as the old app.
export function formatEta(km: number): string {
  const minutes = Math.max(1, Math.round((km / AVERAGE_SPEED_KMH) * 60));
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

export function regionAround(point: Coordinates, delta: number): MapRegion {
  return { ...point, latitudeDelta: delta, longitudeDelta: delta };
}

export function regionToBounds(region: MapRegion): Bounds {
  return {
    west: region.longitude - region.longitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    north: region.latitude + region.latitudeDelta / 2,
  };
}

export function regionToZoom(region: MapRegion): number {
  const zoom = Math.log2(360 / region.longitudeDelta);
  return Math.max(0, Math.min(20, Math.round(zoom)));
}

export function zoomToDelta(zoom: number): number {
  return 360 / 2 ** zoom;
}
