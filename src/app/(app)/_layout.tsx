import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/core/session';

/** Signed-in consumer screens. Anything else (incl. logged-out deep links) goes to "/". */
export default function AppLayout() {
  const mode = useSession((s) => s.mode);
  if (mode !== 'consumer') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
