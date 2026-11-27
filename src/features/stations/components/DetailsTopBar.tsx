import { useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ChevronLeft, Heart, Share2, type LucideIcon } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppGlass, AppPressable, AppText } from '@/shared/components';

import { mapTopBarHeight } from './MapTopBar';

import { useTheme, type Theme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';

type DetailsTopBarProps = {
  title: string | null;
  subtitle?: string | null;
  statusColor?: string;
  isFavourite: boolean;
  barStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  titleStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  onBack: () => void;
  onShare: (() => void) | null;
  onToggleFavourite: (() => void) | null;
};

type GlassButtonProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
};

const POP_SCALE = 1.3;

// Status bar plus the capsule row: where scrolled content must stop.
export const topBarSpace = (t: Theme, topInset: number) =>
  topInset + t.space[2] + mapTopBarHeight(t) + t.space[2];

// The map's glass style, one circle per action so a photo shows between them.
const GlassButton = ({ icon: Icon, label, onPress, active }: GlassButtonProps) => {
  const t = useTheme();
  const color = active ? t.colors.danger : t.colors.textPrimary;
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(1);
  const wasActive = useRef(active);

  // A quick bounce when it turns on (the heart), not on first paint or when it turns off.
  useEffect(() => {
    const turnedOn = active && !wasActive.current;
    wasActive.current = active;
    if (!turnedOn || reduceMotion) return;
    pop.set(
      withSequence(withSpring(POP_SCALE, t.motion.springSnappy), withSpring(1, t.motion.spring)),
    );
  }, [active, pop, reduceMotion, t.motion.spring, t.motion.springSnappy]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <AppGlass radius={t.radius.pill} appearance="light">
      <AppPressable
        onPress={onPress}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={active === undefined ? undefined : { selected: active }}
        style={[styles.center, { width: t.layout.minTouch, height: t.layout.minTouch }]}
      >
        <Animated.View style={iconStyle}>
          <Icon
            color={color}
            fill={active ? color : 'transparent'}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
        </Animated.View>
      </AppPressable>
    </AppGlass>
  );
};

// Floats over the hero; once scrolled past it a solid bar (status bar included) fades in with
// the station name and address, so nothing scrolls visibly behind the buttons.
const DetailsTopBar = ({
  title,
  subtitle,
  statusColor,
  isFavourite,
  barStyle,
  titleStyle,
  onBack,
  onShare,
  onToggleFavourite,
}: DetailsTopBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { height: topBarSpace(t, insets.top) }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: t.colors.surface,
            borderBottomWidth: t.layout.hairline,
            borderBottomColor: t.colors.border,
          },
          barStyle,
        ]}
      />
      <View
        pointerEvents="box-none"
        style={[
          styles.row,
          {
            gap: t.space[3],
            marginTop: insets.top + t.space[2],
            height: mapTopBarHeight(t),
            paddingHorizontal: t.space[4],
          },
        ]}
      >
        <GlassButton icon={ChevronLeft} label={DETAILS_COPY.back} onPress={onBack} />
        <Animated.View style={[styles.grow, titleStyle]} pointerEvents="none">
          <AppText variant="headline" numberOfLines={1}>
            {title ?? ''}
          </AppText>
          {subtitle ? (
            <View style={[styles.row, { gap: t.space[1] + t.space[1] / 2 }]}>
              {statusColor ? (
                <View
                  style={{
                    width: t.space[2],
                    height: t.space[2],
                    borderRadius: t.radius.pill,
                    backgroundColor: statusColor,
                  }}
                />
              ) : null}
              <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.grow}>
                {subtitle}
              </AppText>
            </View>
          ) : null}
        </Animated.View>
        {onShare ? (
          <GlassButton icon={Share2} label={DETAILS_COPY.share} onPress={onShare} />
        ) : null}
        {onToggleFavourite ? (
          <GlassButton
            icon={Heart}
            label={isFavourite ? DETAILS_COPY.removeFavourite : DETAILS_COPY.addFavourite}
            onPress={onToggleFavourite}
            active={isFavourite}
          />
        ) : null}
      </View>
    </View>
  );
};

export default DetailsTopBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
