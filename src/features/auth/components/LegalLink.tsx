import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/shared/components';

type LegalLinkProps = { label: string; onPress: () => void };

const LegalLink = ({ label, onPress }: LegalLinkProps) => {
  return (
    <Pressable onPress={onPress} hitSlop={12} accessibilityRole="link">
      <AppText variant="caption" tone="accent" style={styles.underline}>
        {label}
      </AppText>
    </Pressable>
  );
};

export default LegalLink;

const styles = StyleSheet.create({
  underline: { textDecorationLine: 'underline' },
});
