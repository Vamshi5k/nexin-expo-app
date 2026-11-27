import { StyleSheet, View } from 'react-native';

import { ArrowUpRight, Heart, MapPin } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha, type Theme } from '@/shared/theme';

import { brand } from '@/core/config';

import { FAVOURITES_COPY } from '../constants/stations.constants';
import type { FavouriteStation, StationStatus } from '../types/stations.types';
import { formatDistance } from '../utils/geo';
import { STATUS_LABEL } from '../utils/status';

type FavouriteCardProps = {
  station: FavouriteStation;
  onPress: () => void;
  onRemove: () => void;
  onDirections: () => void;
};

const SOFT = 0.12;
const DOT = 8;

const statusTone = (t: Theme, status: StationStatus) => {
  switch (status) {
    case 'available':
      return { dot: t.colors.success, ink: t.colors.successText };
    case 'unavailable':
      return { dot: t.colors.danger, ink: t.colors.dangerText };
    case 'upcoming':
    case 'maintenance':
      return { dot: t.colors.warning, ink: t.colors.warningText };
    default:
      return { dot: t.colors.textTertiary, ink: t.colors.textSecondary };
  }
};

// A saved station in the Stations card's language: pin tile, name and address with the filled
// heart that removes it, the station type as a token, then the status (glowing dot, the API's
// own words) and a dark distance pill that opens directions.
const FavouriteCard = ({ station, onPress, onRemove, onDirections }: FavouriteCardProps) => {
  const t = useTheme();
  const name = station.name || FAVOURITES_COPY.unknownStation;
  const tone = statusTone(t, station.status);
  const label = station.rawStatus || STATUS_LABEL[station.status];
  const lit = station.status === 'available';

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={[name, station.address, label].filter(Boolean).join(', ')}
      accessibilityHint={FAVOURITES_COPY.open}
      style={{
        gap: t.space[3],
        padding: t.space[3],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <View style={[styles.top, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[10],
              height: t.space[10],
              borderRadius: t.radius.control,
              backgroundColor: withAlpha(tone.dot, SOFT),
            },
          ]}
        >
          <MapPin
            color={tone.ink}
            fill={withAlpha(tone.ink, 0.18)}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
        </View>

        <View style={[styles.grow, { gap: t.space[1] }]}>
          <View style={{ gap: t.space[1] / 2 }}>
            <AppText
              variant="subhead"
              numberOfLines={1}
              style={{ fontFamily: t.type.headline.fontFamily }}
            >
              {name}
            </AppText>
            {station.address ? (
              <AppText variant="caption" tone="secondary" numberOfLines={1}>
                {station.address}
              </AppText>
            ) : null}
          </View>
          {station.stationType ? (
            <View
              style={[
                styles.token,
                {
                  height: t.space[5],
                  paddingHorizontal: t.space[2],
                  borderRadius: t.radius.pill,
                  backgroundColor: t.colors.surfaceSunken,
                },
              ]}
            >
              <AppText variant="caption">{station.stationType}</AppText>
            </View>
          ) : null}
        </View>

        <AppPressable
          onPress={onRemove}
          haptic="light"
          hitSlop={t.space[2]}
          accessibilityRole="button"
          accessibilityLabel={FAVOURITES_COPY.remove(name)}
          accessibilityState={{ selected: true }}
          style={[
            styles.center,
            {
              width: t.space[8],
              height: t.space[8],
              borderRadius: t.radius.pill,
              backgroundColor: withAlpha(t.colors.danger, SOFT),
            },
          ]}
        >
          <Heart
            color={t.colors.danger}
            fill={t.colors.danger}
            size={t.icon.meta}
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
        <View
          style={[
            { width: DOT, height: DOT, borderRadius: t.radius.pill, backgroundColor: tone.dot },
            { boxShadow: `0 0 6px ${lit ? 1 : 0}px ${withAlpha(tone.dot, lit ? 0.6 : 0.35)}` },
          ]}
        />
        <AppText
          variant="caption"
          numberOfLines={1}
          style={[styles.grow, { fontFamily: t.type.headline.fontFamily, color: tone.ink }]}
        >
          {label}
        </AppText>

        {station.coordinates ? (
          <AppPressable
            onPress={onDirections}
            haptic="light"
            hitSlop={t.space[2]}
            accessibilityRole="button"
            accessibilityLabel={FAVOURITES_COPY.directions(name)}
            style={[
              styles.row,
              {
                gap: t.space[1],
                height: t.space[8],
                paddingLeft: t.space[3],
                paddingRight: t.space[2],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.textPrimary,
              },
            ]}
          >
            <AppText
              variant="caption"
              tabular
              style={{ fontFamily: t.type.headline.fontFamily, color: t.colors.surface }}
            >
              {station.distanceKm !== null
                ? formatDistance(station.distanceKm, brand.locale)
                : FAVOURITES_COPY.go}
            </AppText>
            <ArrowUpRight color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
          </AppPressable>
        ) : null}
      </View>
    </AppPressable>
  );
};

export default FavouriteCard;

const styles = StyleSheet.create({
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
  token: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
});
