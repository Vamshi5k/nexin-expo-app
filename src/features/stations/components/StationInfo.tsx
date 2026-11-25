import { StyleSheet, View } from 'react-native';

import { Image } from 'expo-image';
import { Clock, IndianRupee, MapPin, Zap, type LucideIcon } from 'lucide-react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { DETAILS_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationInfoProps = {
  station: StationDetails;
  distance: number | null;
};

type Tile = { icon: LucideIcon; value: string; label: string };

const infoTiles = (station: StationDetails, distance: number | null): Tile[] => {
  const powers = station.chargers.map(charger => charger.capacityKw).filter(isNumber);
  const prices = station.chargers.map(charger => charger.pricePerKwhPaise).filter(isNumber);

  const tiles: (Tile | null)[] = [
    distance !== null
      ? {
          icon: MapPin,
          value: formatDistance(distance, brand.locale),
          label: DETAILS_COPY.distance,
        }
      : null,
    distance !== null && distance <= MAX_ETA_KM
      ? { icon: Clock, value: formatEta(distance), label: DETAILS_COPY.drive }
      : null,
    powers.length
      ? { icon: Zap, value: `${Math.max(...powers)} kW`, label: DETAILS_COPY.power }
      : null,
    prices.length
      ? { icon: IndianRupee, value: formatRate(Math.min(...prices)), label: DETAILS_COPY.perKwh }
      : null,
  ];
  return tiles.filter((tile): tile is Tile => tile !== null);
};

function isNumber(value: number | null): value is number {
  return value !== null;
}

// Uber-style: a big bold title, one quiet status line, then figures as soft tiles.
const StationInfo = ({ station, distance }: StationInfoProps) => {
  const t = useTheme();
  const tiles = infoTiles(station, distance);
  const statusColor = t.colors.connector[pinColorKey(station.status)];

  return (
    <View style={{ gap: t.space[5] }}>
      <View style={[styles.row, { gap: t.space[4] }]}>
        <View style={[styles.grow, { gap: t.space[2] }]}>
          <AppText variant="title1" accessibilityRole="header">
            {station.name}
          </AppText>
          <View style={[styles.row, { gap: t.space[2] }]}>
            <View
              style={{
                width: t.space[2],
                height: t.space[2],
                borderRadius: t.radius.pill,
                backgroundColor: statusColor,
              }}
            />
            <AppText variant="subhead" numberOfLines={2} style={styles.grow}>
              {STATUS_LABEL[station.status]}
              {station.address ? (
                <AppText variant="subhead" tone="secondary">
                  {`  ·  ${station.address}`}
                </AppText>
              ) : null}
            </AppText>
          </View>
        </View>
        {station.imageUrl ? (
          <Image
            source={{ uri: station.imageUrl }}
            style={{
              width: t.space[12] + t.space[4],
              height: t.space[12] + t.space[4],
              borderRadius: t.radius.control,
            }}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
        ) : null}
      </View>

      {tiles.length ? (
        <View style={[styles.grid, { gap: t.space[2] }]}>
          {tiles.map(({ icon: Icon, value, label }) => (
            <View
              key={label}
              style={[
                styles.tile,
                {
                  gap: t.space[2],
                  padding: t.space[3],
                  borderRadius: t.radius.control,
                  backgroundColor: t.colors.surfaceSunken,
                },
              ]}
            >
              <Icon color={t.colors.textPrimary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
              <View>
                <AppText variant="headline" tabular numberOfLines={1}>
                  {value}
                </AppText>
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                  {label}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default StationInfo;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
  },
});
