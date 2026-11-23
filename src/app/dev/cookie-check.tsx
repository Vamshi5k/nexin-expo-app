import { Redirect, useLocalSearchParams } from 'expo-router';

import { APP_ENV } from '@/core/config';
import { CookieCheckScreen } from '@/dev/CookieCheckScreen';
import { isDevToolsEnabled } from '@/dev/devTools';

/** TEMPORARY: /dev/cookie-check (non-production only). Remove after Phase 2 step 0. */
export default function DevCookieCheckRoute() {
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  if (!isDevToolsEnabled(APP_ENV)) return <Redirect href="/" />;
  return <CookieCheckScreen autoRunLocal={auto === 'local'} />;
}
