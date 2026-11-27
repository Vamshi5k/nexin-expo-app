import { StyleSheet, Switch, View } from 'react-native';

import { MoreHorizontal, Star, Zap } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppPressable, AppText } from '@/shared/components';

import VehicleArt from './VehicleArt';

import { useTheme, withAlpha } from '@/shared/theme';

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

type TokenProps = {
  label: string;
  tone?: 'plain' | 'plate' | 'accent';
  icon?: 'bolt' | 'star';
};

const GLOW = 0.12;
const DOT = 8;

// The Stations card's spec token: a small sunken pill. The plate gets a hairline edge, Primary
// the brand tint.
const Token = ({ label, tone = 'plain', icon }: TokenProps) => {
  const t = useTheme();
  const accent = tone === 'accent';
  const ink = accent ? t.colors.accentText : t.colors.textPrimary;

  return (
    <View
      style={[
        styles.row,
        {
          gap: t.space[1] / 2,
          height: t.space[5],
          paddingHorizontal: t.space[2],
          borderRadius: tone === 'plate' ? t.space[1] : t.radius.pill,
          borderWidth: tone === 'plate' ? t.layout.hairline : 0,
          borderColor: t.colors.borderStrong,
          backgroundColor: accent
            ? t.colors.accentSoft
            : tone === 'plate'
              ? t.colors.surface
              : t.colors.surfaceSunken,
        },
      ]}
    >
      {icon === 'bolt' ? (
        <Zap color={ink} fill={ink} size={t.icon.meta - 4} strokeWidth={t.icon.stroke} />
      ) : null}
      {icon === 'star' ? (
        <Star color={ink} fill={ink} size={t.icon.meta - 6} strokeWidth={t.icon.stroke} />
      ) : null}
      <AppText
        variant="caption"
        tabular
        style={[
          { color: ink },
          tone !== 'plain' ? { fontFamily: t.type.headline.fontFamily } : null,
          tone === 'plate' ? styles.plate : null,
        ]}
      >
        {label}
      </AppText>
    </View>
  );
};

// Laid out like the Stations card: the car on a soft tile beside the name and its tokens
// (plate, Primary, battery, range) with ⋯ in a white circle; a hairline, then auto-charge as a
// glowing dot and coloured text with its switch. The primary vehicle gets the corner glow.
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
  const on = eligible && vehicle.autoCharge;
  const dot = on ? t.colors.success : t.colors.textTertiary;
  const status = !eligible
    ? VEHICLES_COPY.needsMac
    : on
      ? VEHICLES_COPY.autoChargeOn
      : VEHICLES_COPY.autoChargeOff;
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
          padding: t.space[4],
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
            <RadialGradient id={glowId} cx="100%" cy="0%" rx="55%" ry="75%">
              <Stop offset="0" stopColor={t.colors.accent} stopOpacity={GLOW} />
              <Stop offset="1" stopColor={t.colors.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${glowId})`} />
        </Svg>
      ) : null}

      <View style={[styles.top, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[12] + t.space[2],
              height: t.space[10] + t.space[1],
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <VehicleArt width={t.space[12]} />
        </View>

        <View style={[styles.grow, { gap: t.space[2] }]}>
          <AppText variant="headline" numberOfLines={1}>
            {title}
          </AppText>
          <View style={[styles.wrap, { gap: t.space[1] + t.space[1] / 2 }]}>
            {vehicle.regNo ? <Token label={vehicle.regNo} tone="plate" /> : null}
            {vehicle.isPrimary ? (
              <Token label={VEHICLES_COPY.primary} tone="accent" icon="star" />
            ) : null}
            {vehicle.capacityKwh !== null ? (
              <Token label={formatCapacity(vehicle.capacityKwh)} icon="bolt" />
            ) : null}
            {vehicle.rangeKm !== null ? (
              <Token label={VEHICLES_COPY.rangeValue(vehicle.rangeKm)} />
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

      <View
        style={[
          styles.row,
          {
            gap: t.space[2],
            paddingTop: t.space[3],
            borderTopWidth: t.layout.hairline,
            borderTopColor: t.colors.border,
          },
        ]}
      >
        <View
          style={[
            { width: DOT, height: DOT, borderRadius: t.radius.pill, backgroundColor: dot },
            on ? { boxShadow: `0 0 6px 1px ${withAlpha(dot, 0.6)}` } : null,
          ]}
        />
        <AppText
          variant="caption"
          numberOfLines={1}
          style={[
            styles.grow,
            {
              fontFamily: t.type.headline.fontFamily,
              color: on ? t.colors.successText : t.colors.textSecondary,
            },
          ]}
        >
          {status}
        </AppText>
        <Switch
          value={on}
          onValueChange={onToggleAutoCharge}
          disabled={!eligible || busy}
          accessibilityLabel={`${VEHICLES_COPY.autoCharge}, ${title}`}
          accessibilityState={{ disabled: !eligible || busy, checked: on }}
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
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  plate: {
    letterSpacing: 1,
  },
});
