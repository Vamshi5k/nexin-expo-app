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
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { brand } from '@/core/config';

const SPLASH = require('../../brand/assets/splash.png');

function splashSize() {
  const s = Image.resolveAssetSource(SPLASH);
  const width = brand.splash.imageWidth;
  return { width, height: s?.width && s.height ? (width * s.height) / s.width : width };
}

// Pixel-matches the native splash, takes over from it, breathes while booting, then zooms away.
export function SplashOverlay({ ready }: { ready: boolean }) {
  const device = useColorScheme();
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);
  const scale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);
  const opacity = useSharedValue(1);

  const background =
    device === 'dark' && brand.splash.darkBackgroundColor
      ? brand.splash.darkBackgroundColor
      : brand.splash.backgroundColor;

  useEffect(() => {
    if (ready || reduceMotion) return;
    scale.set(
      withDelay(
        400,
        withRepeat(withTiming(0.96, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true),
      ),
    );
  }, [ready, reduceMotion, scale]);

  useEffect(() => {
    if (!ready) return;
    const finish = () => setDone(true);
    if (reduceMotion) {
      opacity.set(withTiming(0, { duration: 250 }, (ok) => ok && scheduleOnRN(finish)));
      return;
    }
    const out = Easing.bezier(0.6, 0, 0.2, 1);
    scale.set(
      withSequence(
        withTiming(0.92, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(1.6, { duration: 520, easing: out }),
      ),
    );
    logoOpacity.set(withDelay(220, withTiming(0, { duration: 360 })));
    opacity.set(
      withDelay(
        300,
        withTiming(0, { duration: 420, easing: out }, (ok) => ok && scheduleOnRN(finish)),
      ),
    );
  }, [ready, reduceMotion, scale, logoOpacity, opacity]);

  const container = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logo = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (done) return null;

  return (
    <Animated.View
      pointerEvents={ready ? 'none' : 'auto'}
      onLayout={() => void SplashScreen.hideAsync()}
      style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: background }, container]}
    >
      <Animated.Image source={SPLASH} resizeMode="contain" style={[splashSize(), logo]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', zIndex: 100 },
});
