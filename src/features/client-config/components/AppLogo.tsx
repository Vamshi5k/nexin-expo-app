import { BrandLogo, type BrandLogoProps } from '@/shared/components';

import { useClientConfig } from '../hooks';

export function AppLogo(props: Omit<BrandLogoProps, 'uri' | 'label'>) {
  const config = useClientConfig();
  return <BrandLogo {...props} uri={config.logoUri} label={config.brandName} />;
}
