import { StyleSheet, View } from 'react-native';

import { Building2, MapPin, Phone, PlugZap, type LucideIcon } from 'lucide-react-native';

import { AppEmptyState, AppPressable, AppText } from '@/shared/components';

import AmenityChip from './AmenityChip';

import { useTheme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';

type StationInfoProps = {
  station: StationDetails;
  onCopyAddress: () => void;
  onCall: () => void;
};

type RowAction = { label: string; accessibilityLabel: string; onPress: () => void };

type InfoRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  first?: boolean;
  action?: RowAction;
};

const InfoRow = ({ icon: Icon, label, value, first, action }: InfoRowProps) => {
  const t = useTheme();

  return (
    <View
      style={[
        styles.row,
        {
          gap: t.space[3],
          paddingVertical: t.space[3],
          borderTopWidth: first ? 0 : t.layout.hairline,
          borderTopColor: t.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.center,
          {
            width: t.space[8] + t.space[1],
            height: t.space[8] + t.space[1],
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.surfaceSunken,
          },
        ]}
      >
        <Icon color={t.colors.textPrimary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
      </View>
      <View style={styles.grow}>
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
        <AppText variant="subhead" style={{ fontFamily: t.type.headline.fontFamily }}>
          {value}
        </AppText>
      </View>
      {action ? (
        <AppPressable
          onPress={action.onPress}
          haptic="light"
          hitSlop={t.space[2]}
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel}
          style={{
            paddingHorizontal: t.space[3],
            paddingVertical: t.space[1] + t.space[1] / 2,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.surfaceSunken,
          }}
        >
          <AppText variant="caption">{action.label}</AppText>
        </AppPressable>
      ) : null}
    </View>
  );
};

// Everything about the station, inline in the Info tab. Rows without data are left out.
const StationInfo = ({ station, onCopyAddress, onCall }: StationInfoProps) => {
  const t = useTheme();

  const types = [
    ...new Set(
      station.chargers.flatMap(charger =>
        charger.connectors.map(connector => connector.portType).filter(Boolean),
      ),
    ),
  ];

  const candidates: (InfoRowProps | null)[] = [
    station.address
      ? {
          icon: MapPin,
          label: DETAILS_COPY.address,
          value: station.address,
          action: {
            label: DETAILS_COPY.copy,
            accessibilityLabel: `${DETAILS_COPY.copy} ${DETAILS_COPY.address}`,
            onPress: onCopyAddress,
          },
        }
      : null,
    station.phone
      ? {
          icon: Phone,
          label: DETAILS_COPY.helpLine,
          value: station.phone,
          action: {
            label: DETAILS_COPY.callShort,
            accessibilityLabel: DETAILS_COPY.call,
            onPress: onCall,
          },
        }
      : null,
    station.accessType
      ? { icon: Building2, label: DETAILS_COPY.access, value: station.accessType }
      : null,
    types.length
      ? { icon: PlugZap, label: DETAILS_COPY.connectorTypes, value: types.join(', ') }
      : null,
  ];
  const rows = candidates.filter((row): row is InfoRowProps => row !== null);

  if (!rows.length && !station.amenities.length) {
    return (
      <AppEmptyState
        icon={Building2}
        title={DETAILS_COPY.noInfo}
        description={DETAILS_COPY.noInfoBody}
      />
    );
  }

  const card = {
    paddingHorizontal: t.space[3],
    borderRadius: t.radius.card,
    borderWidth: t.layout.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surfaceRaised,
  };

  return (
    <View style={{ gap: t.layout.sectionGap }}>
      {rows.length ? (
        <View style={card}>
          {rows.map((row, index) => (
            <InfoRow key={row.label} {...row} first={index === 0} />
          ))}
        </View>
      ) : null}

      {station.amenities.length ? (
        <View style={{ gap: t.space[3] }}>
          <AppText variant="headline" accessibilityRole="header">
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
});
