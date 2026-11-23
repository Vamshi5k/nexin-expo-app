import { Image } from 'react-native';

import { brand } from '@/core/config';

const LOGO = require('../../brand/assets/logo.png');

export type BrandLogoProps = {
  height?: number;
};

/** Build-time logo from brand/assets. Phase 2 swaps in the runtime logo from /client/info. */
export function BrandLogo({ height = 40 }: BrandLogoProps) {
  const source = Image.resolveAssetSource(LOGO);
  const ratio = source?.width && source.height ? source.width / source.height : 1;
  return (
    <Image
      source={LOGO}
      accessibilityRole="image"
      accessibilityLabel={brand.appName}
      style={{ height, width: height * ratio }}
      resizeMode="contain"
    />
  );
}
