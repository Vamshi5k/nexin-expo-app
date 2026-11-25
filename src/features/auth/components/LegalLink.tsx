import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/shared/components';

export function LegalLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} accessibilityRole="link">
      <AppText variant="caption" tone="accent" style={styles.underline}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  underline: { textDecorationLine: 'underline' },
});
