import { StyleSheet, View } from 'react-native';

import { MapPin, Phone, PlugZap, Sparkles, type LucideIcon } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import BrandGradient from './BrandGradient';

import { useTheme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';

type InfoTabProps = {
  station: StationDetails;
  onCall: () => void;
};

type InfoRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  onPress?: () => void;
  first?: boolean;
};

const InfoRow = ({ icon: Icon, label, value, onPress, first }: InfoRowProps) => {
  const t = useTheme();

  const body = (
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
            width: t.layout.minTouch,
            height: t.layout.minTouch,
            borderRadius: t.radius.pill,
            overflow: 'hidden',
          },
        ]}
      >
        <BrandGradient
          id={`info-${label.replace(/\W/g, '')}`}
          from={t.colors.accent}
          to={t.colors.accentPressed}
          fromOpacity={0.18}
          toOpacity={0.32}
        />
        <Icon color={t.colors.accentText} size={t.icon.control} strokeWidth={t.icon.stroke} />
      </View>
      <View style={styles.grow}>
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
        <AppText variant="headline" tone={onPress ? 'accent' : 'primary'}>
          {value}
        </AppText>
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
    >
      {body}
    </AppPressable>
  );
};

// Everything that is not a charger: where it is, who to call, what plugs and what is around.
const InfoTab = ({ station, onCall }: InfoTabProps) => {
  const t = useTheme();
  const types = [
    ...new Set(
      station.chargers.flatMap(charger =>
        charger.connectors.map(connector => connector.portType).filter(Boolean),
      ),
    ),
  ];

  return (
    <View style={{ gap: t.space[6] }}>
      <View>
        <InfoRow
          first
          icon={MapPin}
          label={DETAILS_COPY.address}
          value={station.address || DETAILS_COPY.notAvailable}
        />
        <InfoRow
          icon={Phone}
          label={DETAILS_COPY.helpLine}
          value={station.phone ?? DETAILS_COPY.notAvailable}
          onPress={station.phone ? onCall : undefined}
        />
        <InfoRow
          icon={PlugZap}
          label={DETAILS_COPY.connectorTypes}
          value={types.length ? types.join(', ') : DETAILS_COPY.notAvailable}
        />
        <InfoRow
          icon={Sparkles}
          label={DETAILS_COPY.chargersCount}
          value={String(station.chargers.length)}
        />
      </View>

      {station.amenities.length ? (
        <View style={{ gap: t.space[3] }}>
          <AppText variant="title2" accessibilityRole="header">
            {DETAILS_COPY.amenities}
          </AppText>
          <View style={[styles.wrap, { gap: t.space[2] }]}>
            {station.amenities.map((amenity, index) => (
              <View
                key={amenity}
                style={{
                  paddingHorizontal: t.space[4],
                  paddingVertical: t.space[2],
                  borderRadius: t.radius.pill,
                  overflow: 'hidden',
                }}
              >
                <BrandGradient
                  id={`amenity-${index}`}
                  from={t.colors.accent}
                  to={t.colors.accentPressed}
                  fromOpacity={0.1}
                  toOpacity={0.2}
                />
                <AppText variant="subhead" tone="accent">
                  {amenity}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default InfoTab;

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
