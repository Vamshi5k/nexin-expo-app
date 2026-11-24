import { Redirect, useLocalSearchParams } from 'expo-router';

import { APP_ENV } from '@/core/config';
import { CookieCheckScreen } from '@/dev/CookieCheckScreen';
import { isDevToolsEnabled } from '@/dev/devTools';

export default function DevCookieCheckRoute() {
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  if (!isDevToolsEnabled(APP_ENV)) return <Redirect href="/" />;
  return <CookieCheckScreen autoRunLocal={auto === 'local'} />;
}
