import { StyleSheet, View } from 'react-native';

import { ArrowUpRight, Heart, Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha, type Theme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { CARD_COPY, LIST_COPY, moreCells } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance } from '../utils/geo';
import { listAvailability } from '../utils/list';
import type { Availability } from '../utils/status';

type StationListCardProps = {
  station: NearbyStation;
  favourite: boolean;
  onPress: (stationId: string) => void;
  onToggleFavourite: (stationId: string) => void;
  onDirections: (station: NearbyStation) => void;
};

type SpecTokenProps = {
  label: string;
  bolt?: boolean;
};

const SOFT = 0.12;
// More connectors than this collapse into a "+N" after the cells.
const MAX_CELLS = 8;
const CELL = 10;

const toneColors = (t: Theme, tone: Availability['tone']) => {
  switch (tone) {
    case 'success':
      return { dot: t.colors.success, ink: t.colors.successText };
    case 'danger':
      return { dot: t.colors.danger, ink: t.colors.dangerText };
    case 'warning':
      return { dot: t.colors.warning, ink: t.colors.warningText };
    default:
      return { dot: t.colors.textTertiary, ink: t.colors.textSecondary };
  }
};

const SpecToken = ({ label, bolt }: SpecTokenProps) => {
  const t = useTheme();

  return (
    <View
      style={[
        styles.row,
        {
          gap: t.space[1] / 2,
          height: t.space[5],
          paddingHorizontal: t.space[2],
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.surfaceSunken,
        },
      ]}
    >
      {bolt ? (
        <Zap
          color={t.colors.accentText}
          fill={t.colors.accentText}
          size={t.icon.meta - 4}
          strokeWidth={t.icon.stroke}
        />
      ) : null}
      <AppText variant="caption" tabular>
        {label}
      </AppText>
    </View>
  );
};

// Name, address and spec tokens with the heart; then a meter with one cell per connector (free
// ones lit), the free count, and a dark distance pill that opens directions. A solid white card
// with a clear edge, so it stands out on the page.
const StationListCard = ({
  station,
  favourite,
  onPress,
  onToggleFavourite,
  onDirections,
}: StationListCardProps) => {
  const t = useTheme();
  const availability = listAvailability(station);
  const tone = toneColors(t, availability.tone);
  const heartColor = favourite ? t.colors.danger : t.colors.textTertiary;
  const km = station.distanceKm;
  const { availableConnectors: free, totalConnectors: total } = station;
  const cells = total !== null && total > 0 ? Math.min(total, MAX_CELLS) : 0;
  // Only a station that really has free connectors lights its cells; a closed one stays dark.
  const lit = availability.tone === 'success' && free !== null ? Math.min(free, cells) : 0;
  const extra = total !== null && total > MAX_CELLS ? total - MAX_CELLS : 0;

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        styles.clip,
        {
          gap: t.space[3],
          padding: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.borderStrong,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <View style={[styles.top, { gap: t.space[3] }]}>
        <View style={[styles.grow, { gap: t.space[2] }]}>
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
          {station.maxPowerKw !== null || station.pricePerKwhPaise !== null ? (
            <View style={[styles.row, { gap: t.space[1] + t.space[1] / 2 }]}>
              {station.maxPowerKw !== null ? (
                <SpecToken label={`${station.maxPowerKw} kW`} bolt />
              ) : null}
              {station.pricePerKwhPaise !== null ? (
                <SpecToken label={`${formatRate(station.pricePerKwhPaise)}${CARD_COPY.price}`} />
              ) : null}
            </View>
          ) : null}
        </View>

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
              width: t.space[8],
              height: t.space[8],
              borderRadius: t.radius.pill,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.border,
              backgroundColor: favourite ? withAlpha(t.colors.danger, SOFT) : t.colors.surface,
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

      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={[styles.grow, { gap: t.space[1] + t.space[1] / 2 }]}>
          {cells ? (
            <View style={[styles.row, { gap: t.space[1] - 1 }]}>
              {Array.from({ length: cells }, (_, index) => {
                const on = index < lit;
                return (
                  <View
                    key={index}
                    style={[
                      {
                        width: CELL,
                        height: CELL,
                        borderRadius: 3,
                        backgroundColor: on ? tone.dot : withAlpha(t.colors.textPrimary, 0.08),
                      },
                      on ? { boxShadow: `0 0 6px ${withAlpha(tone.dot, 0.6)}` } : null,
                    ]}
                  />
                );
              })}
              {extra ? (
                <AppText variant="caption" tone="tertiary" tabular>
                  {moreCells(extra)}
                </AppText>
              ) : null}
            </View>
          ) : null}
          <AppText
            variant="caption"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily, color: tone.ink }}
          >
            {availability.label}
          </AppText>
        </View>

        <AppPressable
          onPress={() => onDirections(station)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${CARD_COPY.directions} ${station.name}`}
          hitSlop={t.space[2]}
          style={[
            styles.row,
            {
              gap: t.space[1],
              height: t.space[8] + t.space[1],
              paddingLeft: km !== null ? t.space[3] + t.space[1] : t.space[2],
              paddingRight: t.space[2] + t.space[1] / 2,
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.textPrimary,
            },
          ]}
        >
          {km !== null ? (
            <AppText
              variant="subhead"
              tabular
              style={{ fontFamily: t.type.headline.fontFamily, color: t.colors.surface }}
            >
              {formatDistance(km, brand.locale)}
            </AppText>
          ) : null}
          <ArrowUpRight color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
        </AppPressable>
      </View>
    </AppPressable>
  );
};

export default StationListCard;

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
