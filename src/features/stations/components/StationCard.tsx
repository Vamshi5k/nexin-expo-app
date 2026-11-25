import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { MapPin, Zap } from 'lucide-react-native';

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

type ChipProps = { background: string; children: ReactNode };

export const STATION_CARD_HEIGHT = 116;

const Chip = ({ background, children }: ChipProps) => (
  <View style={[styles.chip, { backgroundColor: background }]}>{children}</View>
);

const distanceLabel = (km: number | null) => {
  if (km === null) return null;
  if (km > MAX_ETA_KM) return formatDistance(km);
  return `${formatDistance(km)} · ${formatEta(km)}`;
};

// "2/4 free" reads faster than "2 Available" when both counts are known.
const freeLabel = (station: NearbyStation, availability: Availability) => {
  const { availableConnectors: free, totalConnectors: total } = station;
  if (availability.tone !== 'success' || free === null || total === null) return availability.label;
  return `${Math.min(free, total)}/${total} ${CARD_COPY.free}`;
};

const StationCard = ({ station, selected, width, onPress }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);

  const tones: Record<Availability['tone'], { bg: string; dot: string; fg: string }> = {
    success: { bg: t.colors.successSoft, dot: t.colors.success, fg: t.colors.successText },
    warning: { bg: t.colors.warningSoft, dot: t.colors.warning, fg: t.colors.warningText },
    danger: { bg: t.colors.dangerSoft, dot: t.colors.danger, fg: t.colors.dangerText },
    neutral: { bg: t.colors.surfaceSunken, dot: t.colors.textTertiary, fg: t.colors.textSecondary },
  };
  const tone = tones[availability.tone];

  const distance = distanceLabel(station.distanceKm);
  const where = [distance, station.address].filter(Boolean).join(' · ');
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
        },
      ]}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {station.name}
          </AppText>
          {where ? (
            <View style={[styles.row, { gap: t.space[1] }]}>
              <MapPin color={t.colors.textTertiary} size={13} strokeWidth={1.75} />
              <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.grow}>
                {where}
              </AppText>
            </View>
          ) : null}
        </View>

        {station.pricePerKwhPaise !== null ? (
          <View style={styles.price}>
            <AppText variant="headline" tabular>
              {formatPaise(station.pricePerKwhPaise)}
            </AppText>
            <AppText variant="caption" tone="tertiary">
              {CARD_COPY.price}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={[styles.row, { gap: t.space[2] }]}>
        <Chip background={tone.bg}>
          <View style={[styles.dot, { backgroundColor: tone.dot }]} />
          <AppText variant="caption" numberOfLines={1} style={{ color: tone.fg }}>
            {freeLabel(station, availability)}
          </AppText>
        </Chip>

        {station.maxPowerKw !== null ? (
          <Chip background={t.colors.surfaceSunken}>
            <Zap color={t.colors.accentText} size={12} strokeWidth={2} />
            <AppText variant="caption" tabular>
              {station.maxPowerKw} kW
            </AppText>
          </Chip>
        ) : null}

        {firstConnector ? (
          <Chip background={t.colors.surfaceSunken}>
            <AppConnectorIcon type={firstConnector} size={14} />
            <AppText variant="caption" numberOfLines={1}>
              {otherConnectors.length
                ? `${firstConnector} +${otherConnectors.length}`
                : firstConnector}
            </AppText>
          </Chip>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
    gap: 3,
  },
  price: {
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
  },
  chip: {
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 13,
    flexShrink: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
