import { StyleSheet, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';
import Animated, { Easing, FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { AppPressable, AppStatusChip, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';
import type { StationPin } from '../types/stations.types';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationPeekCardProps = {
  pin: StationPin;
  onPress: (stationId: string) => void;
};

const StationPeekCard = ({ pin, onPress }: StationPeekCardProps) => {
  const t = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(t.motion.duration).easing(Easing.out(Easing.cubic))}
      exiting={FadeOutDown.duration(t.motion.durationFast)}
    >
      <AppPressable
        onPress={() => onPress(pin.id)}
        accessibilityRole="button"
        accessibilityLabel={`${pin.name}, ${STATUS_LABEL[pin.status]}. ${MAP_COPY.viewDetails}`}
        style={[
          styles.row,
          {
            gap: t.space[4],
            padding: t.space[5],
            borderRadius: t.radius.sheet,
            borderWidth: t.layout.selectedBorder,
            backgroundColor: t.colors.surfaceRaised,
            borderColor: t.colors.accent,
          },
        ]}
      >
        <View style={[styles.grow, { gap: t.space[1] }]}>
          <AppStatusChip label={STATUS_LABEL[pin.status]} connector={pinColorKey(pin.status)} />
          <AppText variant="headline" numberOfLines={1}>
            {pin.name}
          </AppText>
          <AppText variant="caption" tone="secondary">
            {MAP_COPY.viewDetails}
          </AppText>
        </View>
        <View
          style={[
            styles.center,
            {
              width: t.layout.minTouch,
              height: t.layout.minTouch,
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.surfaceSunken,
            },
          ]}
        >
          <ChevronRight
            color={t.colors.textSecondary}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
        </View>
      </AppPressable>
    </Animated.View>
  );
};

export default StationPeekCard;

const styles = StyleSheet.create({
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
