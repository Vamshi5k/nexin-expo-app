import { Platform, TurboModuleRegistry } from 'react-native';

import { googleMapsOnAndroid } from '@/core/config';

export type MapsSupport = 'ready' | 'needs-rebuild' | 'needs-key';

// react-native-maps throws on import when the installed build has no native module (an old dev
// build or Expo Go), and Google Maps crashes on Android without an API key. Check both first.
function detectMapsSupport(): MapsSupport {
  if (!TurboModuleRegistry.get('RNMapsAirModule')) return 'needs-rebuild';
  if (Platform.OS === 'android' && !googleMapsOnAndroid) return 'needs-key';
  return 'ready';
}

export const mapsSupport: MapsSupport = detectMapsSupport();
