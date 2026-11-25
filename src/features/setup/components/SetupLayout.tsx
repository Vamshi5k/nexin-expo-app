import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ChevronLeft } from 'lucide-react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppPressable, AppReveal, AppText } from '@/shared/components';

import SetupStepper from './SetupStepper';

import { useTheme } from '@/shared/theme';

// Content-first frame for the setup steps: top bar, named stepper, title, body, pinned footer.
type SetupLayoutProps = {
  step: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  aboveTitle?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

const SetupLayout = ({
  step,
  title,
  subtitle,
  onBack,
  right,
  aboveTitle,
  children,
  footer,
}: SetupLayoutProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  // Edge-to-edge Android never resizes the window, so lift the footer by the keyboard ourselves.
  const keyboard = useAnimatedKeyboard();
  const lift = useAnimatedStyle(() => ({
    paddingBottom: Math.max(0, keyboard.height.value - insets.bottom),
  }));

  return (
    <Animated.View
      style={[styles.flex, { backgroundColor: t.colors.bg, paddingTop: insets.top }, lift]}
    >
      <View
        style={[
          styles.bar,
          { height: t.layout.topBarHeight, paddingHorizontal: t.layout.screenPadding },
        ]}
      >
        {onBack ? (
          <AppPressable
            onPress={onBack}
            haptic="selection"
            accessibilityLabel="Back"
            style={[
              styles.back,
              { backgroundColor: t.colors.surfaceSunken, borderRadius: t.radius.pill },
            ]}
          >
            <ChevronLeft color={t.colors.textPrimary} size={20} strokeWidth={1.75} />
          </AppPressable>
        ) : (
          <View style={styles.back} />
        )}
        {right}
      </View>
      <View style={{ paddingHorizontal: t.layout.screenPadding }}>
        <SetupStepper current={step} />
      </View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingHorizontal: t.layout.screenPadding,
          paddingTop: t.space[8],
          paddingBottom: t.space[6],
          gap: t.space[6],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppReveal index={0} style={{ gap: t.space[4] }}>
          {aboveTitle}
          <View style={{ gap: t.space[2] }}>
            <AppText variant="hero" accessibilityRole="header">
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="callout" tone="secondary">
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </AppReveal>
        <AppReveal index={1}>{children}</AppReveal>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: t.layout.screenPadding,
          paddingTop: t.space[3],
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[2],
          gap: t.space[3],
        }}
      >
        {footer}
      </View>
    </Animated.View>
  );
};

export default SetupLayout;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
