import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { bootstrap } from '@/core/bootstrap';
import { log } from '@/core/log';
import { OfflineBanner } from '@/core/network';
import { PermissionBlockedDialog } from '@/core/permissions';
import { createQueryClient, wireQueryManagers } from '@/core/query';
import { ThemeProvider, useTheme } from '@/theme';
import { useBrandFonts } from '@/theme/fonts';
import { AppToaster } from '@/ui';

void SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

export default function RootLayout() {
  const fonts = useBrandFonts();
  const [booted, setBooted] = useState(false);

  useEffect(() => wireQueryManagers(), []);

  useEffect(() => {
    void bootstrap().finally(() => setBooted(true));
  }, []);

  useEffect(() => {
    if (fonts.error)
      log.warn('brand font failed to load; using system font', { error: String(fonts.error) });
  }, [fonts.error]);

  const ready = booted && (fonts.loaded || !!fonts.error);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <AppShell />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const t = useTheme();
  return (
    <>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg } }}
      />
      <OfflineBanner />
      <PermissionBlockedDialog />
      <AppToaster />
    </>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
