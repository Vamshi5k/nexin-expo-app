import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { Pressable } from './Pressable';
import { Text } from './Text';

const BAR_HEIGHT = 44;

export type HeaderProps = {
  title?: string;
  /** Show a back chevron. Defaults to router.back(). */
  back?: boolean | (() => void);
  right?: ReactNode;
};

/** Compact header bar (no safe-area padding; put it inside a Screen with edges top). */
export function Header({ title, back, right }: HeaderProps) {
  const t = useTheme();
  const onBack = typeof back === 'function' ? back : () => router.back();
  return (
    <View style={[styles.bar, { height: BAR_HEIGHT, paddingHorizontal: t.space[2] }]}>
      <View style={styles.side}>
        {back ? (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Back"
            style={styles.icon}
            feedback="opacity"
          >
            <ChevronLeft color={t.colors.textPrimary} size={24} strokeWidth={1.75} />
          </Pressable>
        ) : null}
      </View>
      <Text variant="headline" numberOfLines={1} style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

export type LargeTitleScrollProps = HeaderProps & {
  children: ReactNode;
  /** Optional line under the large title. */
  subtitle?: string;
};

/**
 * Main-screen layout: a large title that collapses into a compact title on scroll
 * (DESIGN.md "Layout and shape").
 */
export function LargeTitleScroll({
  title,
  subtitle,
  back,
  right,
  children,
}: LargeTitleScrollProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const largeHeight = t.type.title1.lineHeight ?? 34;

  const compactTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [largeHeight * 0.6, largeHeight], [0, 1], Extrapolation.CLAMP),
  }));
  const barBorder = useAnimatedStyle(() => ({
    borderBottomColor: y.value > largeHeight ? t.colors.border : 'transparent',
  }));
  const largeTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, largeHeight], [1, 0], Extrapolation.CLAMP),
  }));

  const onBack = typeof back === 'function' ? back : () => router.back();

  return (
    <View style={[styles.flex, { backgroundColor: t.colors.bg }]}>
      <Animated.View
        style={[
          styles.bar,
          barBorder,
          {
            paddingTop: insets.top,
            height: BAR_HEIGHT + insets.top,
            paddingHorizontal: t.space[2],
            backgroundColor: t.colors.bg,
            borderBottomWidth: t.layout.hairline,
          },
        ]}
      >
        <View style={styles.side}>
          {back ? (
            <Pressable
              onPress={onBack}
              accessibilityLabel="Back"
              style={styles.icon}
              feedback="opacity"
            >
              <ChevronLeft color={t.colors.textPrimary} size={24} strokeWidth={1.75} />
            </Pressable>
          ) : null}
        </View>
        <Animated.View style={[styles.title, compactTitle]}>
          <Text variant="headline" numberOfLines={1} align="center">
            {title}
          </Text>
        </Animated.View>
        <View style={[styles.side, styles.right]}>{right}</View>
      </Animated.View>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: t.space[8],
        }}
      >
        <Animated.View style={[largeTitle, { paddingBottom: t.space[4], gap: t.space[1] }]}>
          <Text variant="title1" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="callout" tone="secondary">
              {subtitle}
            </Text>
          ) : null}
        </Animated.View>
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center' },
  side: { width: 88, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
