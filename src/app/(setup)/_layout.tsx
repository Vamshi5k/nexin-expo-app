import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/core/session';

/** First-run steps: consumer session only. */
export default function SetupLayout() {
  const mode = useSession((s) => s.mode);
  if (mode !== 'consumer') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
