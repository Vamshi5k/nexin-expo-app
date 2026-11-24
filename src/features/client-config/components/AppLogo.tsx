import { BrandLogo, type BrandLogoProps } from '@/ui';

import { useClientConfig } from '../ClientConfigContext';

export function AppLogo(props: Omit<BrandLogoProps, 'uri' | 'label'>) {
  const config = useClientConfig();
  return <BrandLogo {...props} uri={config.logoUri} label={config.brandName} />;
}
