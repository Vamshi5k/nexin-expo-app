import { StyleSheet, Switch, View } from 'react-native';

import { MoreHorizontal, Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import VehicleGlyph from './VehicleGlyph';

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

type ChipProps = {
  label: string;
  accent?: boolean;
};

const Chip = ({ label, accent }: ChipProps) => {
  const t = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: t.space[2],
        paddingVertical: t.space[1] / 2,
        borderRadius: t.radius.pill,
        backgroundColor: accent ? t.colors.accentSoft : t.colors.surfaceSunken,
      }}
    >
      <AppText
        variant="caption"
        tabular
        style={
          accent
            ? { color: t.colors.accentText, fontFamily: t.type.headline.fontFamily }
            : undefined
        }
      >
        {label}
      </AppText>
    </View>
  );
};

// One vehicle: the car tile, name, the plate once, battery / range / Primary chips, and the
// auto-charge switch (off without a MAC ID). Tapping opens Edit; ⋯ opens the actions.
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
  const tile = t.space[10];

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={[title, vehicle.regNo, vehicle.isPrimary ? VEHICLES_COPY.primary : null]
        .filter(Boolean)
        .join(', ')}
      accessibilityHint={VEHICLES_COPY.edit}
      style={{
        gap: t.space[3],
        padding: t.space[3],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: vehicle.isPrimary ? t.colors.accentText : t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: tile,
              height: tile,
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <VehicleGlyph color={t.colors.accentText} size={t.icon.control} />
        </View>
        <View style={[styles.grow, { gap: t.space[1] }]}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {title}
          </AppText>
          {vehicle.regNo ? (
            <View
              style={[
                styles.plate,
                {
                  paddingHorizontal: t.space[2],
                  borderRadius: t.space[1],
                  borderWidth: 1,
                  borderColor: t.colors.borderStrong,
                },
              ]}
            >
              <AppText
                variant="caption"
                tabular
                style={[styles.plateText, { fontFamily: t.type.headline.fontFamily }]}
              >
                {vehicle.regNo}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppPressable
          onPress={onMore}
          haptic="light"
          hitSlop={t.space[2]}
          accessibilityRole="button"
          accessibilityLabel={VEHICLES_COPY.actions(title)}
          style={[
            styles.center,
            {
              width: t.space[8],
              height: t.space[8],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.surfaceSunken,
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

      <View style={[styles.wrap, { gap: t.space[1] + t.space[1] / 2 }]}>
        {vehicle.isPrimary ? <Chip label={VEHICLES_COPY.primary} accent /> : null}
        {vehicle.capacityKwh !== null ? <Chip label={formatCapacity(vehicle.capacityKwh)} /> : null}
        {vehicle.rangeKm !== null ? <Chip label={VEHICLES_COPY.range(vehicle.rangeKm)} /> : null}
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
        <Zap
          color={eligible ? t.colors.accentText : t.colors.textTertiary}
          size={t.icon.meta}
          strokeWidth={t.icon.stroke}
        />
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
          accessibilityState={{
            disabled: !eligible || busy,
            checked: eligible && vehicle.autoCharge,
          }}
          accessibilityLabel={`${VEHICLES_COPY.autoCharge}, ${title}`}
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
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  plate: {
    alignSelf: 'flex-start',
  },
  plateText: {
    letterSpacing: 1,
  },
});
