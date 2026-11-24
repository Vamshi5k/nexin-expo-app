import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth';
import { ClientConfigProvider } from '@/features/client-config';
import { FleetProvider } from '@/features/fleet';
import { ThemeProvider } from '@/theme';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>
      <ClientConfigProvider>
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

export function renderWithApp(ui: ReactElement) {
  return render(ui, { wrapper: AppProviders });
}
