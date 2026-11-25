import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

export const useOnline = (): boolean | null => {
  const { isConnected } = useNetInfo();
  return isConnected;
};

export async function recheckOnline(): Promise<boolean> {
  const state = await NetInfo.refresh();
  return state.isConnected !== false;
}

export const OFFLINE_COPY = {
  title: 'No Connection',
  body: "You're offline. Check your Wi-Fi or mobile data and try again.",
  stillOffline: 'Still offline — check your settings',
  retry: 'Try Again',
} as const;
