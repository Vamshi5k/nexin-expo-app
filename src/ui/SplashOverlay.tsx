import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { brand } from '@/core/config';
import { useTheme, withAlpha } from '@/theme';

const SPLASH = require('../../brand/assets/splash.png');
const TRACK = 120;

function splashSize() {
  const s = Image.resolveAssetSource(SPLASH);
  const width = brand.splash.imageWidth;
  return { width, height: s?.width && s.height ? (width * s.height) / s.width : width };
}

// Pixel-matches the native splash, then docks the logo into the auth top bar's logo slot
// while the backdrop fades, so the first screen appears to grow out of the splash.
export function SplashOverlay({ ready }: { ready: boolean }) {
  const t = useTheme();
  const device = useColorScheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const size = splashSize();

  const sweep = useSharedValue(0);
  const loader = useSharedValue(0);
  const dock = useSharedValue(0);
  const backdrop = useSharedValue(1);
  const logoOpacity = useSharedValue(1);

  const background =
    device === 'dark' && brand.splash.darkBackgroundColor
      ? brand.splash.darkBackgroundColor
      : brand.splash.backgroundColor;

  const scale = t.layout.logoHeight / size.height;
  const dx = t.layout.screenPadding + (size.width * scale) / 2 - box.width / 2;
  const dy = insets.top + t.layout.topBarHeight / 2 - box.height / 2;

  useEffect(() => {
    if (ready) return;
    loader.set(withDelay(700, withTiming(1, { duration: 300 })));
    if (reduceMotion) return;
    sweep.set(
      withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.cubic) }), -1),
    );
  }, [ready, reduceMotion, loader, sweep]);

  useEffect(() => {
    if (!ready || box.height === 0) return;
    const finish = () => setDone(true);
    const ease = Easing.bezier(0.65, 0, 0.35, 1);
    loader.set(withTiming(0, { duration: 150 }));
    if (reduceMotion) {
      logoOpacity.set(withTiming(0, { duration: 250 }));
      backdrop.set(withTiming(0, { duration: 250 }, (ok) => ok && scheduleOnRN(finish)));
      return;
    }
    dock.set(withTiming(1, { duration: 640, easing: ease }));
    backdrop.set(withDelay(300, withTiming(0, { duration: 420, easing: ease })));
    logoOpacity.set(
      withDelay(
        640,
        withTiming(0, { duration: 180 }, (ok) => ok && scheduleOnRN(finish)),
      ),
    );
  }, [ready, box.height, reduceMotion, loader, dock, backdrop, logoOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const logo = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateX: dx * dock.value },
      { translateY: dy * dock.value },
      { scale: 1 + (scale - 1) * dock.value },
    ],
  }));
  const track = useAnimatedStyle(() => ({ opacity: loader.value }));
  const bar = useAnimatedStyle(() => ({
    transform: [{ translateX: -TRACK * 0.35 + TRACK * 1.35 * sweep.value }],
  }));

  if (done) return null;

  return (
    <Animated.View
      pointerEvents={ready ? 'none' : 'auto'}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setBox({ width, height });
        void SplashScreen.hideAsync();
      }}
      style={[StyleSheet.absoluteFill, styles.center]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: background }, backdropStyle]}
      />
      <Animated.Image source={SPLASH} resizeMode="contain" style={[size, logo]} />
      <Animated.View
        style={[
          styles.track,
          {
            bottom: Math.max(insets.bottom, t.space[4]) + t.space[10],
            backgroundColor: withAlpha(t.colors.accent, 0.16),
          },
          track,
        ]}
      >
        <Animated.View style={[styles.bar, { backgroundColor: t.colors.accent }, bar]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  track: { position: 'absolute', width: TRACK, height: 3, borderRadius: 2, overflow: 'hidden' },
  bar: { width: TRACK * 0.35, height: 3, borderRadius: 2 },
});
