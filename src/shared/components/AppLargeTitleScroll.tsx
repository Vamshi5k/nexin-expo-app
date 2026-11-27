import { useContext, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';
import { BottomTabBarHeightContext } from 'expo-router/tabs';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppBackButton from './AppBackButton';
import { HEADER_BAR_HEIGHT, type AppHeaderProps } from './AppHeader';
import AppText from './AppText';

import { useTheme, withAlpha } from '@/shared/theme';

export type AppLargeTitleScrollProps = AppHeaderProps & {
  children: ReactNode;
  subtitle?: string;
};

const USE_BLUR = Platform.OS === 'ios';

const AppLargeTitleScroll = ({
  title,
  subtitle,
  back,
  right,
  children,
}: AppLargeTitleScrollProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  // The tab bar floats over the content, so leave room for it inside tab screens.
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(e => {
    y.value = e.contentOffset.y;
  });
  const largeHeight = t.type.title2.lineHeight ?? 28;
  const barHeight = HEADER_BAR_HEIGHT + insets.top;

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
    transform: [{ scale: interpolate(y.value, [-120, 0], [1.08, 1], Extrapolation.CLAMP) }],
  }));

  const dark = t.scheme === 'dark';

  return (
    <View style={[styles.flex, { backgroundColor: t.colors.bg }]}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: barHeight,
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, tabBarHeight, t.space[4]) + t.space[8],
        }}
        scrollIndicatorInsets={{ top: HEADER_BAR_HEIGHT }}
      >
        <Animated.View
          style={[
            largeTitle,
            styles.largeTitle,
            { paddingTop: t.space[2], paddingBottom: t.space[6], gap: t.space[1] },
          ]}
        >
          <AppText variant="title2" accessibilityRole="header">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="callout" tone="secondary">
              {subtitle}
            </AppText>
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
            { marginTop: insets.top, height: HEADER_BAR_HEIGHT, paddingHorizontal: t.space[2] },
          ]}
        >
          <View style={styles.side}>
            {back ? (
              <AppBackButton
                variant="plain"
                onPress={typeof back === 'function' ? back : undefined}
              />
            ) : null}
          </View>
          <Animated.View style={[styles.title, compactTitle]}>
            <AppText variant="headline" numberOfLines={1} align="center">
              {title}
            </AppText>
          </Animated.View>
          <View style={[styles.side, styles.right]}>{right}</View>
        </View>
      </View>
    </View>
  );
};

export default AppLargeTitleScroll;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center' },
  side: { width: 88, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  floatingBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  largeTitle: { transformOrigin: 'left' },
});
