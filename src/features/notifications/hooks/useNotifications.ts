import { useCallback, useEffect, useRef, useState } from 'react';

import { useFocusEffect } from 'expo-router';

import { getErrorMessage } from '@/core/api';
import { useRequest } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { notificationsApi } from '../api/notifications.api';
import { NOTIFICATION_FILTERS, NOTIFICATIONS_COPY } from '../constants/notifications.constants';
import type { AppNotification, NotificationFilter } from '../types/notifications.types';
import { countByFilter, filterNotifications, groupByDay } from '../utils/notifications';

const firstPage = () => notificationsApi.getPage(1);

// Pages of notifications with category filters on the device, grouped by day. Opening one marks
// it read on this device and shows the whole message; coming back refreshes the list.
export const useNotifications = () => {
  const first = useRequest(firstPage);
  const [more, setMore] = useState<{
    items: AppNotification[];
    page: number;
    totalPages: number;
  } | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [read, setRead] = useState<string[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [failedMore, setFailedMore] = useState(false);
  const firstFocus = useRef(true);
  const { refetch } = first;

  const reload = useCallback(async () => {
    setMore(null);
    setFailedMore(false);
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

  const seen = new Set<string>();
  const all = [...(first.data?.items ?? []), ...(more?.items ?? [])]
    .filter(item => (seen.has(item.id) ? false : (seen.add(item.id), true)))
    .map(item => (read.includes(item.id) ? { ...item, read: true } : item));
  const page = more?.page ?? first.data?.page ?? 1;
  const totalPages = more?.totalPages ?? first.data?.totalPages ?? 1;
  const shown = filterNotifications(all, filter);

  const loadMore = async () => {
    if (!first.data || loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    setFailedMore(false);
    try {
      const next = await notificationsApi.getPage(page + 1);
      setMore(prev => ({
        items: [...(prev?.items ?? []), ...next.items],
        page: next.page,
        totalPages: next.totalPages,
      }));
    } catch {
      setFailedMore(true);
      toast.error(NOTIFICATIONS_COPY.loadMoreError);
    } finally {
      setLoadingMore(false);
    }
  };

  // A category may have nothing in the loaded pages yet; fetch on until some show up.
  const hasMore = page < totalPages;
  const needsMore = !!first.data && !shown.length && hasMore && !loadingMore && !failedMore;
  useEffect(() => {
    if (!needsMore) return;
    const timer = setTimeout(() => void loadMore(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsMore, page]);

  const refresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return {
    filter,
    setFilter,
    filters: NOTIFICATION_FILTERS.map(value => ({ value, count: countByFilter(all, value) })),
    unread: all.filter(item => !item.read).length,
    groups: groupByDay(shown, new Date()),
    loading: !first.data && first.loading,
    failed: !first.data && !first.loading && !!first.error,
    errorMessage: getErrorMessage(first.error),
    empty: !!first.data && shown.length === 0 && (!hasMore || failedMore),
    loadingMore: loadingMore || needsMore,
    loadMore: () => void loadMore(),
    refreshing,
    refresh: () => void refresh(),
    retry: () => void refetch(),
    isOpen: (item: AppNotification) => open.includes(item.id),
    press: (item: AppNotification) => {
      setRead(current => (current.includes(item.id) ? current : [...current, item.id]));
      setOpen(current =>
        current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id],
      );
    },
  };
};
