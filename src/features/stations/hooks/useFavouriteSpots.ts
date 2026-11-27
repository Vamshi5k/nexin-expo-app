import { useCallback, useRef, useState } from 'react';

import { router, useFocusEffect } from 'expo-router';

import { getErrorMessage } from '@/core/api';
import { useRequest } from '@/core/request';
import { useDebouncedValue } from '@/shared/utils/debounce';
import { toast } from '@/shared/utils/toast';

import { openStationDirections } from './useDirections';
import { useUserLocation } from './useUserLocation';
import { FAVOURITES_PAGE_SIZE, stationsApi } from '../api/stations.api';
import {
  FAVOURITES_COPY,
  FAVOURITES_HREF,
  SEARCH_DEBOUNCE_MS,
} from '../constants/stations.constants';
import type { FavouriteStation } from '../types/stations.types';
import { distanceKm } from '../utils/geo';
import { hasMorePages } from '../utils/list';

type Extra = { key: string; items: FavouriteStation[]; page: number; hasMore: boolean };

// Saved stations a page at a time with a debounced search. Coming back to the screen reloads
// the first page, so a station hearted on Station Details is already here. The heart removes a
// station at once and puts it back if the server says no.
export const useFavouriteSpots = () => {
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const [extra, setExtra] = useState<Extra | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [removed, setRemoved] = useState<string[]>([]);
  const firstFocus = useRef(true);
  const { location } = useUserLocation();

  const loadFirst = useCallback(() => stationsApi.getFavourites(1, search), [search]);
  const first = useRequest(loadFirst);
  const { refetch } = first;

  const reload = useCallback(async () => {
    setExtra(null);
    setRemoved([]);
    await refetch();
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void reload();
    }, [reload]),
  );

  const firstItems = first.data?.items ?? [];
  const items = extra && extra.key === search ? [...firstItems, ...extra.items] : firstItems;
  const seen = new Set<string>();
  const stations = items
    .filter(station => {
      if (seen.has(station.id) || removed.includes(station.id)) return false;
      seen.add(station.id);
      return true;
    })
    .map(station => ({
      ...station,
      distanceKm:
        location && station.coordinates ? distanceKm(location, station.coordinates) : null,
    }));
  const hasMore =
    extra && extra.key === search
      ? extra.hasMore
      : first.data
        ? first.data.page < first.data.totalPages ||
          hasMorePages(first.data.items.length, FAVOURITES_PAGE_SIZE)
        : false;

  const loadMore = async () => {
    if (!first.data || loadingMore || !hasMore) return;

    const key = search;
    const page = (extra && extra.key === key ? extra.page : 1) + 1;
    setLoadingMore(true);
    try {
      const next = await stationsApi.getFavourites(page, key);
      setExtra(prev => ({
        key,
        items: prev && prev.key === key ? [...prev.items, ...next.items] : next.items,
        page,
        hasMore: next.page < next.totalPages,
      }));
    } catch {
      toast.error(FAVOURITES_COPY.loadMoreError);
    } finally {
      setLoadingMore(false);
    }
  };

  const remove = async (station: FavouriteStation) => {
    if (removed.includes(station.id)) return;

    setRemoved(current => [...current, station.id]);
    try {
      await stationsApi.setFavourite(station.id, false);
      toast.success(FAVOURITES_COPY.removed);
    } catch (error) {
      setRemoved(current => current.filter(id => id !== station.id));
      toast.error(getErrorMessage(error));
    }
  };

  const refresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return {
    query,
    setQuery,
    clearSearch: () => setQuery(''),
    searching: search.length > 0,
    stations,
    loading: !first.data && first.loading,
    failed: !first.data && !first.loading && !!first.error,
    errorMessage: getErrorMessage(first.error),
    empty: !!first.data && stations.length === 0,
    loadingMore,
    loadMore: () => void loadMore(),
    refreshing,
    refresh: () => void refresh(),
    retry: () => void refetch(),
    remove: (station: FavouriteStation) => void remove(station),
    open: (station: FavouriteStation) =>
      router.push({ pathname: '/(app)/station/[stationId]', params: { stationId: station.id } }),
    directions: (station: FavouriteStation) => {
      if (station.coordinates) openStationDirections(station.coordinates);
    },
    findStations: () => router.navigate(FAVOURITES_HREF.map),
  };
};
