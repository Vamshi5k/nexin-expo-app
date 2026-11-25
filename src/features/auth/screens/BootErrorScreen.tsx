import { WifiOff } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button, Reveal, Text } from '@/shared/components';

import { AuthScaffold } from '../components/AuthScaffold';

export type BootErrorScreenProps = { onRetry: () => void; retrying?: boolean };

export function BootErrorScreen({ onRetry, retrying }: BootErrorScreenProps) {
  const t = useTheme();
  return (
    <AuthScaffold
      hero={
        <>
          <Reveal index={0}>
            <View
              style={[
                styles.badge,
                { backgroundColor: t.colors.dangerSoft, borderRadius: t.radius.control },
              ]}
            >
              <WifiOff color={t.colors.dangerText} size={22} strokeWidth={1.75} />
            </View>
          </Reveal>
          <Reveal index={1} style={{ gap: t.space[2], marginTop: t.space[4] }}>
            <Text variant="hero" accessibilityRole="header">
              Can&apos;t connect right now
            </Text>
            <Text variant="callout" tone="secondary">
              Check your internet connection and try again.
            </Text>
          </Reveal>
        </>
      }
      footer={<Button label="Try Again" onPress={onRetry} loading={retrying} />}
    />
  );
}

const styles = StyleSheet.create({
  badge: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
