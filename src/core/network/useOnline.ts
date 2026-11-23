import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

/** null while unknown (first render); only false means definitely offline. */
export function useOnline(): boolean | null {
  const { isConnected } = useNetInfo();
  return isConnected;
}

/** Re-checks connectivity now; resolves true if online. */
export async function recheckOnline(): Promise<boolean> {
  const state = await NetInfo.refresh();
  return state.isConnected !== false;
}
