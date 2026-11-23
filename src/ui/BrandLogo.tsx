import { useEffect, useState } from 'react';
import { Image } from 'react-native';

import { brand } from '@/core/config';

const LOGO = require('../../brand/assets/logo.png');

export type BrandLogoProps = {
  height?: number;
  /**
   * Runtime logo (data: URI or https URL), e.g. from /client/info. Falls back to the
   * build-time asset in brand/assets when null or when it fails to load.
   */
  uri?: string | null;
  /** Accessibility label. Defaults to the build-time app name. */
  label?: string;
};

function assetRatio(): number {
  const s = Image.resolveAssetSource(LOGO);
  return s?.width && s.height ? s.width / s.height : 1;
}

/**
 * The client logo. src/ui can't read feature state, so screens pass the runtime uri
 * (features/client-config exports <AppLogo/>, which does).
 */
export function BrandLogo({ height = 40, uri, label }: BrandLogoProps) {
  // Both are keyed by uri, so a new uri starts clean without resetting state in an effect.
  const [measured, setMeasured] = useState<{ uri: string; ratio: number } | null>(null);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const remote = uri && uri !== failedUri ? uri : null;
  const ratio = remote && measured?.uri === remote ? measured.ratio : assetRatio();

  useEffect(() => {
    if (!uri) return;
    let alive = true;
    Image.getSize(
      uri,
      (w, h) => alive && h > 0 && setMeasured({ uri, ratio: w / h }),
      () => alive && setFailedUri(uri),
    );
    return () => {
      alive = false;
    };
  }, [uri]);

  return (
    <Image
      source={remote ? { uri: remote } : LOGO}
      onError={() => remote && setFailedUri(remote)}
      accessibilityRole="image"
      accessibilityLabel={label ?? brand.appName}
      style={{ height, width: height * ratio }}
      resizeMode="contain"
    />
  );
}
