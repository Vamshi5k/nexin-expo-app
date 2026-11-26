import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ChevronsRight, Zap } from 'lucide-react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { AppGlass, AppText } from '@/shared/components';

import { useTheme, type Theme } from '@/shared/theme';

import { haptics } from '@/shared/utils/haptics';
import { springUp } from '@/shared/utils/motion';

import { DETAILS_COPY, slideLabel, startAt } from '../constants/stations.constants';

type SlideToChargeProps = {
  connectorId: string;
  onComplete: () => void;
};

// Share of the track the knob must travel before letting go starts the session.
const COMPLETE_AT = 0.8;

const knobSize = (t: Theme) => t.space[12] + t.space[2];

export const slideBarHeight = (t: Theme, bottomInset: number) =>
  knobSize(t) + t.space[1] * 2 + Math.max(bottomInset, t.space[3]);

// A glass capsule with an accent knob: drag it right to start charging on the picked connector.
// Screen readers get one button that does the same.
const SlideToCharge = ({ connectorId, onComplete }: SlideToChargeProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useSharedValue(0);
  const knob = knobSize(t);
  const max = Math.max(0, trackWidth - knob);

  const finish = () => {
    haptics.success();
    onComplete();
  };

  const pan = usePanGesture({
    activeOffsetX: [-8, 8],
    onUpdate: event => {
      'worklet';
      x.value = Math.min(max, Math.max(0, event.translationX));
    },
    onDeactivate: () => {
      'worklet';
      if (max && x.value >= max * COMPLETE_AT) scheduleOnRN(finish);
      x.value = withSpring(0, t.motion.spring);
    },
  });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, max * 0.6 || 1], [1, 0], Extrapolation.CLAMP),
  }));

  const onLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);

  return (
    <Animated.View
      entering={springUp(2)}
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingHorizontal: t.space[4], paddingBottom: Math.max(insets.bottom, t.space[3]) },
      ]}
    >
      <AppGlass radius={t.radius.pill} style={{ padding: t.space[1] }}>
        <View
          onLayout={onLayout}
          accessible
          accessibilityRole="button"
          accessibilityLabel={startAt(connectorId)}
          accessibilityHint={DETAILS_COPY.slideHint}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={event => {
            if (event.nativeEvent.actionName === 'activate') finish();
          }}
          style={[styles.center, { height: knob }]}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.row, { gap: t.space[1], paddingLeft: knob }, labelStyle]}
          >
            <AppText variant="headline" tabular>
              {slideLabel(connectorId)}
            </AppText>
            <ChevronsRight
              color={t.colors.textTertiary}
              size={t.icon.control}
              strokeWidth={t.icon.stroke}
            />
          </Animated.View>

          <GestureDetector gesture={pan}>
            <Animated.View
              style={[
                styles.knob,
                styles.center,
                {
                  width: knob,
                  height: knob,
                  borderRadius: t.radius.pill,
                  backgroundColor: t.colors.accent,
                },
                knobStyle,
              ]}
            >
              <Zap color={t.colors.onAccent} size={t.icon.nav} strokeWidth={t.icon.stroke} />
            </Animated.View>
          </GestureDetector>
        </View>
      </AppGlass>
    </Animated.View>
  );
};

export default SlideToCharge;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
