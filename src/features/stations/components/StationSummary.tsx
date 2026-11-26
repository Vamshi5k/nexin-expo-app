import { StyleSheet, View } from 'react-native';

import { ArrowUpRight } from 'lucide-react-native';
import Animated from 'react-native-reanimated';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';
import { riseIn } from '@/shared/utils/motion';

import { CARD_COPY, DETAILS_COPY, routeLabel } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { canStartCharging } from '../utils/connector';
import { formatDistance } from '../utils/geo';

type StationSummaryProps = {
  station: StationDetails;
  distance: number | null;
  eta: string | null;
  onDirections: () => void;
};

type FigureTileProps = {
  label: string;
  value: string;
  unit: string;
};

const FigureTile = ({ label, value, unit }: FigureTileProps) => {
  const t = useTheme();

  return (
    <View
      style={[
        styles.grow,
        {
          gap: t.space[1] / 2,
          paddingHorizontal: t.space[3],
          paddingVertical: t.space[2] + t.space[1] / 2,
          borderRadius: t.radius.control,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <View style={[styles.baseline, { gap: t.space[1] / 2 }]}>
        <AppText variant="headline" tabular numberOfLines={1} style={styles.shrink}>
          {value}
        </AppText>
        <AppText variant="caption" tone="secondary">
          {unit}
        </AppText>
      </View>
    </View>
  );
};

// Under the hero: the name, then the figures a driver decides on, biggest first: how many
// connectors are free (with one square per connector), power and price, and the drive there.
const StationSummary = ({ station, distance, eta, onDirections }: StationSummaryProps) => {
  const t = useTheme();
  const connectors = station.chargers.flatMap(charger => charger.connectors);
  const free = connectors.filter(connector => canStartCharging(connector.state)).length;
  const powers = station.chargers.flatMap(charger =>
    charger.capacityKw !== null ? [charger.capacityKw] : [],
  );
  const prices = station.chargers.flatMap(charger =>
    charger.pricePerKwhPaise !== null ? [charger.pricePerKwhPaise] : [],
  );
  const ink = t.colors.onAccent;
  const square = t.space[3];

  return (
    <View style={{ gap: t.space[2] }}>
      <Animated.View entering={riseIn(0)} style={{ gap: t.space[1] / 2, marginBottom: t.space[1] }}>
        <AppText variant="title3" accessibilityRole="header">
          {station.name}
        </AppText>
        {station.address ? (
          <AppText variant="caption" tone="secondary">
            {station.address}
          </AppText>
        ) : null}
      </Animated.View>

      {connectors.length ? (
        <Animated.View
          entering={riseIn(1)}
          accessible
          accessibilityLabel={`${free} of ${connectors.length} ${DETAILS_COPY.connectorsFree}`}
          style={[
            styles.row,
            {
              gap: t.space[3],
              paddingHorizontal: t.space[3],
              paddingVertical: t.space[2] + t.space[1] / 2,
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accent,
            },
          ]}
        >
          <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
            <AppText variant="caption" style={[styles.overline, { color: ink }]}>
              {DETAILS_COPY.connectorsFree}
            </AppText>
            <View style={styles.baseline}>
              <AppText variant="title2" tabular style={{ color: ink }}>
                {free}
              </AppText>
              <AppText variant="caption" tabular style={{ color: withAlpha(ink, 0.6) }}>
                {`/${connectors.length}`}
              </AppText>
            </View>
          </View>
          <View style={[styles.wrap, { gap: t.space[1], maxWidth: (square + t.space[1]) * 4 }]}>
            {connectors.map(connector => {
              const open = canStartCharging(connector.state);
              const charging = connector.state === 'charging';
              return (
                <View
                  key={connector.id}
                  style={{
                    width: square,
                    height: square,
                    borderRadius: t.space[1],
                    borderWidth: charging ? 2 : 0,
                    borderColor: ink,
                    backgroundColor: open ? ink : charging ? 'transparent' : withAlpha(ink, 0.14),
                  }}
                />
              );
            })}
          </View>
        </Animated.View>
      ) : null}

      {powers.length || prices.length ? (
        <Animated.View entering={riseIn(2)} style={[styles.row, { gap: t.space[2] }]}>
          {powers.length ? (
            <FigureTile label={DETAILS_COPY.power} value={`${Math.max(...powers)}`} unit="kW" />
          ) : null}
          {prices.length ? (
            <FigureTile
              label={DETAILS_COPY.price}
              value={formatRate(Math.min(...prices))}
              unit={CARD_COPY.price}
            />
          ) : null}
        </Animated.View>
      ) : null}

      <Animated.View entering={riseIn(3)}>
        <AppPressable
          onPress={onDirections}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={DETAILS_COPY.directions}
          style={[
            styles.row,
            {
              gap: t.space[3],
              paddingVertical: t.space[2],
              paddingLeft: t.space[3],
              paddingRight: t.space[2],
              borderRadius: t.radius.card,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.border,
              backgroundColor: t.colors.surfaceRaised,
            },
          ]}
        >
          <View style={styles.grow}>
            <AppText variant="caption" tone="secondary">
              {DETAILS_COPY.route}
            </AppText>
            <AppText
              variant="subhead"
              tabular
              numberOfLines={1}
              style={{ fontFamily: t.type.headline.fontFamily }}
            >
              {distance !== null
                ? routeLabel(formatDistance(distance, brand.locale), eta)
                : DETAILS_COPY.directions}
            </AppText>
          </View>
          <View
            style={[
              styles.center,
              {
                width: t.space[8],
                height: t.space[8],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.textPrimary,
              },
            ]}
          >
            <ArrowUpRight color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
          </View>
        </AppPressable>
      </Animated.View>
    </View>
  );
};

export default StationSummary;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  shrink: {
    flexShrink: 1,
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
