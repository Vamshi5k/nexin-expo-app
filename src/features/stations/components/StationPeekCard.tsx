import { StyleSheet, View } from 'react-native';

import { ChevronRight, Zap } from 'lucide-react-native';
import Animated, { Easing, FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { AppPressable, AppText } from '@/shared/components';

import StationStatusStrip from './StationStatusStrip';

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
        style={{
          gap: t.space[3],
          padding: t.space[4],
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.selectedBorder,
          backgroundColor: t.colors.surfaceRaised,
          borderColor: t.colors.accent,
        }}
      >
        <View style={[styles.row, { gap: t.space[3] }]}>
          <View
            style={[
              styles.center,
              {
                width: t.layout.minTouch,
                height: t.layout.minTouch,
                borderRadius: t.radius.control,
                backgroundColor: t.colors.accentSoft,
              },
            ]}
          >
            <Zap color={t.colors.accentText} size={t.icon.control} strokeWidth={t.icon.stroke} />
          </View>
          <View style={styles.grow}>
            <AppText variant="headline" numberOfLines={1}>
              {pin.name}
            </AppText>
            <AppText variant="subhead" tone="secondary">
              {MAP_COPY.viewDetails}
            </AppText>
          </View>
          <ChevronRight
            color={t.colors.textTertiary}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
        </View>

        <StationStatusStrip badge={badge} />
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
