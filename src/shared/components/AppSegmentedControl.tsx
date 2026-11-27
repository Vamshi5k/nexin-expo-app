import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import AppPressable from './AppPressable';
import AppText from './AppText';

import { useTheme, withAlpha } from '@/shared/theme';

export type Segment<T extends string> = { value: T; label: string; badge?: string };

export type AppSegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

const PAD = 4;
const HEIGHT = 40;

// A white pill track with one dark thumb that springs to the selected segment.
const AppSegmentedControl = <T extends string>({
  segments,
  value,
  onChange,
  accessibilityLabel,
}: AppSegmentedControlProps<T>) => {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    segments.findIndex(s => s.value === value),
  );
  const segmentWidth = width ? (width - PAD * 2) / segments.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    const target = index * segmentWidth;
    x.set(reduceMotion ? target : withSpring(target, t.motion.springSnappy));
  }, [index, segmentWidth, reduceMotion, t.motion.springSnappy, x]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      style={[
        styles.track,
        {
          height: HEIGHT,
          padding: PAD,
          borderRadius: t.radius.pill,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      {segmentWidth ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              top: PAD,
              left: PAD,
              bottom: PAD,
              width: segmentWidth,
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.textPrimary,
            },
            thumbStyle,
          ]}
        />
      ) : null}

      {segments.map(s => {
        const selected = s.value === value;
        return (
          <AppPressable
            key={s.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={s.label}
            onPress={() => !selected && onChange(s.value)}
            haptic={selected ? false : 'selection'}
            feedback="opacity"
            style={[styles.segment, { gap: t.space[2] }]}
          >
            <AppText
              variant="subhead"
              numberOfLines={1}
              style={{
                fontFamily: t.type.headline.fontFamily,
                color: selected ? t.colors.surface : t.colors.textSecondary,
              }}
            >
              {s.label}
            </AppText>
            {s.badge ? (
              <AppText
                variant="caption"
                tabular
                style={{
                  color: selected ? withAlpha(t.colors.surface, 0.6) : t.colors.textTertiary,
                }}
              >
                {s.badge}
              </AppText>
            ) : null}
          </AppPressable>
        );
      })}
    </View>
  );
};

export default AppSegmentedControl;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
  },
  thumb: {
    position: 'absolute',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
