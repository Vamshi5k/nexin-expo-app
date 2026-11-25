import type { Coordinates } from '../types/stations.types';

export type DirectionsPlatform = 'ios' | 'android';

// Turn-by-turn in the phone's own maps app, with a web fallback that works everywhere.
export function directionsUrls(
  { latitude, longitude }: Coordinates,
  platform: DirectionsPlatform,
): { app: string; web: string } {
  const point = `${latitude},${longitude}`;

  return {
    app: platform === 'ios' ? `maps://?daddr=${point}` : `google.navigation:q=${point}`,
    web: `https://www.google.com/maps/dir/?api=1&destination=${point}`,
  };
}
