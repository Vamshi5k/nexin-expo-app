import { useRef } from 'react';
import { StyleSheet, View, type FlatList } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppAmbientBackground, AppButton, AppReveal, AppText } from '@/shared/components';

import OnboardingProgress from '../components/OnboardingProgress';
import OnboardingSlide from '../components/OnboardingSlide';

import { useTheme } from '@/shared/theme';

import { useOnboarding } from '../hooks/useOnboarding';
import type { OnboardingSlide as Slide } from '../types/auth.types';

const OnboardingScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<Slide>>(null);
  const onboarding = useOnboarding(list);
  const { count, index, last, width, x } = onboarding;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <AppAmbientBackground />
      <View
        style={[styles.topBar, { paddingLeft: t.layout.screenPadding, paddingRight: t.space[2] }]}
      >
        <Animated.View key={index} entering={FadeIn.duration(t.motion.duration)}>
          <AppText variant="caption" tone="secondary" tabular accessibilityElementsHidden>
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </AppText>
        </Animated.View>
        <Animated.View style={onboarding.skipStyle} pointerEvents={last ? 'none' : 'auto'}>
          <AppButton
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

      <AppReveal
        index={3}
        style={{
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[2],
          gap: t.space[6],
        }}
      >
        <OnboardingProgress count={count} width={width} x={x} />
        <AppButton label={last ? 'Get Started' : 'Next'} onPress={onboarding.next} />
      </AppReveal>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
