import { Redirect, useLocalSearchParams } from 'expo-router';

import { isDevToolsEnabled, UiGalleryScreen } from '@/features/dev';

import { APP_ENV } from '@/core/config';

export default function DevUiRoute() {
  const { scheme, section } = useLocalSearchParams<{ scheme?: string; section?: string }>();
  if (!isDevToolsEnabled(APP_ENV)) return <Redirect href="/" />;
  return (
    <UiGalleryScreen
      initialScheme={scheme === 'dark' || scheme === 'light' ? scheme : undefined}
      section={section}
    />
  );
}
