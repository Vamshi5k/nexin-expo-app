import { Redirect, useLocalSearchParams } from 'expo-router';

import { CookieCheckScreen, isDevToolsEnabled } from '@/features/dev';

import { APP_ENV } from '@/core/config';

export default function DevCookieCheckRoute() {
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  if (!isDevToolsEnabled(APP_ENV)) return <Redirect href="/" />;
  return <CookieCheckScreen autoRunLocal={auto === 'local'} />;
}
