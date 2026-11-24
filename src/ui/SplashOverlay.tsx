import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, useColorScheme, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { brand } from '@/core/config';
import { useTheme, withAlpha } from '@/theme';

const SPLASH = require('../../brand/assets/splash.png');
const TRACK = 72;

function splashSize() {
  const s = Image.resolveAssetSource(SPLASH);
  const width = brand.splash.imageWidth;
  return { width, height: s?.width && s.height ? (width * s.height) / s.width : width };
}

// Pixel-matches the native splash, shows a thin loader only if boot is slow, then lifts away.
export function SplashOverlay({ ready }: { ready: boolean }) {
  const t = useTheme();
  const device = useColorScheme();
  const { height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);
  const size = splashSize();

  const sweep = useSharedValue(0);
  const loader = useSharedValue(0);
  const lift = useSharedValue(0);
  const curtain = useSharedValue(0);

  const background =
    device === 'dark' && brand.splash.darkBackgroundColor
      ? brand.splash.darkBackgroundColor
      : brand.splash.backgroundColor;

  useEffect(() => {
    if (ready) return;
    loader.set(withDelay(700, withTiming(1, { duration: 300 })));
    if (reduceMotion) return;
    sweep.set(
      withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }), -1),
    );
  }, [ready, reduceMotion, loader, sweep]);

  useEffect(() => {
    if (!ready) return;
    const finish = () => setDone(true);
    loader.set(withTiming(0, { duration: 150 }));
    lift.set(withTiming(1, { duration: 280, easing: Easing.in(Easing.cubic) }));
    curtain.set(
      withDelay(
        reduceMotion ? 0 : 180,
        withTiming(
          1,
          { duration: reduceMotion ? 220 : 560, easing: Easing.bezier(0.7, 0, 0.2, 1) },
          (ok) => {
            if (ok) scheduleOnRN(finish);
          },
        ),
      ),
    );
  }, [ready, reduceMotion, loader, lift, curtain]);

  const container = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: 1 - curtain.value }
      : { transform: [{ translateY: -height * curtain.value }] },
  );
  const logo = useAnimatedStyle(() => ({
    opacity: 1 - lift.value,
    transform: [{ translateY: -16 * lift.value }],
  }));
  const track = useAnimatedStyle(() => ({ opacity: loader.value }));
  const bar = useAnimatedStyle(() => ({
    transform: [{ translateX: -TRACK * 0.4 + TRACK * 1.4 * sweep.value }],
  }));

  if (done) return null;

  return (
    <Animated.View
      pointerEvents={ready ? 'none' : 'auto'}
      onLayout={() => void SplashScreen.hideAsync()}
      style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: background }, container]}
    >
      <Animated.Image source={SPLASH} resizeMode="contain" style={[size, logo]} />
      <Animated.View
        style={[
          styles.track,
          {
            top: '50%',
            marginTop: size.height / 2 + 32,
            backgroundColor: withAlpha(t.colors.accent, 0.18),
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
  track: { position: 'absolute', width: TRACK, height: 2, borderRadius: 1, overflow: 'hidden' },
  bar: { width: TRACK * 0.4, height: 2, borderRadius: 1 },
});
