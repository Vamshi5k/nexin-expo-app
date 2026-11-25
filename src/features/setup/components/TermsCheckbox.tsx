import { StyleSheet, View } from 'react-native';

import { Check } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

// The whole row toggles (the old app's 18 pt box alone was too small to hit).
export function TermsCheckbox({
  checked,
  onToggle,
  onOpenTerms,
  onOpenPrivacy,
}: {
  checked: boolean;
  onToggle: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}) {
  const t = useTheme();
  const c = t.colors;
  return (
    <AppPressable
      onPress={onToggle}
      haptic="selection"
      feedback="opacity"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="I accept the Terms & Conditions and Privacy Policy"
      style={[styles.row, { gap: t.space[3], minHeight: 44 }]}
    >
      <View
        style={[
          styles.box,
          {
            borderRadius: 6,
            borderColor: checked ? c.accent : c.borderStrong,
            backgroundColor: checked ? c.accent : c.surface,
          },
        ]}
      >
        {checked ? <Check color={c.onAccent} size={16} strokeWidth={3} /> : null}
      </View>
      <AppText variant="callout" tone="secondary" style={styles.text}>
        I accept the <Link label="Terms & Conditions" onPress={onOpenTerms} /> and{' '}
        <Link label="Privacy Policy" onPress={onOpenPrivacy} />
      </AppText>
    </AppPressable>
  );
}

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AppText
      variant="callout"
      tone="accent"
      style={styles.link}
      onPress={onPress}
      accessibilityRole="link"
    >
      {label}
    </AppText>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  box: { width: 24, height: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  link: { textDecorationLine: 'underline', fontWeight: '600' },
});
