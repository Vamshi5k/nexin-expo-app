import { useEffect, useState } from 'react';
import { Image } from 'react-native';

import { brand } from '@/core/config';
import { images } from '@/shared/assets/images';

export type AppBrandLogoProps = {
  height?: number;
  uri?: string | null;
  label?: string;
};

function assetRatio(): number {
  const s = Image.resolveAssetSource(images.logo);
  return s?.width && s.height ? s.width / s.height : 1;
}

const AppBrandLogo = ({ height = 40, uri, label }: AppBrandLogoProps) => {
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
      source={remote ? { uri: remote } : images.logo}
      onError={() => remote && setFailedUri(remote)}
      accessibilityRole="image"
      accessibilityLabel={label ?? brand.appName}
      style={{ height, width: height * ratio }}
      resizeMode="contain"
    />
  );
};

export default AppBrandLogo;
