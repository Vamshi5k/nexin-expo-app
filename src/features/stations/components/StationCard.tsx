import { StyleSheet, View } from 'react-native';

import { Navigation, ZapOff } from 'lucide-react-native';

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
  onDirections: (station: NearbyStation) => void;
};

export const STATION_CARD_HEIGHT = 136;
const BADGE_SIZE = 56;
const GO_SIZE = 36;

const distanceLabel = (km: number | null) => {
  if (km === null) return null;
  if (km > MAX_ETA_KM) return formatDistance(km);
  return `${formatDistance(km)} · ${formatEta(km)}`;
};

const connectorLabel = (station: NearbyStation) => {
  const [first, ...rest] = station.connectorTypes;
  const parts = [
    first ? (rest.length ? `${first} +${rest.length}` : first) : null,
    station.maxPowerKw !== null ? `${station.maxPowerKw} kW` : null,
  ];
  return parts.filter(Boolean).join(' · ');
};

const StationCard = ({ station, selected, width, onPress, onDirections }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const { availableConnectors: free, totalConnectors: total } = station;

  const tones: Record<Availability['tone'], { bg: string; fg: string }> = {
    success: { bg: t.colors.successSoft, fg: t.colors.successText },
    warning: { bg: t.colors.warningSoft, fg: t.colors.warningText },
    danger: { bg: t.colors.dangerSoft, fg: t.colors.dangerText },
    neutral: { bg: t.colors.surfaceSunken, fg: t.colors.textSecondary },
  };
  const tone = tones[availability.tone];
  const hasCounts = availability.tone === 'success' && free !== null && total !== null;

  const connectors = connectorLabel(station);
  const distance = distanceLabel(station.distanceKm);

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        styles.card,
        {
          width,
          gap: t.space[3],
          borderRadius: t.radius.card,
          backgroundColor: t.colors.surfaceRaised,
          borderColor: selected ? t.colors.accent : t.colors.border,
          borderWidth: selected ? 1.5 : t.layout.hairline,
        },
      ]}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={[styles.badge, { backgroundColor: tone.bg, borderRadius: t.radius.control }]}>
          {hasCounts ? (
            <>
              <AppText variant="headline" tabular style={{ color: tone.fg }}>
                {Math.min(free, total)}/{total}
              </AppText>
              <AppText variant="caption" style={[styles.badgeLabel, { color: tone.fg }]}>
                {CARD_COPY.free}
              </AppText>
            </>
          ) : (
            <>
              <ZapOff color={tone.fg} size={18} strokeWidth={1.75} />
              <AppText
                variant="caption"
                numberOfLines={1}
                style={[styles.badgeLabel, { color: tone.fg }]}
              >
                {availability.tone === 'neutral' ? CARD_COPY.unknown : CARD_COPY.off}
              </AppText>
            </>
          )}
        </View>

        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {station.name}
          </AppText>
          {distance ? (
            <AppText variant="caption" tone="secondary" tabular numberOfLines={1}>
              {distance}
            </AppText>
          ) : null}
          {station.address ? (
            <AppText variant="caption" tone="tertiary" numberOfLines={1}>
              {station.address}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={[styles.footer, { gap: t.space[3], borderTopColor: t.colors.border }]}>
        <View style={[styles.row, styles.grow, { gap: 6 }]}>
          {station.connectorTypes[0] ? (
            <AppConnectorIcon type={station.connectorTypes[0]} size={16} />
          ) : null}
          <AppText variant="caption" tone="secondary" numberOfLines={1} tabular>
            {connectors}
          </AppText>
        </View>

        {station.pricePerKwhPaise !== null ? (
          <AppText variant="subhead" tabular>
            {formatPaise(station.pricePerKwhPaise)}
            <AppText variant="caption" tone="tertiary">
              {' '}
              {CARD_COPY.price}
            </AppText>
          </AppText>
        ) : null}

        <AppPressable
          onPress={() => onDirections(station)}
          haptic="light"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${CARD_COPY.directions} ${station.name}`}
          style={[styles.go, { backgroundColor: t.colors.accent }]}
        >
          <Navigation color={t.colors.onAccent} size={16} strokeWidth={2} />
        </AppPressable>
      </View>
    </AppPressable>
  );
};

export default StationCard;

const styles = StyleSheet.create({
  card: {
    minHeight: STATION_CARD_HEIGHT,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
    gap: 1,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  go: {
    width: GO_SIZE,
    height: GO_SIZE,
    borderRadius: GO_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
