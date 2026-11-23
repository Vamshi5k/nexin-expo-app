import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Sticky footer above the safe area (primary actions on forms). */
  footer?: ReactNode;
  /** Remove the 20 pt horizontal screen padding (e.g. full-bleed maps). */
  padded?: boolean;
  edges?: Edge[];
  background?: 'bg' | 'surface';
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll,
  footer,
  padded = true,
  edges = ['top'],
  background = 'bg',
  contentStyle,
}: ScreenProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const bg = t.colors[background];
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
