import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { statusOf } from '@/core/api';

export const queryKeys = {
  clientConfig: () => ['client-config'] as const,
  me: () => ['me'] as const,
  fleetMe: () => ['fleet-me'] as const,
} as const;

export const QUERY_STALE_TIME_MS = 30_000;
const MAX_RETRIES = 1;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = statusOf(error);
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, staleTime: QUERY_STALE_TIME_MS },
      mutations: { retry: false },
    },
  });
}

let wired = false;

export function wireQueryManagers(): () => void {
  if (wired) return () => undefined;
  wired = true;
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
  );
  const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
    if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
  });
  return () => {
    sub.remove();
    wired = false;
  };
}
