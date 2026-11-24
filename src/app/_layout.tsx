import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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
import { AuthProvider, BootErrorScreen, useBoot } from '@/features/auth';
import { ClientConfigProvider } from '@/features/client-config';
import { FleetProvider } from '@/features/fleet';
import { ThemeProvider, useTheme } from '@/theme';
import { useBrandFonts } from '@/theme/fonts';
import { AppToaster, SplashOverlay } from '@/ui';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fonts = useBrandFonts();

  useEffect(() => {
    if (fonts.error)
      log.warn('brand font failed to load; using system font', { error: String(fonts.error) });
  }, [fonts.error]);

  if (!fonts.loaded && !fonts.error) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ClientConfigProvider>
          <FleetProvider>
            <AuthProvider>
              <ThemeProvider>
                <BottomSheetModalProvider>
                  <AppShell />
                </BottomSheetModalProvider>
              </ThemeProvider>
            </AuthProvider>
          </FleetProvider>
        </ClientConfigProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const t = useTheme();
  const boot = useBoot();
  const loading = boot.status === 'loading';

  return (
    <>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      {loading ? null : boot.status === 'error' ? (
        <BootErrorScreen onRetry={boot.retry} retrying={boot.retrying} />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: t.colors.bg },
          }}
        />
      )}
      <OfflineBanner />
      <PermissionBlockedDialog />
      <AppToaster />
      <SplashOverlay ready={!loading} />
    </>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
