import { View } from 'react-native';

import { AppLogo } from '@/features/client-config';
import { useTheme } from '@/theme';
import { Button, Screen, Text } from '@/ui';

export type BootErrorScreenProps = { onRetry: () => void; retrying?: boolean };

/** BLUEPRINT A1 failure state: the session check failed or timed out. Tokens are kept. */
export function BootErrorScreen({ onRetry, retrying }: BootErrorScreenProps) {
  const t = useTheme();
  return (
    <Screen
      edges={['top', 'bottom']}
      footer={<Button label="Try Again" onPress={onRetry} loading={retrying} />}
    >
      <View style={{ flex: 1, justifyContent: 'center', gap: t.space[6] }}>
        <AppLogo height={44} />
        <View style={{ gap: t.space[2] }}>
          <Text variant="title1" accessibilityRole="header">
            Can&apos;t connect right now
          </Text>
          <Text tone="secondary">Check your internet connection and try again.</Text>
        </View>
      </View>
    </Screen>
  );
}
