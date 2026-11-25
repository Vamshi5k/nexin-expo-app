import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useRequest } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { stationsApi } from '../api/stations.api';
import { ERROR_TOAST_COOLDOWN_MS, MAP_COPY, NEARBY_LIMIT } from '../constants/stations.constants';
import type { Coordinates, StationFilters } from '../types/stations.types';

export const useMapStations = (center: Coordinates, filters: StationFilters) => {
  const { latitude, longitude } = center;

  const loadPins = useCallback(() => stationsApi.getLocations(filters), [filters]);
  const loadNearby = useCallback(
    () => stationsApi.getNearby({ latitude, longitude }, filters, NEARBY_LIMIT),
    [latitude, longitude, filters],
  );

  const pins = useRequest(loadPins);
  const nearby = useRequest(loadNearby);

  const failed = Boolean(pins.error || nearby.error);
  const lastToastAt = useRef(0);

  useEffect(() => {
    if (!failed) return;

    const now = Date.now();
    if (now - lastToastAt.current < ERROR_TOAST_COOLDOWN_MS) return;

    lastToastAt.current = now;
    toast.error(MAP_COPY.loadError);
  }, [failed]);

  const { refetch: refetchPins } = pins;
  const { refetch: refetchNearby } = nearby;

  const retry = useCallback(async () => {
    await Promise.all([refetchPins(), refetchNearby()]);
  }, [refetchPins, refetchNearby]);

  const pinList = useMemo(() => pins.data ?? [], [pins.data]);
  const nearbyList = useMemo(() => nearby.data ?? [], [nearby.data]);

  return {
    pins: pinList,
    nearby: nearbyList,
    loadingNearby: nearby.loading,
    failed,
    retry,
  };
};
