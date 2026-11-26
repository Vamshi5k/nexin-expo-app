import { StyleSheet, View } from 'react-native';

import { Building2, Copy, Navigation, Phone, type LucideIcon } from 'lucide-react-native';

import { AppEmptyState, AppPressable, AppText } from '@/shared/components';

import AmenityChip from './AmenityChip';
import MapPreview from './MapPreview';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';

import { DETAILS_COPY, pad2 } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { formatDistance } from '../utils/geo';

type StationInfoProps = {
  station: StationDetails;
  distance: number | null;
  eta: string | null;
  onCopyAddress: () => void;
  onCall: () => void;
  onDirections: () => void;
};

type Fact = { value: string; label: string };

type ActionPillProps = {
  icon: LucideIcon;
  label: string;
  accessibilityLabel: string;
  primary?: boolean;
  onPress: () => void;
};

const MAP_HEIGHT = 168;

const ActionPill = ({
  icon: Icon,
  label,
  accessibilityLabel,
  primary,
  onPress,
}: ActionPillProps) => {
  const t = useTheme();
  const ink = primary ? t.colors.onAccent : t.colors.textPrimary;

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
          height: t.layout.buttonHeight,
          borderRadius: t.radius.pill,
          borderWidth: primary ? 0 : t.layout.hairline,
          borderColor: t.colors.borderStrong,
          backgroundColor: primary ? t.colors.accent : t.colors.surface,
        },
      ]}
    >
      <Icon color={ink} size={t.icon.control} strokeWidth={t.icon.stroke} />
      <AppText variant="headline" style={{ color: ink }}>
        {label}
      </AppText>
    </AppPressable>
  );
};

// The Info tab: a map card with the address and its actions, big-number tiles, the help line
// and the amenities. Anything without data is left out.
const StationInfo = ({
  station,
  distance,
  eta,
  onCopyAddress,
  onCall,
  onDirections,
}: StationInfoProps) => {
  const t = useTheme();
  const connectors = station.chargers.reduce((sum, charger) => sum + charger.connectors.length, 0);
  const types = [
    ...new Set(
      station.chargers.flatMap(charger =>
        charger.connectors.flatMap(connector => (connector.portType ? [connector.portType] : [])),
      ),
    ),
  ];
  const route =
    distance !== null
      ? [formatDistance(distance, brand.locale), eta].filter(Boolean).join(' · ')
      : null;

  const candidates: (Fact | null)[] = [
    station.chargers.length
      ? { value: pad2(station.chargers.length), label: DETAILS_COPY.chargerCount }
      : null,
    connectors ? { value: pad2(connectors), label: DETAILS_COPY.connectorCount } : null,
    types.length ? { value: types.join(', '), label: DETAILS_COPY.connectorType } : null,
    station.accessType ? { value: station.accessType, label: DETAILS_COPY.access } : null,
  ];
  const facts = candidates.filter((fact): fact is Fact => fact !== null);
  const factRows = facts.reduce<Fact[][]>((rows, fact, position) => {
    if (position % 2 === 0) rows.push([fact]);
    else rows[rows.length - 1]!.push(fact);
    return rows;
  }, []);

  if (!station.address && !facts.length && !station.phone && !station.amenities.length) {
    return (
      <AppEmptyState
        icon={Building2}
        title={DETAILS_COPY.noInfo}
        description={DETAILS_COPY.noInfoBody}
      />
    );
  }

  const card = {
    borderRadius: t.radius.sheet,
    borderWidth: t.layout.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surfaceRaised,
  };

  return (
    <View style={{ gap: t.space[3] }}>
      {station.address ? (
        <View style={[styles.clip, card]}>
          <MapPreview height={MAP_HEIGHT} label={route} onPress={onDirections} />
          <View style={{ gap: t.space[4], padding: t.space[5] }}>
            <View style={{ gap: t.space[1] }}>
              <AppText variant="caption" tone="secondary" style={styles.overline}>
                {DETAILS_COPY.address}
              </AppText>
              <AppText variant="title3">{station.address}</AppText>
            </View>
            <View style={[styles.row, { gap: t.space[3] }]}>
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
                primary
                onPress={onDirections}
              />
            </View>
          </View>
        </View>
      ) : null}

      {factRows.map(row => (
        <View key={row[0]!.label} style={[styles.stretch, { gap: t.space[3] }]}>
          {row.map(fact => (
            <View
              key={fact.label}
              style={[styles.grow, card, { gap: t.space[1], padding: t.space[5] }]}
            >
              <AppText variant="display" tabular numberOfLines={1} adjustsFontSizeToFit>
                {fact.value}
              </AppText>
              <AppText variant="callout" tone="secondary">
                {fact.label}
              </AppText>
            </View>
          ))}
          {row.length === 1 ? <View style={styles.grow} /> : null}
        </View>
      ))}

      {station.phone ? (
        <View style={[styles.row, card, { gap: t.space[3], padding: t.space[5] }]}>
          <View style={styles.grow}>
            <AppText variant="callout" tone="secondary">
              {DETAILS_COPY.helpLine}
            </AppText>
            <AppText variant="title2" tabular>
              {station.phone}
            </AppText>
          </View>
          <AppPressable
            onPress={onCall}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={DETAILS_COPY.call}
            style={[
              styles.center,
              {
                width: t.space[12] + t.space[2],
                height: t.space[12] + t.space[2],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.textPrimary,
              },
            ]}
          >
            <Phone color={t.colors.surface} size={t.icon.nav} strokeWidth={t.icon.stroke} />
          </AppPressable>
        </View>
      ) : null}

      {station.amenities.length ? (
        <View style={{ gap: t.space[3], marginTop: t.space[4] }}>
          <AppText
            variant="caption"
            tone="secondary"
            accessibilityRole="header"
            style={[styles.overline, { paddingHorizontal: t.space[1] }]}
          >
            {DETAILS_COPY.amenities}
          </AppText>
          <View style={[styles.wrap, { gap: t.space[2] }]}>
            {station.amenities.map(amenity => (
              <AmenityChip key={amenity} label={amenity} withIcon />
            ))}
          </View>
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  clip: {
    overflow: 'hidden',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
