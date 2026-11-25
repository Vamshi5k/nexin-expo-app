import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlatList } from 'react-native';

import { router } from 'expo-router';
import type MapView from 'react-native-maps';
import type { MapPressEvent } from 'react-native-maps';

import { brand } from '@/core/config';
import { haptics } from '@/shared/utils/haptics';

import { useMapClusters } from './useMapClusters';
import { useMapStations } from './useMapStations';
import { useStationFilters } from './useStationFilters';
import { useUserLocation } from './useUserLocation';
import { MY_LOCATION_ZOOM_DELTA, STATIONS_HREF } from '../constants/stations.constants';
import type {
  Coordinates,
  MapRegion,
  NearbyStation,
  StationFilters,
  StationPin,
} from '../types/stations.types';
import { countActiveFilters } from '../utils/filters';
import { regionAround } from '../utils/geo';

const { lat, lng, latDelta, lngDelta } = brand.defaultRegion;

export const DEFAULT_REGION: MapRegion = {
  latitude: lat,
  longitude: lng,
  latitudeDelta: latDelta,
  longitudeDelta: lngDelta,
};

const PAN_DURATION_MS = 350;

export const useMapScreen = () => {
  const mapRef = useRef<MapView>(null);
  const carouselRef = useRef<FlatList<NearbyStation>>(null);
  const latestRegion = useRef(DEFAULT_REGION);
  const centeredOnUser = useRef(false);

  const filters = useStationFilters(s => s.filters);
  const applyFilters = useStationFilters(s => s.apply);
  const clearFilters = useStationFilters(s => s.clear);

  const { location, locating, locate } = useUserLocation();
  const center: Coordinates = location ?? DEFAULT_REGION;

  const stations = useMapStations(center, filters);
  const clusters = useMapClusters(stations.pins, DEFAULT_REGION);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [peekPin, setPeekPin] = useState<StationPin | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const panTo = useCallback((point: Coordinates, delta?: number) => {
    const { latitudeDelta, longitudeDelta } = latestRegion.current;
    const region = delta ? regionAround(point, delta) : { ...point, latitudeDelta, longitudeDelta };

    mapRef.current?.animateToRegion(region, PAN_DURATION_MS);
  }, []);

  // When location was already allowed, move to the user once without asking.
  // Waits for the map: an animation sent before it is ready is dropped.
  useEffect(() => {
    if (!mapReady || !location || centeredOnUser.current) return;
    centeredOnUser.current = true;
    panTo(location, MY_LOCATION_ZOOM_DELTA);
  }, [mapReady, location, panTo]);

  const onRegionChangeComplete = (region: MapRegion) => {
    latestRegion.current = region;
    clusters.onRegionSettled(region);
  };

  const onPinPress = (pin: StationPin) => {
    haptics.selection();
    setSelectedId(pin.id);

    const index = stations.nearby.findIndex(station => station.id === pin.id);
    if (index === -1) {
      setPeekPin(pin);
      return;
    }

    setPeekPin(null);
    carouselRef.current?.scrollToIndex({ index, animated: true });
  };

  const onClusterPress = (clusterId: number, coordinate: Coordinates) => {
    mapRef.current?.animateToRegion(
      clusters.expansionRegion(clusterId, coordinate),
      PAN_DURATION_MS,
    );
  };

  const onMapPress = (event: MapPressEvent) => {
    if (event.nativeEvent.action === 'marker-press') return;
    setPeekPin(null);
    setSelectedId(null);
  };

  const onCardFocus = (index: number) => {
    const station = stations.nearby[index];
    if (!station || station.id === selectedId) return;

    haptics.selection();
    setSelectedId(station.id);
    setPeekPin(null);
    panTo(station);
  };

  const onLocate = async () => {
    const position = await locate();
    if (position) panTo(position, MY_LOCATION_ZOOM_DELTA);
  };

  const onApplyFilters = (next: StationFilters) => {
    applyFilters(next);
    setFiltersOpen(false);
  };

  const onClearFilters = () => {
    clearFilters();
    setFiltersOpen(false);
  };

  return {
    mapRef,
    carouselRef,
    initialRegion: DEFAULT_REGION,
    mapItems: clusters.items,
    nearby: stations.nearby,
    loadingNearby: stations.loadingNearby,
    failed: stations.failed,
    retry: stations.retry,
    selectedId,
    peekPin,
    locating,
    showUserDot: location !== null,
    filters,
    filtersOpen,
    activeFilterCount: countActiveFilters(filters),
    onMapReady: () => setMapReady(true),
    onRegionChangeComplete,
    onPinPress,
    onClusterPress,
    onMapPress,
    onCardFocus,
    onLocate,
    openFilters: () => setFiltersOpen(true),
    closeFilters: () => setFiltersOpen(false),
    onApplyFilters,
    onClearFilters,
    openStation: (stationId: string) =>
      router.push({ pathname: '/(app)/station/[stationId]', params: { stationId } }),
    openStationList: () => router.navigate(STATIONS_HREF.list),
  };
};
