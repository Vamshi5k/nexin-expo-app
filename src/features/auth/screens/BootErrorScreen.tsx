import { StyleSheet, View } from 'react-native';

import { WifiOff } from 'lucide-react-native';

import { AppButton, AppReveal, AppText } from '@/shared/components';

import { AuthScaffold } from '../components/AuthScaffold';

import { useTheme } from '@/shared/theme';

export type BootErrorScreenProps = { onRetry: () => void; retrying?: boolean };

export function BootErrorScreen({ onRetry, retrying }: BootErrorScreenProps) {
  const t = useTheme();
  return (
    <AuthScaffold
      hero={
        <>
          <AppReveal index={0}>
            <View
              style={[
                styles.badge,
                { backgroundColor: t.colors.dangerSoft, borderRadius: t.radius.control },
              ]}
            >
              <WifiOff color={t.colors.dangerText} size={22} strokeWidth={1.75} />
            </View>
          </AppReveal>
          <AppReveal index={1} style={{ gap: t.space[2], marginTop: t.space[4] }}>
            <AppText variant="hero" accessibilityRole="header">
              Can&apos;t connect right now
            </AppText>
            <AppText variant="callout" tone="secondary">
              Check your internet connection and try again.
            </AppText>
          </AppReveal>
        </>
      }
      footer={<AppButton label="Try Again" onPress={onRetry} loading={retrying} />}
    />
  );
}

const styles = StyleSheet.create({
  badge: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
