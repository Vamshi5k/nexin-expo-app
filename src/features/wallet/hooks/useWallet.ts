import { useCallback, useState } from 'react';

import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/features/auth';

import { useRequest } from '@/core/request';

import { walletApi } from '../api/wallet.api';
import { TRANSACTIONS_PREVIEW, WALLET_HREF } from '../constants/wallet.constants';

const loadRecent = () => walletApi.getTransactions(1, TRANSACTIONS_PREVIEW);

// The Wallet tab: balance from the signed-in user, the latest transactions, and a quiet reload
// each time the tab comes back into view (no skeleton flash, unlike the old app).
export const useWallet = () => {
  const { user, loadUser } = useAuth();
  const recent = useRequest(loadRecent);
  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { refetch } = recent;

  useFocusEffect(
    useCallback(() => {
      void loadUser().catch(() => undefined);
      void refetch();
    }, [loadUser, refetch]),
  );

  const refresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await Promise.all([loadUser().catch(() => undefined), refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  const transactions = recent.data?.items ?? [];
  const state = (() => {
    if (recent.data === undefined && !recent.error) return 'loading' as const;
    if (recent.error && !recent.data) return 'error' as const;
    if (!transactions.length) return 'empty' as const;
    return 'ready' as const;
  })();

  return {
    state,
    balancePaise: user?.walletBalancePaise ?? 0,
    hidden,
    transactions,
    refreshing,
    toggleHidden: () => setHidden(value => !value),
    refresh,
    retry: () => void refetch(),
    addMoney: () => router.push(WALLET_HREF.add),
    seeAll: () => router.push(WALLET_HREF.history),
  };
};
