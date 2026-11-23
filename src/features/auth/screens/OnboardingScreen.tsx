import { router } from 'expo-router';
import { CreditCard, MapPin, Zap, type LucideIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, type FlatList } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Button, Text } from '@/ui';

import { markOnboardingDone, START_HREF } from '../routes';

type Slide = { key: string; icon: LucideIcon; title: string; description: string };

/** Copy from docs/screen-audit.md 2.2 (verbatim). */
const SLIDES: Slide[] = [
  {
    key: 'find',
    icon: MapPin,
    title: 'Find Chargers',
    description: 'Discover nearby charging stations with live availability and pricing',
  },
  {
    key: 'charge',
    icon: Zap,
    title: 'Start Charging',
    description: 'Select a charger, enter amount, and start or stop charging instantly',
  },
  {
    key: 'pay',
    icon: CreditCard,
    title: 'Pay & Track',
    description: 'Make secure payments, track sessions, manage vehicles, and get updates',
  },
];

/** BLUEPRINT A2. firstlogin is set on Skip or Get Started only, never on mount. */
export function OnboardingScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const list = useRef<FlatList<Slide>>(null);
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  const finish = () => {
    markOnboardingDone();
    router.replace(START_HREF.login);
  };

  const next = () => {
    if (last) return finish();
    list.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View style={[styles.flex, { backgroundColor: t.colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { paddingHorizontal: t.space[2] }]}>
        {!last ? (
          <Button label="Skip" variant="ghost" size="medium" haptic={false} onPress={finish} />
        ) : null}
      </View>

      <Animated.FlatList
        ref={list}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index: i }) => (
          <SlideView slide={item} index={i} width={width} x={x} />
        )}
      />

      <View
        style={{
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[2],
          gap: t.space[6],
        }}
      >
        <View style={[styles.dots, { gap: t.space[2] }]} accessibilityElementsHidden>
          {SLIDES.map((s, i) => (
            <Dot key={s.key} index={i} width={width} x={x} />
          ))}
        </View>
        <Button label={last ? 'Get Started' : 'Next'} onPress={next} />
      </View>
    </View>
  );
}

function SlideView({
  slide,
  index,
  width,
  x,
}: {
  slide: Slide;
  index: number;
  width: number;
  x: SharedValue<number>;
}) {
  const t = useTheme();
  const Icon = slide.icon;
  const range = [(index - 1) * width, index * width, (index + 1) * width];
  const art = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(x.value, range, [0.85, 1, 0.85], Extrapolation.CLAMP) }],
  }));

  return (
    <View
      accessible
      accessibilityLabel={`Slide ${index + 1} of ${SLIDES.length}. ${slide.title}. ${slide.description}`}
      style={[styles.slide, { width, paddingHorizontal: t.layout.screenPadding, gap: t.space[8] }]}
    >
      <Animated.View
        style={[
          art,
          styles.circle,
          { width: 168, height: 168, backgroundColor: t.colors.accentSoft },
        ]}
      >
        <View style={[styles.circle, { width: 96, height: 96, backgroundColor: t.colors.accent }]}>
          <Icon color={t.colors.onAccent} size={40} strokeWidth={1.75} />
        </View>
      </Animated.View>
      <View style={{ gap: t.space[3] }}>
        <Text variant="title1" align="center">
          {slide.title}
        </Text>
        <Text variant="body" tone="secondary" align="center">
          {slide.description}
        </Text>
      </View>
    </View>
  );
}

function Dot({ index, width, x }: { index: number; width: number; x: SharedValue<number> }) {
  const t = useTheme();
  const range = [(index - 1) * width, index * width, (index + 1) * width];
  const idle = t.colors.borderStrong;
  const active = t.colors.accent;
  // Width and colour interpolate with the scroll, so there is no flicker mid-swipe.
  const style = useAnimatedStyle(() => ({
    width: interpolate(x.value, range, [8, 24, 8], Extrapolation.CLAMP),
    backgroundColor: interpolateColor(x.value, range, [idle, active, idle]),
  }));
  return <Animated.View style={[style, { height: 8, borderRadius: t.radius.pill }]} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { height: 52, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center' },
});
