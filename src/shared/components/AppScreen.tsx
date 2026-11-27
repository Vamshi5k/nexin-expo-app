import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import AppFade from './AppFade';

import { useTheme } from '@/shared/theme';

export type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  padded?: boolean;
  edges?: Edge[];
  background?: 'bg' | 'surface';
  // The tab screens' soft brand wash behind the top of the screen, status bar included.
  wash?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

const AppScreen = ({
  children,
  scroll,
  footer,
  padded = true,
  edges = ['top'],
  background = 'bg',
  wash = false,
  contentStyle,
}: AppScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const bg = t.colors[background];
  // Keyboard height from Reanimated, on both platforms: edge-to-edge Android no longer resizes
  // the window or sends keyboard events, so KeyboardAvoidingView left the footer covered there.
  // The bottom inset sits under the keyboard, so it is not counted twice.
  const keyboard = useAnimatedKeyboard();
  const keyboardRoom = useAnimatedStyle(() => ({
    paddingBottom: Math.max(0, keyboard.height.value - insets.bottom),
  }));
  const padding: ViewStyle = { paddingHorizontal: padded ? t.layout.screenPadding : 0 };

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padding, { paddingBottom: t.space[8] }, contentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padding, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: bg }]}>
      {wash ? (
        <View pointerEvents="none" style={[styles.wash, { height: insets.top + t.space[12] * 4 }]}>
          <AppFade id="screen-wash" color={t.colors.accent} from={0.22} to={0} top />
        </View>
      ) : null}
      <Animated.View style={[styles.flex, keyboardRoom]}>
        {body}
        {footer ? (
          <View
            style={{
              paddingHorizontal: t.layout.screenPadding,
              paddingTop: t.space[3],
              paddingBottom: Math.max(insets.bottom, t.space[4]),
              backgroundColor: bg,
              borderTopWidth: t.layout.hairline,
              borderTopColor: t.colors.border,
              gap: t.space[3],
            }}
          >
            {footer}
          </View>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
};

export default AppScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0 },
});
