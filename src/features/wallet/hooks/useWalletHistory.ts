import { useEffect, useRef, useState } from 'react';

import { useRequest } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { walletApi } from '../api/wallet.api';
import { HISTORY_COPY, HISTORY_PAGE_SIZE } from '../constants/wallet.constants';
import type { TransactionFilter, WalletTransaction } from '../types/wallet.types';
import { appendTransactions, filterTransactions, groupByMonth } from '../utils/transactions';

const loadFirst = () => walletApi.getTransactions(1, HISTORY_PAGE_SIZE);

type MorePages = { items: WalletTransaction[]; page: number; totalPages: number };

// Wallet History: every transaction a page at a time, grouped by month, filtered on the device
// (the API has no type filter yet). A filter with nothing loaded keeps fetching pages.
export const useWalletHistory = () => {
  const first = useRequest(loadFirst);
  const [more, setMore] = useState<MorePages | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const generation = useRef(0);

  const firstPage = first.data;
  const all =
    more && firstPage ? appendTransactions(firstPage.items, more.items) : (firstPage?.items ?? []);
  const page = more?.page ?? firstPage?.page ?? 1;
  const totalPages = more?.totalPages ?? firstPage?.totalPages ?? 1;
  const hasMore = page < totalPages;
  const shown = filterTransactions(all, filter);

  const loadMore = async () => {
    if (!firstPage || loadingMore || !hasMore) return;

    const run = generation.current;
    setLoadingMore(true);
    try {
      const next = await walletApi.getTransactions(page + 1, HISTORY_PAGE_SIZE);
      if (run !== generation.current) return;
      setMore(prev => ({
        items: appendTransactions(prev?.items ?? [], next.items),
        page: next.page,
        totalPages: next.totalPages,
      }));
    } catch {
      if (run === generation.current) toast.error(HISTORY_COPY.loadMoreError);
    } finally {
      setLoadingMore(false);
    }
  };

  // Credit or Debit may have nothing in the loaded pages yet; fetch on until some show up.
  const needsMore = firstPage !== undefined && !shown.length && hasMore && !loadingMore;
  useEffect(() => {
    if (!needsMore) return;
    const timer = setTimeout(() => void loadMore(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsMore, page]);

  const refresh = async () => {
    if (refreshing) return;

    generation.current += 1;
    setRefreshing(true);
    try {
      setMore(null);
      await first.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const state = (() => {
    if (firstPage === undefined && !first.error) return 'loading' as const;
    if (first.error && !firstPage) return 'error' as const;
    if (!shown.length && !hasMore) return 'empty' as const;
    if (!shown.length) return 'loading' as const;
    return 'ready' as const;
  })();

  return {
    state,
    filter,
    sections: groupByMonth(shown),
    loadingMore,
    refreshing,
    setFilter,
    loadMore,
    refresh,
    retry: () => void first.refetch(),
  };
};
