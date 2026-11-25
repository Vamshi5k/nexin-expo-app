import { StyleSheet, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';
import Animated, { Easing, FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { AppPressable, AppText } from '@/shared/components';

import StationBadge from './StationBadge';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';
import type { StationPin } from '../types/stations.types';
import { badgeOf, STATUS_LABEL } from '../utils/status';

type StationPeekCardProps = {
  pin: StationPin;
  onPress: (stationId: string) => void;
};

const StationPeekCard = ({ pin, onPress }: StationPeekCardProps) => {
  const t = useTheme();
  const badge = badgeOf({ status: pin.status, availableConnectors: null, totalConnectors: null });

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
          styles.card,
          {
            gap: t.space[3],
            padding: t.space[4],
            borderRadius: t.radius.card,
            borderWidth: t.layout.selectedBorder,
            backgroundColor: t.colors.surfaceRaised,
            borderColor: t.colors.accent,
          },
        ]}
      >
        <StationBadge badge={badge} />
        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {pin.name}
          </AppText>
          <AppText variant="caption" tone="secondary">
            {STATUS_LABEL[pin.status]} · {MAP_COPY.viewDetails}
          </AppText>
        </View>
        <ChevronRight
          color={t.colors.textTertiary}
          size={t.icon.control}
          strokeWidth={t.icon.stroke}
        />
      </AppPressable>
    </Animated.View>
  );
};

export default StationPeekCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
});
