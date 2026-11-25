import type { ImageSourcePropType } from 'react-native';

// Per-client artwork lives in brand/assets; components read it from here only.
export const images = {
  logo: require('../../../brand/assets/logo.png') as ImageSourcePropType,
  splash: require('../../../brand/assets/splash.png') as ImageSourcePropType,
};
