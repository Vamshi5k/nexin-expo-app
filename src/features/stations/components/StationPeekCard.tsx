import { StyleSheet, View } from 'react-native';

import { ChevronRight, Zap } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { AppPressable, AppText } from '@/shared/components';

import { STATION_CARD_HEIGHT } from './StationCard';

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
      entering={FadeInDown.springify().damping(18).stiffness(220)}
      exiting={FadeOutDown.duration(t.motion.durationFast)}
    >
      <AppPressable
        onPress={() => onPress(pin.id)}
        accessibilityRole="button"
        accessibilityLabel={`${pin.name}, ${STATUS_LABEL[pin.status]}. ${MAP_COPY.viewDetails}`}
        style={[
          styles.card,
          {
            gap: t.space[3],
            borderRadius: t.radius.card,
            backgroundColor: t.colors.surfaceRaised,
            borderColor: t.colors.accent,
          },
        ]}
      >
        <View
          style={[
            styles.tile,
            { borderRadius: t.radius.control, backgroundColor: t.colors.accent },
          ]}
        >
          <Zap color={t.colors.onAccent} size={20} strokeWidth={1.75} />
        </View>
        <View style={styles.body}>
          <AppText variant="headline" numberOfLines={1}>
            {pin.name}
          </AppText>
          <View style={[styles.row, { gap: t.space[2] }]}>
            <View
              style={[styles.dot, { backgroundColor: t.colors.connector[pinColorKey(pin.status)] }]}
            />
            <AppText variant="caption" tone="secondary">
              {STATUS_LABEL[pin.status]} · {MAP_COPY.viewDetails}
            </AppText>
          </View>
        </View>
        <ChevronRight color={t.colors.textTertiary} size={20} strokeWidth={1.75} />
      </AppPressable>
    </Animated.View>
  );
};

export default StationPeekCard;

const styles = StyleSheet.create({
  card: {
    minHeight: STATION_CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
