import { useCallback, useEffect, useState } from 'react';

import * as Location from 'expo-location';

import { log } from '@/core/log';
import { checkPermission, requestPermission, showPermissionBlocked } from '@/core/permissions';
import { toast } from '@/shared/utils/toast';

import { MAP_COPY } from '../constants/stations.constants';
import type { Coordinates } from '../types/stations.types';

export type LocationPermission = 'checking' | 'granted' | 'off';

const readPosition = async (): Promise<Coordinates> => {
  const last = await Location.getLastKnownPositionAsync();
  const position =
    last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));

  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
};

// Never asks on its own: it only reads the location when permission is already on,
// and asks when the user taps my-location.
export const useUserLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  // 'checking' until the first permission check answers; lists show a skeleton meanwhile.
  const [permission, setPermission] = useState<LocationPermission>('checking');
  // Allowed but no fix (e.g. GPS off): callers fall back to the brand's default region.
  const [readFailed, setReadFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    const readIfAllowed = async () => {
      try {
        const granted = (await checkPermission('location')) === 'granted';
        if (alive) setPermission(granted ? 'granted' : 'off');
        if (!granted) return;
        const position = await readPosition();
        if (alive) setLocation(position);
      } catch (error) {
        log.warn('silent location read failed', { error: String(error) });
        if (alive) setReadFailed(true);
      }
    };

    void readIfAllowed();
    return () => {
      alive = false;
    };
  }, []);

  const locate = useCallback(async (): Promise<Coordinates | null> => {
    if (locating) return null;

    setLocating(true);
    try {
      const result = await requestPermission('location');
      setPermission(result === 'granted' ? 'granted' : 'off');
      if (result !== 'granted') {
        await showPermissionBlocked('location');
        return null;
      }

      const position = await readPosition();
      setLocation(position);
      return position;
    } catch (error) {
      log.warn('locate failed', { error: String(error) });
      toast.error(MAP_COPY.locationError);
      return null;
    } finally {
      setLocating(false);
    }
  }, [locating]);

  return { location, locating, permission, readFailed, locate };
};
