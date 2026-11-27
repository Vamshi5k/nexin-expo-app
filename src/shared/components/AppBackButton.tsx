import { useCallback } from 'react';
import { BackHandler, StyleSheet } from 'react-native';

import { router, useFocusEffect, type Href } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import AppPressable from './AppPressable';

import { useTheme } from '@/shared/theme';

export type AppBackButtonProps = {
  onPress?: () => void;
  // Where to go when there is nothing to go back to (opened from a deep link, a notification or
  // after a reload). The root route sends the user to the right home.
  fallbackHref?: Href;
  variant?: 'filled' | 'plain';
  // Android's back button runs onPress too while the screen is focused (in-screen steps, wizards).
  hardwareBack?: boolean;
};

const AppBackButton = ({
  onPress,
  fallbackHref = '/',
  variant = 'filled',
  hardwareBack = false,
}: AppBackButtonProps) => {
  const t = useTheme();
  const goBack =
    onPress ??
    (() => {
      if (router.canGoBack()) router.back();
      else router.replace(fallbackHref);
    });
  const filled = variant === 'filled';

  useFocusEffect(
    useCallback(() => {
      if (!hardwareBack || !onPress) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        onPress();
        return true;
      });
      return () => sub.remove();
    }, [hardwareBack, onPress]),
  );

  return (
    <AppPressable
      onPress={goBack}
      accessibilityLabel="Back"
      haptic={filled ? 'selection' : false}
      feedback={filled ? 'scale' : 'opacity'}
      style={
        filled
          ? [
              styles.filled,
              { backgroundColor: t.colors.surfaceSunken, borderRadius: t.radius.pill },
            ]
          : styles.plain
      }
    >
      <ChevronLeft color={t.colors.textPrimary} size={filled ? 20 : 24} strokeWidth={1.75} />
    </AppPressable>
  );
};

export default AppBackButton;

const styles = StyleSheet.create({
  filled: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  plain: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
