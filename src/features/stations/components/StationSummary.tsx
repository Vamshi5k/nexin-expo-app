import { StyleSheet, View } from 'react-native';

import { ArrowUpRight } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';
import { riseIn } from '@/shared/utils/motion';

import { CARD_COPY, DETAILS_COPY, routeLabel } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { canStartCharging } from '../utils/connector';
import { formatDistance } from '../utils/geo';

const GLOW = 0.14;
// Busy connectors keep their status colour, quieter than the free and charging ones.
const BUSY = 0.45;

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
  const glow = free ? t.colors.success : t.colors.danger;
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
            styles.clip,
            {
              gap: t.space[3],
              paddingHorizontal: t.space[3],
              paddingVertical: t.space[2] + t.space[1] / 2,
              borderRadius: t.radius.control,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.border,
              backgroundColor: t.colors.surfaceRaised,
            },
          ]}
        >
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <RadialGradient id={`free-glow-${station.id}`} cx="100%" cy="0%" rx="60%" ry="90%">
                <Stop offset="0" stopColor={glow} stopOpacity={GLOW} />
                <Stop offset="1" stopColor={glow} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#free-glow-${station.id})`} />
          </Svg>

          <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
            <AppText variant="caption" tone="secondary" style={styles.overline}>
              {DETAILS_COPY.connectorsFree}
            </AppText>
            <View style={styles.baseline}>
              <AppText
                variant="title2"
                tabular
                style={{ color: free ? t.colors.successText : t.colors.dangerText }}
              >
                {free}
              </AppText>
              <AppText variant="caption" tone="tertiary" tabular>
                {`/${connectors.length}`}
              </AppText>
            </View>
          </View>
          <View style={[styles.wrap, { gap: t.space[1], maxWidth: (square + t.space[1]) * 4 }]}>
            {connectors.map(connector => {
              const color = t.colors.status.connector[connector.state].main;
              const lit = canStartCharging(connector.state) || connector.state === 'charging';
              return (
                <View
                  key={connector.id}
                  accessible={false}
                  style={[
                    {
                      width: square,
                      height: square,
                      borderRadius: t.space[1],
                      backgroundColor: lit ? color : withAlpha(color, BUSY),
                    },
                    lit ? { boxShadow: `0 0 6px ${withAlpha(color, 0.6)}` } : null,
                  ]}
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
  clip: {
    overflow: 'hidden',
  },
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
