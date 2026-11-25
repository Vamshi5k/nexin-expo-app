import { useRef } from 'react';
import { StyleSheet, View, type FlatList } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';
import { AmbientBackground, Button, Reveal, Text } from '@/shared/components';

import { OnboardingProgress } from '../components/OnboardingProgress';
import { OnboardingSlide } from '../components/OnboardingSlide';
import { useOnboarding } from '../hooks';
import type { OnboardingSlide as Slide } from '../types';

export function OnboardingScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<Slide>>(null);
  const onboarding = useOnboarding(list);
  const { count, index, last, width, x } = onboarding;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <AmbientBackground />
      <View
        style={[styles.topBar, { paddingLeft: t.layout.screenPadding, paddingRight: t.space[2] }]}
      >
        <Animated.View key={index} entering={FadeIn.duration(t.motion.duration)}>
          <Text variant="caption" tone="secondary" tabular accessibilityElementsHidden>
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </Text>
        </Animated.View>
        <Animated.View style={onboarding.skipStyle} pointerEvents={last ? 'none' : 'auto'}>
          <Button
            label="Skip"
            variant="ghost"
            size="medium"
            haptic={false}
            onPress={onboarding.skip}
          />
        </Animated.View>
      </View>

      <Animated.FlatList
        ref={list}
        data={onboarding.slides}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onboarding.onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onboarding.onScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index: i }) => (
          <OnboardingSlide
            slide={item}
            index={i}
            count={count}
            width={width}
            x={x}
            spin={onboarding.spin}
          />
        )}
      />

      <Reveal
        index={3}
        style={{
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[2],
          gap: t.space[6],
        }}
      >
        <OnboardingProgress count={count} width={width} x={x} />
        <Button label={last ? 'Get Started' : 'Next'} onPress={onboarding.next} />
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
