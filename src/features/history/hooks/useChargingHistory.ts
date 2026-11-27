import { useCallback, useRef, useState } from 'react';

import { router, useFocusEffect } from 'expo-router';

import { getErrorMessage } from '@/core/api';
import { useRequest } from '@/core/request';

import { historyApi } from '../api/history.api';
import { HISTORY_TABS } from '../constants/history.constants';
import type { ChargingSession, HistoryTab } from '../types/history.types';
import { filterSessions, groupByMonth, sortSessions } from '../utils/history';

// The whole list at once (the API has no paging), newest first, filtered on the device. Coming
// back refreshes it quietly; every card opens its invoice.
export const useChargingHistory = () => {
  const request = useRequest(historyApi.getSessions);
  const [tab, setTab] = useState<HistoryTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const firstFocus = useRef(true);
  const { refetch } = request;

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void refetch();
    }, [refetch]),
  );

  const all = sortSessions(request.data ?? []);
  const shown = filterSessions(all, tab);
  const counts = Object.fromEntries(
    HISTORY_TABS.map(key => [key, filterSessions(all, key).length]),
  ) as Record<HistoryTab, number>;

  const refresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return {
    tab,
    setTab,
    counts,
    total: all.length,
    groups: groupByMonth(shown),
    loading: !request.data && request.loading,
    failed: !request.data && !request.loading && !!request.error,
    errorMessage: getErrorMessage(request.error),
    empty: !!request.data && shown.length === 0,
    refreshing,
    refresh: () => void refresh(),
    retry: () => void refetch(),
    open: (session: ChargingSession) =>
      router.push({ pathname: '/(app)/invoice/[id]', params: { id: session.id } }),
  };
};
