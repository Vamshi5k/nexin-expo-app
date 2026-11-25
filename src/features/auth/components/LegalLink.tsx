import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/shared/components';

export function LegalLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} accessibilityRole="link">
      <Text variant="caption" tone="accent" style={styles.underline}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  underline: { textDecorationLine: 'underline' },
});
