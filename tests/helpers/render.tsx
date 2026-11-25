import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { render } from '@testing-library/react-native';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth';
import { ClientConfigProvider, usePrimeClientConfig } from '@/features/client-config';
import { FleetProvider } from '@/features/fleet';
import { ThemeProvider } from '@/shared/theme';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// Loads /client/info the way boot does. Tests that use it mock the client-config api file.
function PrimeClientConfig() {
  const prime = usePrimeClientConfig();
  useEffect(() => {
    void prime();
  }, [prime]);
  return null;
}

export function AppProviders({
  children,
  primeConfig = false,
}: {
  children: ReactNode;
  primeConfig?: boolean;
}) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>
      <ClientConfigProvider>
        {primeConfig ? <PrimeClientConfig /> : null}
        <FleetProvider>
          <AuthProvider>
            <ThemeProvider>
              <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
            </ThemeProvider>
          </AuthProvider>
        </FleetProvider>
      </ClientConfigProvider>
    </SafeAreaProvider>
  );
}

export function renderWithApp(ui: ReactElement, { primeConfig = false } = {}) {
  return render(ui, {
    wrapper: ({ children }) => <AppProviders primeConfig={primeConfig}>{children}</AppProviders>,
  });
}
