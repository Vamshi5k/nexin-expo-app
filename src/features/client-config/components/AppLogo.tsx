import { AppBrandLogo, type AppBrandLogoProps } from '@/shared/components';

import { useClientConfig } from '../hooks/useClientConfig';

type AppLogoProps = Omit<AppBrandLogoProps, 'uri' | 'label'>;

const AppLogo = (props: AppLogoProps) => {
  const config = useClientConfig();

  return <AppBrandLogo {...props} uri={config.logoUri} label={config.brandName} />;
};

export default AppLogo;
