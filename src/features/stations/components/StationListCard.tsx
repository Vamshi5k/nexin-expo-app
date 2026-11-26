import { StyleSheet, View } from 'react-native';

import { Heart, Navigation, Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import CardGradient from './CardGradient';
import StatRow, { type Stat } from './StatRow';
import StatusDot from './StatusDot';

import { useTheme, withAlpha, type Theme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { CARD_COPY, LIST_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { listAvailability } from '../utils/list';
import { pinColorKey } from '../utils/status';

type StationListCardProps = {
  station: NearbyStation;
  favourite: boolean;
  onPress: (stationId: string) => void;
  onToggleFavourite: (stationId: string) => void;
  onDirections: (station: NearbyStation) => void;
};

const pillHeight = (t: Theme) => t.space[6] + t.space[1];

const footerStats = (station: NearbyStation): Stat[] => {
  const km = station.distanceKm;
  const stats: (Stat | null)[] = [
    km !== null ? { value: formatDistance(km, brand.locale), label: CARD_COPY.distance } : null,
    km !== null && km <= MAX_ETA_KM ? { value: formatEta(km), label: CARD_COPY.drive } : null,
    station.pricePerKwhPaise !== null
      ? { value: formatRate(station.pricePerKwhPaise), label: CARD_COPY.perKwh }
      : null,
  ];
  return stats.filter((stat): stat is Stat => stat !== null);
};

// The map card at list size: status and power pills with the heart, the name, then distance,
// drive and price beside the dark Go pill. The tint follows availability, so a station with
// nothing free reads red even while it is open.
const StationListCard = ({
  station,
  favourite,
  onPress,
  onToggleFavourite,
  onDirections,
}: StationListCardProps) => {
  const t = useTheme();
  const availability = listAvailability(station);
  const stationColor = t.colors.connector[pinColorKey(station.status)];
  const tints = {
    success: stationColor,
    danger: t.colors.danger,
    warning: t.colors.warning,
    neutral: stationColor,
  };
  const tint = tints[availability.tone];
  const heartColor = favourite ? t.colors.danger : t.colors.textPrimary;
  const stats = footerStats(station);

  const pill = {
    height: pillHeight(t),
    gap: t.space[2],
    paddingHorizontal: t.space[3],
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surface,
  };

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        styles.card,
        {
          gap: t.space[3],
          padding: t.space[4],
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <CardGradient color={tint} id={`station-list-${station.id}`} />

      <View style={[styles.row, { gap: t.space[2] }]}>
        <View style={[styles.row, pill]}>
          <StatusDot color={tint} />
          <AppText variant="caption">{availability.label}</AppText>
        </View>
        {station.maxPowerKw !== null ? (
          <View
            style={[
              styles.row,
              pill,
              { gap: t.space[1], backgroundColor: withAlpha(t.colors.surface, 0.8) },
            ]}
          >
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
        <View style={styles.grow} />
        <AppPressable
          onPress={() => onToggleFavourite(station.id)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${favourite ? LIST_COPY.removeFavourite : LIST_COPY.addFavourite}, ${station.name}`}
          accessibilityState={{ selected: favourite }}
          hitSlop={t.space[2]}
          style={[
            styles.center,
            {
              width: pillHeight(t) + t.space[2],
              height: pillHeight(t) + t.space[2],
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

      <View>
        <AppText variant="headline" numberOfLines={1}>
          {station.name}
        </AppText>
        {station.address ? (
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {station.address}
          </AppText>
        ) : null}
      </View>

      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={styles.grow}>
          <StatRow stats={stats} />
        </View>
        <AppPressable
          onPress={() => onDirections(station)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${CARD_COPY.directions} ${station.name}`}
          style={[
            styles.row,
            {
              gap: t.space[2],
              height: t.layout.minTouch,
              paddingHorizontal: t.space[4],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.textPrimary,
            },
          ]}
        >
          <Navigation color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
          <AppText variant="subhead" style={{ color: t.colors.surface }}>
            {CARD_COPY.go}
          </AppText>
        </AppPressable>
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
