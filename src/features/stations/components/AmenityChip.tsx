import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Coffee,
  Gamepad2,
  Sofa,
  Sparkles,
  SquareParking,
  Toilet,
  UtensilsCrossed,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

type AmenityChipProps = {
  label: string;
  withIcon?: boolean;
  // A square-ish tile with the icon over the label, for the Info tab's grid.
  tile?: boolean;
};

const ICON_BY_KEY: [RegExp, LucideIcon][] = [
  [/wi-?fi|internet/, Wifi],
  [/restaurant|food|dining/, UtensilsCrossed],
  [/cafe|coffee/, Coffee],
  [/rest ?room|toilet|washroom/, Toilet],
  [/parking/, SquareParking],
  [/play|game|kids/, Gamepad2],
  [/lounge|waiting|seating/, Sofa],
];

const iconFor = (label: string) =>
  ICON_BY_KEY.find(([pattern]) => pattern.test(label.toLowerCase()))?.[1] ?? Sparkles;

// White pill like the map card's pills; the Info tab's larger version carries an accent icon.
const AmenityChip = ({ label, withIcon, tile }: AmenityChipProps) => {
  const t = useTheme();

  if (tile) {
    return (
      <View
        style={[
          styles.tile,
          {
            gap: t.space[2],
            padding: t.space[3],
            borderRadius: t.radius.control,
            borderWidth: t.layout.hairline,
            borderColor: t.colors.border,
            backgroundColor: t.colors.surfaceRaised,
          },
        ]}
      >
        <View
          style={[
            styles.center,
            {
              width: t.space[8],
              height: t.space[8],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          {createElement(iconFor(label), {
            color: t.colors.accentText,
            size: t.icon.meta,
            strokeWidth: t.icon.stroke,
          })}
        </View>
        <AppText variant="caption" numberOfLines={2}>
          {label}
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.row,
        {
          gap: withIcon ? t.space[2] : t.space[1] + t.space[1] / 2,
          paddingHorizontal: withIcon ? t.space[4] : t.space[3],
          paddingVertical: withIcon ? t.space[2] + t.space[1] / 2 : t.space[1],
          borderRadius: t.radius.pill,
          borderWidth: t.layout.hairline,
          borderColor: withIcon ? t.colors.border : t.colors.borderStrong,
          backgroundColor: withIcon ? t.colors.surfaceRaised : t.colors.surface,
        },
      ]}
    >
      {withIcon
        ? createElement(iconFor(label), {
            color: t.colors.accentText,
            size: t.icon.control,
            strokeWidth: t.icon.stroke,
          })
        : null}
      <AppText variant={withIcon ? 'callout' : 'subhead'}>{label}</AppText>
    </View>
  );
};

export default AmenityChip;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    flex: 1,
  },
});
