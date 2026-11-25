import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { REGION_SETTLE_MS } from '../constants/stations.constants';
import type { Coordinates, MapRegion, StationPin } from '../types/stations.types';
import { clusterExpansionRegion, createClusterIndex, mapItemsInRegion } from '../utils/clusters';

export const useMapClusters = (pins: StationPin[], initialRegion: MapRegion) => {
  const [settledRegion, setSettledRegion] = useState(initialRegion);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const index = useMemo(() => createClusterIndex(pins), [pins]);
  const items = useMemo(() => mapItemsInRegion(index, settledRegion), [index, settledRegion]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onRegionSettled = useCallback((region: MapRegion) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSettledRegion(region), REGION_SETTLE_MS);
  }, []);

  const expansionRegion = useCallback(
    (clusterId: number, coordinate: Coordinates) =>
      clusterExpansionRegion(index, clusterId, coordinate),
    [index],
  );

  return { items, region: settledRegion, onRegionSettled, expansionRegion };
};
