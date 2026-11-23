import { Redirect, useLocalSearchParams } from 'expo-router';

import { APP_ENV } from '@/core/config';
import { isDevToolsEnabled } from '@/dev/devTools';
import { UiGalleryScreen } from '@/dev/UiGalleryScreen';

/** /dev/ui?scheme=dark&section=toasts (non-production only). */
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
