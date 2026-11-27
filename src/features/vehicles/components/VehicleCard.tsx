import { StyleSheet, Switch, View } from 'react-native';

import { MoreHorizontal, Star, Zap } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppPressable, AppText } from '@/shared/components';

import VehicleArt from './VehicleArt';

import { useTheme } from '@/shared/theme';

import { VEHICLES_COPY } from '../constants/vehicles.constants';
import type { Vehicle } from '../types/vehicles.types';
import { formatCapacity } from '../utils/form';
import { canAutoCharge } from '../utils/vehicles';

type VehicleCardProps = {
  vehicle: Vehicle;
  title: string;
  busy: boolean;
  onPress: () => void;
  onMore: () => void;
  onToggleAutoCharge: () => void;
};

type StatProps = {
  label: string;
  value: string;
};

const GLOW = 0.14;

const Stat = ({ label, value }: StatProps) => {
  const t = useTheme();

  return (
    <View
      style={[
        styles.grow,
        {
          gap: t.space[1] / 2,
          paddingHorizontal: t.space[3],
          paddingVertical: t.space[2],
          borderRadius: t.radius.control,
          backgroundColor: t.colors.surfaceSunken,
        },
      ]}
    >
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText
        variant="subhead"
        tabular
        numberOfLines={1}
        style={{ fontFamily: t.type.headline.fontFamily }}
      >
        {value}
      </AppText>
    </View>
  );
};

// One vehicle: a side-view car on a soft brand tile, the name with a number-plate pill and the
// Primary badge, battery and range as small stat tiles, then auto-charge (off without a MAC ID).
// The primary vehicle gets a faint corner glow. Tapping opens Edit; ⋯ opens the actions.
const VehicleCard = ({
  vehicle,
  title,
  busy,
  onPress,
  onMore,
  onToggleAutoCharge,
}: VehicleCardProps) => {
  const t = useTheme();
  const eligible = canAutoCharge(vehicle);
  const stats: (StatProps | null)[] = [
    vehicle.capacityKwh !== null
      ? { label: VEHICLES_COPY.battery, value: formatCapacity(vehicle.capacityKwh) }
      : null,
    vehicle.rangeKm !== null
      ? { label: VEHICLES_COPY.rangeLabel, value: VEHICLES_COPY.rangeValue(vehicle.rangeKm) }
      : null,
  ];
  const shown = stats.filter((stat): stat is StatProps => stat !== null);
  const glowId = `vehicle-glow-${vehicle.id}`;

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={[title, vehicle.regNo, vehicle.isPrimary ? VEHICLES_COPY.primary : null]
        .filter(Boolean)
        .join(', ')}
      accessibilityHint={VEHICLES_COPY.edit}
      style={[
        styles.clip,
        {
          gap: t.space[3],
          padding: t.space[3],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      {vehicle.isPrimary ? (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id={glowId} cx="100%" cy="0%" rx="60%" ry="80%">
              <Stop offset="0" stopColor={t.colors.accent} stopOpacity={GLOW} />
              <Stop offset="1" stopColor={t.colors.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${glowId})`} />
        </Svg>
      ) : null}

      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[12] + t.space[6],
              height: t.space[12] + t.space[1],
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <VehicleArt width={t.space[12] + t.space[3]} />
        </View>

        <View style={[styles.grow, { gap: t.space[1] + t.space[1] / 2 }]}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {title}
          </AppText>
          <View style={[styles.row, { gap: t.space[2] }]}>
            {vehicle.regNo ? (
              <View
                style={{
                  paddingHorizontal: t.space[2],
                  paddingVertical: 1,
                  borderRadius: t.space[1],
                  borderWidth: 1.5,
                  borderColor: t.colors.textPrimary,
                  backgroundColor: t.colors.surface,
                }}
              >
                <AppText
                  variant="caption"
                  tabular
                  style={[styles.plate, { fontFamily: t.type.headline.fontFamily }]}
                >
                  {vehicle.regNo}
                </AppText>
              </View>
            ) : null}
            {vehicle.isPrimary ? (
              <View
                style={[
                  styles.row,
                  {
                    gap: t.space[1] / 2,
                    paddingHorizontal: t.space[2],
                    paddingVertical: 1,
                    borderRadius: t.radius.pill,
                    backgroundColor: t.colors.accentSoft,
                  },
                ]}
              >
                <Star
                  color={t.colors.accentText}
                  fill={t.colors.accentText}
                  size={t.icon.meta - 6}
                  strokeWidth={t.icon.stroke}
                />
                <AppText
                  variant="caption"
                  style={{ color: t.colors.accentText, fontFamily: t.type.headline.fontFamily }}
                >
                  {VEHICLES_COPY.primary}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        <AppPressable
          onPress={onMore}
          haptic="light"
          hitSlop={t.space[2]}
          accessibilityRole="button"
          accessibilityLabel={VEHICLES_COPY.actions(title)}
          style={[
            styles.center,
            styles.top,
            {
              width: t.space[8],
              height: t.space[8],
              borderRadius: t.radius.pill,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.border,
              backgroundColor: t.colors.surface,
            },
          ]}
        >
          <MoreHorizontal
            color={t.colors.textPrimary}
            size={t.icon.meta}
            strokeWidth={t.icon.stroke}
          />
        </AppPressable>
      </View>

      {shown.length ? (
        <View style={[styles.row, { gap: t.space[2] }]}>
          {shown.map(stat => (
            <Stat key={stat.label} {...stat} />
          ))}
        </View>
      ) : null}

      <View
        style={[
          styles.row,
          {
            gap: t.space[2] + t.space[1] / 2,
            paddingTop: t.space[2] + t.space[1] / 2,
            borderTopWidth: t.layout.hairline,
            borderTopColor: t.colors.border,
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
              backgroundColor: eligible ? t.colors.accentSoft : t.colors.surfaceSunken,
            },
          ]}
        >
          <Zap
            color={eligible ? t.colors.accentText : t.colors.textTertiary}
            fill={eligible && vehicle.autoCharge ? t.colors.accentText : 'transparent'}
            size={t.icon.meta}
            strokeWidth={t.icon.stroke}
          />
        </View>
        <View style={styles.grow}>
          <AppText variant="caption" style={{ fontFamily: t.type.headline.fontFamily }}>
            {VEHICLES_COPY.autoCharge}
          </AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {eligible
              ? vehicle.autoCharge
                ? VEHICLES_COPY.autoChargeOn
                : VEHICLES_COPY.autoChargeOff
              : VEHICLES_COPY.needsMac}
          </AppText>
        </View>
        <Switch
          value={eligible && vehicle.autoCharge}
          onValueChange={onToggleAutoCharge}
          disabled={!eligible || busy}
          accessibilityLabel={`${VEHICLES_COPY.autoCharge}, ${title}`}
          accessibilityState={{
            disabled: !eligible || busy,
            checked: eligible && vehicle.autoCharge,
          }}
          trackColor={{ false: t.colors.surfaceSunken, true: t.colors.accent }}
          thumbColor={t.colors.surface}
          ios_backgroundColor={t.colors.surfaceSunken}
        />
      </View>
    </AppPressable>
  );
};

export default VehicleCard;

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  top: {
    alignSelf: 'flex-start',
  },
  grow: {
    flex: 1,
  },
  plate: {
    letterSpacing: 1,
  },
});
