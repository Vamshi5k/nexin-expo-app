import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { ScanLine } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { SCAN_HREF, TAB_LABELS } from '../constants/home.constants';

const SIZE = 56;

// The scanner opens as its own screen, so the camera never mounts inside the tab bar.
const ScanTabButton = () => {
  const t = useTheme();

  return (
    <View style={styles.slot}>
      <AppPressable
        onPress={() => router.push(SCAN_HREF)}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={TAB_LABELS.scan}
        style={[
          styles.button,
          {
            backgroundColor: t.colors.accent,
            borderColor: t.colors.surface,
            shadowColor: t.colors.textPrimary,
          },
        ]}
      >
        <ScanLine color={t.colors.onAccent} size={26} />
      </AppPressable>
      <AppText variant="caption" tone="secondary" style={styles.label}>
        {TAB_LABELS.scan}
      </AppText>
    </View>
  );
};

export default ScanTabButton;

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    marginTop: -SIZE / 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 12,
  },
});
