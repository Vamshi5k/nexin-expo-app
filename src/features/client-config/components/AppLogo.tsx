import { AppBrandLogo, type AppBrandLogoProps } from '@/shared/components';

import { useClientConfig } from '../hooks';

export function AppLogo(props: Omit<AppBrandLogoProps, 'uri' | 'label'>) {
  const config = useClientConfig();
  return <AppBrandLogo {...props} uri={config.logoUri} label={config.brandName} />;
}
