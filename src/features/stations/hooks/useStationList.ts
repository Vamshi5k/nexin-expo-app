import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentRef, RefObject } from 'react';
import type { TextInput } from 'react-native';

import { router, useFocusEffect } from 'expo-router';

import { getErrorMessage } from '@/core/api';
import { brand } from '@/core/config';
import { useRequest } from '@/core/request';
import { useDebouncedValue } from '@/shared/utils/debounce';
import { toast } from '@/shared/utils/toast';

import { openStationDirections } from './useDirections';
import { useUserLocation } from './useUserLocation';
import { stationsApi } from '../api/stations.api';
import {
  DETAILS_COPY,
  LIST_COPY,
  SEARCH_DEBOUNCE_MS,
  STATIONS_PAGE_SIZE,
} from '../constants/stations.constants';
import type { Coordinates, NearbyStation } from '../types/stations.types';
import { appendPage, hasMorePages } from '../utils/list';

// Pages after the first, kept per search so a new search starts clean.
type MorePages = {
  key: string;
  items: NearbyStation[];
  page: number;
  hasMore: boolean;
};

type StationListOptions = {
  focusSearch: boolean;
  inputRef: RefObject<ComponentRef<typeof TextInput> | null>;
};

export type StationListState = 'loading' | 'location-off' | 'error' | 'empty' | 'ready';

const BRAND_CENTER: Coordinates = {
  latitude: brand.defaultRegion.lat,
  longitude: brand.defaultRegion.lng,
};

// Rounded so GPS jitter doesn't reload the list; about 100 m.
const keyFor = (center: Coordinates, search: string) =>
  `${center.latitude.toFixed(3)},${center.longitude.toFixed(3)}|${search}`;

// The Stations tab: nearest stations a page at a time, a debounced search, and hearts that
// flip at once and roll back if the server refuses. Answers for an older search are dropped.
export const useStationList = ({ focusSearch, inputRef }: StationListOptions) => {
  const { location, permission, readFailed, locate } = useUserLocation();
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const center = location ?? (readFailed ? BRAND_CENTER : null);
  const key = center ? keyFor(center, search) : null;
  // Lets a slow "load more" notice that the search moved on while it was waiting.
  const latestKey = useRef(key);
  useEffect(() => {
    latestKey.current = key;
  }, [key]);

  // Page 1 reloads whenever the place or the search term changes.
  const loadFirst = useCallback(
    () =>
      center
        ? stationsApi.searchStations({ center, search, page: 1, limit: STATIONS_PAGE_SIZE })
        : Promise.resolve([]),
    // `center` is captured through `key`; a new object with the same place must not reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const first = useRequest(loadFirst, { enabled: key !== null });

  const [more, setMore] = useState<MorePages | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const extra = more && more.key === key ? more : null;
  const firstPage = first.data ?? [];
  const stations = extra ? appendPage(firstPage, extra.items) : firstPage;
  const hasMore = extra ? extra.hasMore : hasMorePages(firstPage.length, STATIONS_PAGE_SIZE);

  // Opened from the map's search pill: put the cursor in the field.
  useEffect(() => {
    if (!focusSearch) return;
    inputRef.current?.focus();
    router.setParams({ focus: undefined });
  }, [focusSearch, inputRef]);

  const state: StationListState = (() => {
    if (permission === 'off' && !center) return 'location-off';
    if (first.data === undefined && !first.error) return 'loading';
    if (first.error && !first.data) return 'error';
    if (!stations.length) return 'empty';
    return 'ready';
  })();

  const loadMore = async () => {
    if (state !== 'ready' || !center || !key || loadingMore || !hasMore) return;

    const page = (extra?.page ?? 1) + 1;
    setLoadingMore(true);
    try {
      const items = await stationsApi.searchStations({
        center,
        search,
        page,
        limit: STATIONS_PAGE_SIZE,
      });
      if (latestKey.current !== key) return;

      setMore(prev => ({
        key,
        items: prev && prev.key === key ? appendPage(prev.items, items) : items,
        page,
        hasMore: hasMorePages(items.length, STATIONS_PAGE_SIZE),
      }));
    } catch {
      if (latestKey.current === key) toast.error(LIST_COPY.loadMoreError);
    } finally {
      setLoadingMore(false);
    }
  };

  // Favourites: the server's list, with taps applied on top until the next sync.
  const favourites = useRequest(stationsApi.getFavouriteIds);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { refetch: refetchFavourites } = favourites;

  // Back from Station Details (or anywhere a heart changed): pick up the server's list again.
  useFocusEffect(
    useCallback(() => {
      void refetchFavourites().then(() => setOverrides({}));
    }, [refetchFavourites]),
  );

  const isFavourite = (stationId: string) =>
    overrides[stationId] ?? favourites.data?.includes(stationId) ?? false;

  const toggleFavourite = async (stationId: string) => {
    if (saving) return;

    const next = !isFavourite(stationId);
    setOverrides(prev => ({ ...prev, [stationId]: next }));
    setSaving(stationId);
    try {
      await stationsApi.setFavourite(stationId, next);
      toast.success(next ? DETAILS_COPY.added : DETAILS_COPY.removed);
    } catch (error) {
      setOverrides(prev => ({ ...prev, [stationId]: !next }));
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(null);
    }
  };

  const refresh = async () => {
    if (refreshing || !key) return;

    setRefreshing(true);
    try {
      setMore(null);
      await Promise.all([first.refetch(), refetchFavourites()]);
      setOverrides({});
    } finally {
      setRefreshing(false);
    }
  };

  return {
    state,
    stations,
    error: first.error,
    query,
    search,
    loadingMore,
    refreshing,
    setQuery,
    clearSearch: () => setQuery(''),
    loadMore,
    retry: () => void first.refetch(),
    refresh,
    enableLocation: locate,
    isFavourite,
    toggleFavourite,
    openDirections: openStationDirections,
    openStation: (stationId: string) =>
      router.push({ pathname: '/(app)/station/[stationId]', params: { stationId } }),
  };
};
