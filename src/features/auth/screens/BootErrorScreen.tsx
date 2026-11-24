import { AppLogo } from '@/features/client-config';
import { useTheme } from '@/theme';
import { Button, Reveal, Text } from '@/ui';

import { AuthScaffold } from '../components/AuthScaffold';

export type BootErrorScreenProps = { onRetry: () => void; retrying?: boolean };

export function BootErrorScreen({ onRetry, retrying }: BootErrorScreenProps) {
  const t = useTheme();
  return (
    <AuthScaffold center footer={<Button label="Try Again" onPress={onRetry} loading={retrying} />}>
      <Reveal index={0}>
        <AppLogo height={40} />
      </Reveal>
      <Reveal index={1} style={{ gap: t.space[2] }}>
        <Text variant="display" accessibilityRole="header">
          Can&apos;t connect right now
        </Text>
        <Text tone="secondary">Check your internet connection and try again.</Text>
      </Reveal>
    </AuthScaffold>
  );
}
