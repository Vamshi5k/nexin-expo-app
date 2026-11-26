import { StyleSheet, View } from 'react-native';

import { Heart, Navigation, Zap } from 'lucide-react-native';

import { AppPressable, AppStatusChip, AppText } from '@/shared/components';

import CardGradient from './CardGradient';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { CARD_COPY, LIST_COPY } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance } from '../utils/geo';
import { listAvailability } from '../utils/list';
import { pinColorKey } from '../utils/status';

type StationListCardProps = {
  station: NearbyStation;
  favourite: boolean;
  onPress: (stationId: string) => void;
  onToggleFavourite: (stationId: string) => void;
};

// The map card's language, sized for a list: status gradient, name and address with a heart,
// then availability, power, price and distance on one line.
const StationListCard = ({
  station,
  favourite,
  onPress,
  onToggleFavourite,
}: StationListCardProps) => {
  const t = useTheme();
  const availability = listAvailability(station);
  // The tint agrees with the pill: red when nothing is free, even if the station is open.
  const tints = {
    success: t.colors.connector[pinColorKey(station.status)],
    danger: t.colors.danger,
    warning: t.colors.warning,
    neutral: t.colors.connector[pinColorKey(station.status)],
  };
  const statusColor = tints[availability.tone];
  const heartColor = favourite ? t.colors.danger : t.colors.textSecondary;

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        styles.card,
        {
          gap: t.space[3],
          padding: t.space[3],
          paddingLeft: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <CardGradient color={statusColor} id={`station-list-${station.id}`} />

      <View style={[styles.row, { gap: t.space[2] }]}>
        <View style={styles.grow}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {station.name}
          </AppText>
          {station.address ? (
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {station.address}
            </AppText>
          ) : null}
        </View>
        <AppPressable
          onPress={() => onToggleFavourite(station.id)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${favourite ? LIST_COPY.removeFavourite : LIST_COPY.addFavourite}, ${station.name}`}
          accessibilityState={{ selected: favourite }}
          style={[
            styles.center,
            {
              width: t.layout.minTouch,
              height: t.layout.minTouch,
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.surface,
            },
          ]}
        >
          <Heart
            color={heartColor}
            fill={favourite ? heartColor : 'transparent'}
            size={t.icon.meta}
            strokeWidth={t.icon.stroke}
          />
        </AppPressable>
      </View>

      <View style={[styles.row, { gap: t.space[2] }]}>
        <AppStatusChip label={availability.label} tone={availability.tone} />
        {station.maxPowerKw !== null ? (
          <View style={[styles.row, { gap: t.space[1] }]}>
            <Zap
              color={t.colors.accentText}
              fill={t.colors.accentText}
              size={t.icon.meta}
              strokeWidth={t.icon.stroke}
            />
            <AppText variant="caption" tabular>
              {`${station.maxPowerKw} kW`}
            </AppText>
          </View>
        ) : null}
        {station.pricePerKwhPaise !== null ? (
          <AppText variant="caption" tabular tone="secondary">
            {`${formatRate(station.pricePerKwhPaise)}${CARD_COPY.price}`}
          </AppText>
        ) : null}
        <View style={styles.grow} />
        {station.distanceKm !== null ? (
          <View style={[styles.row, { gap: t.space[1] }]}>
            <Navigation
              color={t.colors.textSecondary}
              size={t.icon.meta}
              strokeWidth={t.icon.stroke}
            />
            <AppText variant="caption" tabular tone="secondary">
              {formatDistance(station.distanceKm, brand.locale)}
            </AppText>
          </View>
        ) : null}
      </View>
    </AppPressable>
  );
};

export default StationListCard;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
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
