import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppContourBackground, AppPressable } from '@/shared/components';

import { AppLogo } from '@/features/client-config';

import { useTheme } from '@/shared/theme';

export type AuthScaffoldProps = {
  hero: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  back?: boolean;
};

// Top bar (logo or back), a brand area over the contour lines, and a flat panel anchored to the bottom.
const AuthScaffold = ({ hero, children, footer, back }: AuthScaffoldProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  // Edge-to-edge Android never resizes the window, so lift the content by the keyboard ourselves.
  const keyboard = useAnimatedKeyboard();
  const lift = useAnimatedStyle(() => ({
    paddingBottom: Math.max(0, keyboard.height.value - insets.bottom),
  }));

  return (
    <View style={styles.flex}>
      <AppContourBackground />
      <Animated.View style={[styles.flex, { paddingTop: insets.top }, lift]}>
        <View
          style={[
            styles.bar,
            { height: t.layout.topBarHeight, paddingHorizontal: t.layout.screenPadding },
          ]}
        >
          {back ? <BackButton /> : <AppLogo height={t.layout.logoHeight} />}
        </View>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.grow}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[
              styles.hero,
              {
                paddingHorizontal: t.layout.screenPadding,
                paddingTop: t.space[6],
                paddingBottom: t.space[8],
                gap: t.space[2],
              },
            ]}
          >
            {hero}
          </View>
          <Animated.View
            entering={FadeInDown.duration(t.motion.durationSlow)
              .delay(80)
              .easing(Easing.out(Easing.cubic))
              .withInitialValues({ transform: [{ translateY: 40 }] })}
            style={[
              styles.panel,
              {
                backgroundColor: t.colors.surface,
                borderColor: t.colors.border,
                borderTopLeftRadius: t.radius.sheet,
                borderTopRightRadius: t.radius.sheet,
                paddingHorizontal: t.layout.screenPadding,
                paddingTop: t.space[6],
                paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[4],
                gap: t.space[5],
              },
            ]}
          >
            {children}
            {footer ? <View style={{ gap: t.space[3] }}>{footer}</View> : null}
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const BackButton = () => {
  const t = useTheme();

  return (
    <AppPressable
      onPress={() => router.back()}
      haptic="selection"
      accessibilityLabel="Go back"
      style={[
        styles.back,
        { backgroundColor: t.colors.surfaceSunken, borderRadius: t.radius.pill },
      ]}
    >
      <ChevronLeft color={t.colors.textPrimary} size={20} strokeWidth={1.75} />
    </AppPressable>
  );
};

export default AuthScaffold;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  bar: { flexDirection: 'row', alignItems: 'center' },
  hero: { flex: 1, justifyContent: 'flex-end' },
  panel: { borderWidth: StyleSheet.hairlineWidth, borderBottomWidth: 0 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
