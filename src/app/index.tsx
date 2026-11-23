import { router } from 'expo-router';
import { View } from 'react-native';

import { APP_ENV, brand } from '@/core/config';
import { isDevToolsEnabled } from '@/dev/devTools';
import { useTheme } from '@/theme';
import { BrandLogo, Button, Screen, Text } from '@/ui';

/** Placeholder home until Phase 2 adds the splash gate and auth routing. */
export default function Index() {
  const t = useTheme();
  return (
    <Screen
      footer={
        isDevToolsEnabled(APP_ENV) ? (
          <Button label="Open UI kit" variant="secondary" onPress={() => router.push('/dev/ui')} />
        ) : undefined
      }
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space[4] }}>
        <BrandLogo height={48} />
        <Text variant="title2" tone="accent" align="center">
          Hello {brand.appName} ({APP_ENV})
        </Text>
      </View>
    </Screen>
  );
}
