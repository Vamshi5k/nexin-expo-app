import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/core/session';

/** Signed-out only. A signed-in session goes to "/", which picks setup, home or fleet. */
export default function AuthLayout() {
  const mode = useSession((s) => s.mode);
  if (mode !== 'none') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
