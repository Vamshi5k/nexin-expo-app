import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, withAlpha } from '@/theme';

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

/** Blur only where it is cheap and native; Android gets a solid bar (DESIGN.md). */
const USE_BLUR = Platform.OS === 'ios';

/**
 * Main-screen layout: a large title that collapses into a compact title on scroll
 * (DESIGN.md "Layout and shape"). The bar floats over the content; once the large title
 * has scrolled away it gains a translucent blurred background and a hairline border.
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
  const barHeight = BAR_HEIGHT + insets.top;

  const compactTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [largeHeight * 0.6, largeHeight], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          y.value,
          [largeHeight * 0.6, largeHeight],
          [4, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const barBackground = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [largeHeight * 0.5, largeHeight], [0, 1], Extrapolation.CLAMP),
  }));
  const largeTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, largeHeight * 0.8], [1, 0], Extrapolation.CLAMP),
    transform: [
      // Rubber-band the title slightly larger on pull-down, like the native large title.
      { scale: interpolate(y.value, [-120, 0], [1.08, 1], Extrapolation.CLAMP) },
    ],
  }));

  const onBack = typeof back === 'function' ? back : () => router.back();
  const dark = t.scheme === 'dark';

  return (
    <View style={[styles.flex, { backgroundColor: t.colors.bg }]}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: barHeight,
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[8],
        }}
        scrollIndicatorInsets={{ top: BAR_HEIGHT }}
      >
        <Animated.View
          style={[
            largeTitle,
            styles.largeTitle,
            { paddingTop: t.space[2], paddingBottom: t.space[6], gap: t.space[1] },
          ]}
        >
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

      <View style={[styles.floatingBar, { height: barHeight }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            barBackground,
            {
              borderBottomWidth: t.layout.hairline,
              borderBottomColor: t.colors.border,
              backgroundColor: USE_BLUR ? withAlpha(t.colors.bg, 0.72) : t.colors.bg,
            },
          ]}
        >
          {USE_BLUR ? (
            <BlurView
              tint={dark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
        </Animated.View>
        <View
          style={[
            styles.bar,
            { marginTop: insets.top, height: BAR_HEIGHT, paddingHorizontal: t.space[2] },
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
        </View>
      </View>
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
  floatingBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  largeTitle: { transformOrigin: 'left' },
});
