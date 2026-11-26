import { StyleSheet, View } from 'react-native';

import { Zap } from 'lucide-react-native';

import { AppText } from '@/shared/components';

import CardGradient from './CardGradient';
import ChargerArt from './ChargerArt';
import StatRow, { type Stat } from './StatRow';

import { useTheme, withAlpha } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { DETAILS_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type DetailsHeroCardProps = {
  station: StationDetails;
  distance: number | null;
};

const heroStats = (station: StationDetails, distance: number | null): Stat[] => {
  const prices = station.chargers.map(charger => charger.pricePerKwhPaise).filter(isNumber);

  const stats: (Stat | null)[] = [
    distance !== null
      ? { value: formatDistance(distance, brand.locale), label: DETAILS_COPY.distance }
      : null,
    distance !== null && distance <= MAX_ETA_KM
      ? { value: formatEta(distance), label: DETAILS_COPY.drive }
      : null,
    prices.length ? { value: formatRate(Math.min(...prices)), label: DETAILS_COPY.perKwh } : null,
  ];
  return stats.filter((stat): stat is Stat => stat !== null);
};

function isNumber(value: number | null): value is number {
  return value !== null;
}

// The map card, grown up: same status gradient, pills, charger art and stat row, so tapping a
// card on the map feels like it simply opens.
const DetailsHeroCard = ({ station, distance }: DetailsHeroCardProps) => {
  const t = useTheme();
  const statusColor = t.colors.connector[pinColorKey(station.status)];
  const powers = station.chargers.map(charger => charger.capacityKw).filter(isNumber);
  const stats = heroStats(station, distance);

  const pill = {
    height: t.space[6] + t.space[1],
    gap: t.space[2],
    paddingHorizontal: t.space[3],
    borderRadius: t.radius.pill,
  };

  return (
    <View
      style={[
        styles.card,
        {
          gap: t.space[4],
          padding: t.space[5],
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <CardGradient color={statusColor} id={`details-hero-${station.id}`} />

      <View style={[styles.row, styles.between]}>
        <View style={[styles.row, pill, { backgroundColor: t.colors.surface }]}>
          <View
            style={{
              width: t.space[2],
              height: t.space[2],
              borderRadius: t.radius.pill,
              backgroundColor: statusColor,
            }}
          />
          <AppText variant="caption">{STATUS_LABEL[station.status]}</AppText>
        </View>

        {powers.length ? (
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
            <AppText variant="subhead" tabular>
              {`${Math.max(...powers)} kW`}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={[styles.grow, { gap: t.space[1] }]}>
          <AppText variant="title1" numberOfLines={3} accessibilityRole="header">
            {station.name}
          </AppText>
          {station.address ? (
            <AppText variant="subhead" tone="secondary" numberOfLines={2}>
              {station.address}
            </AppText>
          ) : null}
        </View>
        <ChargerArt size={t.space[12] * 2 + t.space[4]} glow={statusColor} />
      </View>

      {stats.length ? <StatRow stats={stats} /> : null}
    </View>
  );
};

export default DetailsHeroCard;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  grow: {
    flex: 1,
  },
});
