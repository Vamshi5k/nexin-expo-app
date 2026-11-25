import { StyleSheet, View } from 'react-native';

import { Zap } from 'lucide-react-native';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { formatPaise } from '@/shared/utils/money';

import { CARD_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { availabilityOf, type Availability } from '../utils/status';

type StationCardProps = {
  station: NearbyStation;
  selected: boolean;
  width: number;
  onPress: (stationId: string) => void;
};

type MeterProps = { free: number; total: number; freeColor: string; busyColor: string };

export const STATION_CARD_HEIGHT = 120;
const MAX_METER_BARS = 6;

// One bar per connector, free ones filled: availability at a glance.
const Meter = ({ free, total, freeColor, busyColor }: MeterProps) => {
  const bars = Math.min(total, MAX_METER_BARS);
  const filled = Math.round((Math.min(free, total) / total) * bars);

  return (
    <View style={styles.meter}>
      {Array.from({ length: bars }, (_, index) => (
        <View
          key={index}
          style={[styles.bar, { backgroundColor: index < filled ? freeColor : busyColor }]}
        />
      ))}
    </View>
  );
};

const distanceLabel = (km: number | null) => {
  if (km === null) return null;
  if (km > MAX_ETA_KM) return formatDistance(km);
  return `${formatDistance(km)} · ${formatEta(km)}`;
};

const StationCard = ({ station, selected, width, onPress }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const { availableConnectors: free, totalConnectors: total } = station;

  const toneColor: Record<Availability['tone'], string> = {
    success: t.colors.successText,
    warning: t.colors.warningText,
    danger: t.colors.dangerText,
    neutral: t.colors.textSecondary,
  };

  const showMeter = availability.tone === 'success' && free !== null && total !== null && total > 0;
  const statusLabel = showMeter
    ? `${Math.min(free, total)} of ${total} ${CARD_COPY.free}`
    : availability.label;

  const where = [distanceLabel(station.distanceKm), station.address].filter(Boolean).join(' · ');
  const [firstConnector, ...otherConnectors] = station.connectorTypes;

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        styles.card,
        {
          width,
          borderRadius: t.radius.card,
          backgroundColor: t.colors.surfaceRaised,
          borderColor: selected ? t.colors.accent : t.colors.border,
          borderWidth: selected ? 1.5 : t.layout.hairline,
        },
      ]}
    >
      <View style={[styles.row, styles.top, { gap: t.space[3] }]}>
        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {station.name}
          </AppText>
          {where ? (
            <AppText variant="caption" tone="tertiary" numberOfLines={1} tabular>
              {where}
            </AppText>
          ) : null}
        </View>

        {station.pricePerKwhPaise !== null ? (
          <View style={styles.price}>
            <AppText variant="title2" tabular>
              {formatPaise(station.pricePerKwhPaise)}
            </AppText>
            <AppText variant="caption" tone="tertiary">
              {CARD_COPY.price}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={[styles.row, { gap: t.space[4] }]}>
        <View style={[styles.row, styles.grow, { gap: t.space[2] }]}>
          {showMeter ? (
            <Meter
              free={free}
              total={total}
              freeColor={t.colors.success}
              busyColor={t.colors.surfaceSunken}
            />
          ) : (
            <View style={[styles.dot, { backgroundColor: toneColor[availability.tone] }]} />
          )}
          <AppText
            variant="caption"
            numberOfLines={1}
            style={{ color: toneColor[availability.tone] }}
          >
            {statusLabel}
          </AppText>
        </View>

        {station.maxPowerKw !== null ? (
          <View style={[styles.row, { gap: 3 }]}>
            <Zap color={t.colors.accentText} size={13} strokeWidth={2} />
            <AppText variant="caption" tone="secondary" tabular>
              {station.maxPowerKw} kW
            </AppText>
          </View>
        ) : null}

        {firstConnector ? (
          <View style={[styles.row, { gap: 4 }]}>
            <AppConnectorIcon type={firstConnector} size={15} />
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {otherConnectors.length
                ? `${firstConnector} +${otherConnectors.length}`
                : firstConnector}
            </AppText>
          </View>
        ) : null}
      </View>
    </AppPressable>
  );
};

export default StationCard;

const styles = StyleSheet.create({
  card: {
    height: STATION_CARD_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  top: {
    alignItems: 'flex-start',
  },
  grow: {
    flex: 1,
    gap: 3,
  },
  price: {
    alignItems: 'flex-end',
  },
  meter: {
    flexDirection: 'row',
    gap: 3,
  },
  bar: {
    width: 12,
    height: 6,
    borderRadius: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
