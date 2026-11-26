import { StyleSheet, View } from 'react-native';

import { MapPin, Phone, PlugZap, Sparkles, type LucideIcon } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';

type AboutSectionProps = {
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
            backgroundColor: t.colors.surfaceSunken,
          },
        ]}
      >
        <Icon color={t.colors.textPrimary} size={t.icon.control} strokeWidth={t.icon.stroke} />
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

// Everything that is not a charger, in one grouped card: where, who to call, what plugs fit
// and what is around.
const AboutSection = ({ station, onCall }: AboutSectionProps) => {
  const t = useTheme();
  const types = [
    ...new Set(
      station.chargers.flatMap(charger =>
        charger.connectors.map(connector => connector.portType).filter(Boolean),
      ),
    ),
  ];

  return (
    <View style={{ gap: t.space[3] }}>
      <AppText variant="title2" accessibilityRole="header">
        {DETAILS_COPY.about}
      </AppText>
      <View
        style={{
          paddingHorizontal: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        }}
      >
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

        {station.amenities.length ? (
          <View
            style={{
              gap: t.space[3],
              paddingVertical: t.space[4],
              borderTopWidth: t.layout.hairline,
              borderTopColor: t.colors.border,
            }}
          >
            <View style={[styles.row, { gap: t.space[3] }]}>
              <Sparkles
                color={t.colors.textPrimary}
                size={t.icon.meta}
                strokeWidth={t.icon.stroke}
              />
              <AppText variant="caption" tone="secondary">
                {DETAILS_COPY.amenities}
              </AppText>
            </View>
            <View style={[styles.wrap, { gap: t.space[2] }]}>
              {station.amenities.map(amenity => (
                <View
                  key={amenity}
                  style={{
                    paddingHorizontal: t.space[3],
                    paddingVertical: t.space[1] + t.space[1] / 2,
                    borderRadius: t.radius.pill,
                    borderWidth: t.layout.hairline,
                    borderColor: t.colors.borderStrong,
                    backgroundColor: t.colors.surface,
                  }}
                >
                  <AppText variant="subhead">{amenity}</AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default AboutSection;

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
