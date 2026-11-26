import { StyleSheet, View } from 'react-native';

import { ArrowUpRight, Heart, Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import StatusDot from './StatusDot';

import { useTheme, withAlpha, type Theme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { CARD_COPY, LIST_COPY } from '../constants/stations.constants';
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

const SOFT = 0.12;

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

// A clean white card: a bolt tile tinted by availability, the name and address with the heart,
// then a one-line footer: the glowing availability, power and price, and the distance beside a
// dark directions button.
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
  const specs = [
    station.maxPowerKw !== null ? `${station.maxPowerKw} kW` : null,
    station.pricePerKwhPaise !== null
      ? `${formatRate(station.pricePerKwhPaise)}${CARD_COPY.price}`
      : null,
  ].filter(Boolean);

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={{
        gap: t.space[3],
        padding: t.space[3],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[10] + t.space[1],
              height: t.space[10] + t.space[1],
              borderRadius: t.radius.control,
              backgroundColor: withAlpha(tone.dot, SOFT),
            },
          ]}
        >
          <Zap color={tone.ink} fill={tone.ink} size={t.icon.control} strokeWidth={t.icon.stroke} />
        </View>

        <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {station.name}
          </AppText>
          {station.address ? (
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {station.address}
            </AppText>
          ) : null}
        </View>

        <AppPressable
          onPress={() => onToggleFavourite(station.id)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${favourite ? LIST_COPY.removeFavourite : LIST_COPY.addFavourite}, ${station.name}`}
          accessibilityState={{ selected: favourite }}
          hitSlop={t.space[2]}
          style={[styles.center, { width: t.space[8], height: t.space[8] }]}
        >
          <Heart
            color={heartColor}
            fill={favourite ? heartColor : 'transparent'}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
        </AppPressable>
      </View>

      <View
        style={[
          styles.row,
          {
            gap: t.space[2],
            paddingTop: t.space[2] + t.space[1] / 2,
            borderTopWidth: t.layout.hairline,
            borderTopColor: t.colors.border,
          },
        ]}
      >
        <StatusDot color={tone.dot} glow />
        <AppText
          variant="caption"
          numberOfLines={1}
          style={{ fontFamily: t.type.headline.fontFamily, color: tone.ink }}
        >
          {availability.label}
        </AppText>
        {specs.length ? (
          <AppText
            variant="caption"
            tone="secondary"
            tabular
            numberOfLines={1}
            style={styles.shrink}
          >
            {`· ${specs.join(' · ')}`}
          </AppText>
        ) : null}

        <View style={styles.grow} />

        {km !== null ? (
          <AppText
            variant="caption"
            tabular
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {formatDistance(km, brand.locale)}
          </AppText>
        ) : null}

        <AppPressable
          onPress={() => onDirections(station)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${CARD_COPY.directions} ${station.name}`}
          hitSlop={t.space[2]}
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
        </AppPressable>
      </View>
    </AppPressable>
  );
};

export default StationListCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shrink: {
    flexShrink: 1,
  },
  grow: {
    flex: 1,
  },
});
