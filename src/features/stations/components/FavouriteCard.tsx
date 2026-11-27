import { StyleSheet, View } from 'react-native';

import { ArrowUpRight, ChevronRight, Heart, MapPin } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha } from '@/shared/theme';

import { FAVOURITES_COPY } from '../constants/stations.constants';
import type { FavouriteStation } from '../types/stations.types';

type FavouriteCardProps = {
  station: FavouriteStation;
  onPress: () => void;
  onRemove: () => void;
  onDirections: () => void;
};

const SOFT = 0.12;

// A saved station in the Stations card's language: a pin tile, the name and address, and a
// filled red heart that removes it. The footer opens directions when the station has a
// location, and the station either way.
const FavouriteCard = ({ station, onPress, onRemove, onDirections }: FavouriteCardProps) => {
  const t = useTheme();
  const name = station.name || FAVOURITES_COPY.unknownStation;

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={[name, station.address].filter(Boolean).join(', ')}
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
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[10],
              height: t.space[10],
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <MapPin
            color={t.colors.accentText}
            fill={withAlpha(t.colors.accentText, 0.18)}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
        </View>
        <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {name}
          </AppText>
          {station.address ? (
            <AppText variant="caption" tone="secondary" numberOfLines={2}>
              {station.address}
            </AppText>
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
              style={{ fontFamily: t.type.headline.fontFamily, color: t.colors.surface }}
            >
              {FAVOURITES_COPY.go}
            </AppText>
            <ArrowUpRight color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
          </AppPressable>
        ) : null}
        <View style={styles.grow} />
        <ChevronRight
          color={t.colors.textTertiary}
          size={t.icon.meta}
          strokeWidth={t.icon.stroke}
        />
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
