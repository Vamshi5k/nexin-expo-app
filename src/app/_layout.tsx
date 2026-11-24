import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { log } from '@/core/log';
import { OfflineBanner } from '@/core/network';
import { PermissionBlockedDialog } from '@/core/permissions';
import { createQueryClient, wireQueryManagers } from '@/core/query';
import { BootErrorScreen, useBoot } from '@/features/auth';
import { ThemeProvider, useTheme } from '@/theme';
import { useBrandFonts } from '@/theme/fonts';
import { AppToaster } from '@/ui';

void SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

export default function RootLayout() {
  const fonts = useBrandFonts();

  useEffect(() => wireQueryManagers(), []);

  useEffect(() => {
    if (fonts.error)
      log.warn('brand font failed to load; using system font', { error: String(fonts.error) });
  }, [fonts.error]);

  if (!fonts.loaded && !fonts.error) return null;

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

/**
 * Holds the native splash while boot runs (legacy migration, session hydrate, client config,
 * session check: BLUEPRINT A1), then shows the routes or the boot error screen.
 */
function AppShell() {
  const t = useTheme();
  const boot = useBoot();
  const loading = boot.status === 'loading';

  useEffect(() => {
    if (!loading) void SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      {boot.status === 'error' ? (
        <BootErrorScreen onRetry={boot.retry} retrying={boot.retrying} />
      ) : (
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg } }}
        />
      )}
      <OfflineBanner />
      <PermissionBlockedDialog />
      <AppToaster />
    </>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
