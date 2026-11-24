import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { AmbientBackground, Pressable, Reveal } from '@/ui';

export type AuthScaffoldProps = {
  children: ReactNode;
  footer?: ReactNode;
  back?: boolean;
  center?: boolean;
};

export function AuthScaffold({ children, footer, back, center }: AuthScaffoldProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      <AmbientBackground />
      <KeyboardAvoidingView
        style={[styles.flex, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {back ? (
          <View style={[styles.bar, { paddingHorizontal: t.space[4] }]}>
            <BackButton />
          </View>
        ) : null}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.grow,
            center && styles.center,
            {
              paddingHorizontal: t.layout.screenPadding,
              paddingTop: back ? t.space[4] : t.space[8],
              paddingBottom: t.space[6],
              gap: t.space[8],
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer ? (
          <Reveal
            index={4}
            style={{
              paddingHorizontal: t.layout.screenPadding,
              paddingTop: t.space[3],
              paddingBottom: Math.max(insets.bottom, t.space[4]),
              gap: t.space[3],
            }}
          >
            {footer}
          </Reveal>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

function BackButton() {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => router.back()}
      haptic="selection"
      accessibilityLabel="Go back"
      style={[
        styles.back,
        {
          backgroundColor: t.colors.surface,
          borderColor: t.colors.border,
          borderWidth: t.layout.hairline,
          borderRadius: t.radius.pill,
        },
      ]}
    >
      <ChevronLeft color={t.colors.textPrimary} size={22} strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  center: { justifyContent: 'center' },
  bar: { height: 52, flexDirection: 'row', alignItems: 'center' },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
