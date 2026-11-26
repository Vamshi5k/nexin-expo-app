import { StyleSheet, View } from 'react-native';

import {
  ArrowUpRight,
  Building2,
  Copy,
  MapPin,
  Navigation,
  Phone,
  PlugZap,
  type LucideIcon,
} from 'lucide-react-native';

import { AppEmptyState, AppPressable, AppText } from '@/shared/components';

import AmenityChip from './AmenityChip';

import { useTheme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';

type StationInfoProps = {
  station: StationDetails;
  onCopyAddress: () => void;
  onCall: () => void;
  onDirections: () => void;
};

type Fact = {
  icon: LucideIcon;
  label: string;
  value: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

type FactTileProps = Fact;

type NumberTileProps = {
  value: number;
  label: string;
};

type ActionPillProps = {
  icon: LucideIcon;
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

const AMENITY_COLUMNS = 3;

const chunk = <T,>(items: T[], size: number) =>
  items.reduce<T[][]>((rows, item, position) => {
    if (position % size === 0) rows.push([item]);
    else rows[rows.length - 1]!.push(item);
    return rows;
  }, []);

const ActionPill = ({ icon: Icon, label, accessibilityLabel, onPress }: ActionPillProps) => {
  const t = useTheme();

  return (
    <AppPressable
      onPress={onPress}
      haptic="light"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.row,
        styles.grow,
        styles.center,
        {
          gap: t.space[2],
          height: t.layout.minTouch,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.surfaceSunken,
        },
      ]}
    >
      <Icon color={t.colors.textPrimary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
      <AppText variant="subhead" style={{ fontFamily: t.type.headline.fontFamily }}>
        {label}
      </AppText>
    </AppPressable>
  );
};

const NumberTile = ({ value, label }: NumberTileProps) => {
  const t = useTheme();

  return (
    <View
      style={[
        styles.grow,
        {
          gap: t.space[1],
          padding: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <AppText variant="title2" tabular>
        {value}
      </AppText>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
};

const FactTile = ({ icon: Icon, label, value, onPress, accessibilityLabel }: FactTileProps) => {
  const t = useTheme();

  const body = (
    <>
      <View style={[styles.row, styles.between]}>
        <View
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
          <Icon color={t.colors.textPrimary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
        </View>
        {onPress ? (
          <ArrowUpRight
            color={t.colors.textTertiary}
            size={t.icon.meta}
            strokeWidth={t.icon.stroke}
          />
        ) : null}
      </View>
      <View>
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
        <AppText variant="subhead" style={{ fontFamily: t.type.headline.fontFamily }}>
          {value}
        </AppText>
      </View>
    </>
  );

  const style = [
    styles.grow,
    {
      gap: t.space[3],
      padding: t.space[4],
      borderRadius: t.radius.card,
      borderWidth: t.layout.hairline,
      borderColor: t.colors.border,
      backgroundColor: t.colors.surfaceRaised,
    },
  ];

  if (!onPress) return <View style={style}>{body}</View>;
  return (
    <AppPressable
      onPress={onPress}
      haptic="light"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label}, ${value}`}
      style={style}
    >
      {body}
    </AppPressable>
  );
};

// The Info tab as a bento: address with its actions, the station's counts, fact tiles two per
// row and an amenity grid. Anything without data is left out.
const StationInfo = ({ station, onCopyAddress, onCall, onDirections }: StationInfoProps) => {
  const t = useTheme();
  const connectorCount = station.chargers.reduce(
    (sum, charger) => sum + charger.connectors.length,
    0,
  );

  const types = [
    ...new Set(
      station.chargers.flatMap(charger =>
        charger.connectors.map(connector => connector.portType).filter(Boolean),
      ),
    ),
  ];

  const candidates: (Fact | null)[] = [
    station.phone
      ? {
          icon: Phone,
          label: DETAILS_COPY.helpLine,
          value: station.phone,
          onPress: onCall,
          accessibilityLabel: DETAILS_COPY.call,
        }
      : null,
    station.accessType
      ? { icon: Building2, label: DETAILS_COPY.access, value: station.accessType }
      : null,
    types.length
      ? { icon: PlugZap, label: DETAILS_COPY.connectorTypes, value: types.join(', ') }
      : null,
  ];
  const facts = candidates.filter((fact): fact is Fact => fact !== null);

  if (!station.address && !facts.length && !station.amenities.length && !connectorCount) {
    return (
      <AppEmptyState
        icon={Building2}
        title={DETAILS_COPY.noInfo}
        description={DETAILS_COPY.noInfoBody}
      />
    );
  }

  return (
    <View style={{ gap: t.space[3] }}>
      {station.address ? (
        <View
          style={{
            gap: t.space[4],
            padding: t.space[4],
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
                size={t.icon.control}
                strokeWidth={t.icon.stroke}
              />
            </View>
            <View style={styles.grow}>
              <AppText variant="caption" tone="secondary">
                {DETAILS_COPY.address}
              </AppText>
              <AppText variant="subhead" style={{ fontFamily: t.type.headline.fontFamily }}>
                {station.address}
              </AppText>
            </View>
          </View>
          <View style={[styles.row, { gap: t.space[2] }]}>
            <ActionPill
              icon={Copy}
              label={DETAILS_COPY.copy}
              accessibilityLabel={`${DETAILS_COPY.copy} ${DETAILS_COPY.address}`}
              onPress={onCopyAddress}
            />
            <ActionPill
              icon={Navigation}
              label={DETAILS_COPY.directionsShort}
              accessibilityLabel={DETAILS_COPY.directions}
              onPress={onDirections}
            />
          </View>
        </View>
      ) : null}

      {connectorCount ? (
        <View style={[styles.row, { gap: t.space[3] }]}>
          <NumberTile value={station.chargers.length} label={DETAILS_COPY.chargerCount} />
          <NumberTile value={connectorCount} label={DETAILS_COPY.connectorCount} />
        </View>
      ) : null}

      {chunk(facts, 2).map(row => (
        <View key={row[0]!.label} style={[styles.stretch, { gap: t.space[3] }]}>
          {row.map(fact => (
            <FactTile key={fact.label} {...fact} />
          ))}
        </View>
      ))}

      {station.amenities.length ? (
        <View style={{ gap: t.space[3], marginTop: t.space[3] }}>
          <AppText variant="headline" accessibilityRole="header">
            {DETAILS_COPY.amenities}
          </AppText>
          {chunk(station.amenities, AMENITY_COLUMNS).map(row => (
            <View key={row[0]} style={[styles.stretch, { gap: t.space[2] }]}>
              {row.map(amenity => (
                <AmenityChip key={amenity} label={amenity} tile />
              ))}
              {Array.from({ length: AMENITY_COLUMNS - row.length }, (_, gap) => (
                <View key={`gap-${gap}`} style={styles.grow} />
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default StationInfo;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stretch: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  between: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
