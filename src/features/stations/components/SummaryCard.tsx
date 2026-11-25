import { StyleSheet, View } from 'react-native';

import Svg, { Circle } from 'react-native-svg';

import { AppText } from '@/shared/components';

import BrandGradient from './BrandGradient';

import { useTheme, withAlpha } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { DETAILS_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { freeConnectors } from '../utils/connector';
import { formatDistance, formatEta } from '../utils/geo';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type SummaryCardProps = {
  station: StationDetails;
  distance: number | null;
};

type Fact = { value: string; label: string };

const RING_STROKE = 6;

const facts = (station: StationDetails, distance: number | null): Fact[] => {
  const powers = station.chargers.map(charger => charger.capacityKw).filter(isNumber);
  const prices = station.chargers.map(charger => charger.pricePerKwhPaise).filter(isNumber);

  const list: (Fact | null)[] = [
    distance !== null
      ? { value: formatDistance(distance, brand.locale), label: DETAILS_COPY.distance }
      : null,
    distance !== null && distance <= MAX_ETA_KM
      ? { value: formatEta(distance), label: DETAILS_COPY.drive }
      : null,
    powers.length ? { value: `${Math.max(...powers)} kW`, label: DETAILS_COPY.power } : null,
    prices.length ? { value: formatRate(Math.min(...prices)), label: DETAILS_COPY.perKwh } : null,
  ];
  return list.filter((fact): fact is Fact => fact !== null);
};

function isNumber(value: number | null): value is number {
  return value !== null;
}

// Everything that decides "do I go here" on one brand-gradient card: status, where, how many
// connectors are free right now, and how far, how fast and how much.
const SummaryCard = ({ station, distance }: SummaryCardProps) => {
  const t = useTheme();
  const ink = t.colors.onAccent;
  const statusColor = t.colors.connector[pinColorKey(station.status)];

  const total = station.chargers.reduce((sum, charger) => sum + charger.connectors.length, 0);
  const free = station.chargers.reduce((sum, charger) => sum + freeConnectors(charger), 0);

  const ring = t.space[12] * 2;
  const radius = (ring - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const share = total ? free / total : 0;

  return (
    <View
      style={{
        gap: t.space[5],
        padding: t.space[5],
        borderRadius: t.radius.sheet,
        overflow: 'hidden',
      }}
    >
      <BrandGradient id="summary-card" from={t.colors.accent} to={t.colors.accentPressed} />

      <View style={{ gap: t.space[2] }}>
        <View
          style={[
            styles.row,
            styles.pill,
            {
              gap: t.space[2],
              paddingHorizontal: t.space[3],
              paddingVertical: t.space[1],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.surface,
            },
          ]}
        >
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
        <AppText variant="title1" accessibilityRole="header" style={{ color: ink }}>
          {station.name}
        </AppText>
        {station.address ? (
          <AppText variant="subhead" style={{ color: withAlpha(ink, 0.8) }}>
            {station.address}
          </AppText>
        ) : null}
      </View>

      <View style={[styles.row, { gap: t.space[5] }]}>
        <View
          accessible
          accessibilityLabel={`${free} of ${total} connectors free`}
          style={[styles.center, { width: ring, height: ring }]}
        >
          <Svg width={ring} height={ring} style={StyleSheet.absoluteFill}>
            <Circle
              cx={ring / 2}
              cy={ring / 2}
              r={radius}
              stroke={withAlpha(ink, 0.18)}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={ring / 2}
              cy={ring / 2}
              r={radius}
              stroke={t.colors.surface}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${circumference * share} ${circumference}`}
              transform={`rotate(-90 ${ring / 2} ${ring / 2})`}
              fill="none"
            />
          </Svg>
          <AppText variant="title2" tabular style={{ color: ink }}>
            {free}/{total}
          </AppText>
          <AppText variant="caption" style={{ color: withAlpha(ink, 0.8) }}>
            {DETAILS_COPY.free}
          </AppText>
        </View>

        <View style={[styles.grow, styles.facts, { rowGap: t.space[3] }]}>
          {facts(station, distance).map(fact => (
            <View key={fact.label} style={styles.fact}>
              <AppText variant="headline" tabular numberOfLines={1} style={{ color: ink }}>
                {fact.value}
              </AppText>
              <AppText variant="caption" numberOfLines={1} style={{ color: withAlpha(ink, 0.75) }}>
                {fact.label}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default SummaryCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    alignSelf: 'flex-start',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fact: {
    width: '50%',
  },
});
