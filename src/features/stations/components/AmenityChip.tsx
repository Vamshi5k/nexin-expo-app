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

// White pill like the map card's pills; icons only in the full details sheet.
const AmenityChip = ({ label, withIcon }: AmenityChipProps) => {
  const t = useTheme();

  return (
    <View
      style={[
        styles.row,
        {
          gap: t.space[2],
          paddingHorizontal: t.space[3],
          paddingVertical: t.space[1] + t.space[1] / 2,
          borderRadius: t.radius.pill,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.borderStrong,
          backgroundColor: t.colors.surface,
        },
      ]}
    >
      {withIcon
        ? createElement(iconFor(label), {
            color: t.colors.textSecondary,
            size: t.icon.meta,
            strokeWidth: t.icon.stroke,
          })
        : null}
      <AppText variant="subhead">{label}</AppText>
    </View>
  );
};

export default AmenityChip;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
