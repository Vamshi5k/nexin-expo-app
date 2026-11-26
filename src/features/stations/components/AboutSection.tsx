import { StyleSheet, View } from 'react-native';

import { MapPin } from 'lucide-react-native';

import { AppButton, AppText } from '@/shared/components';

import AmenityChip from './AmenityChip';

import { useTheme } from '@/shared/theme';

import { DETAILS_COPY, moreChip } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';

type AboutSectionProps = {
  station: StationDetails;
  onViewAll: () => void;
};

const VISIBLE_AMENITIES = 3;

// A short summary; everything else lives in the details sheet so the page stays light.
const AboutSection = ({ station, onViewAll }: AboutSectionProps) => {
  const t = useTheme();
  const shown = station.amenities.slice(0, VISIBLE_AMENITIES);
  const hidden = station.amenities.length - shown.length;

  return (
    <View style={{ gap: t.space[3] }}>
      <AppText variant="headline" accessibilityRole="header">
        {DETAILS_COPY.about}
      </AppText>
      <View
        style={{
          gap: t.space[3],
          padding: t.space[3],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        }}
      >
        {station.address ? (
          <View style={[styles.row, { gap: t.space[2] }]}>
            <MapPin color={t.colors.textSecondary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
            <AppText variant="subhead" numberOfLines={2} style={styles.grow}>
              {station.address}
            </AppText>
          </View>
        ) : null}

        {shown.length ? (
          <View style={[styles.wrap, { gap: t.space[2] }]}>
            {shown.map(amenity => (
              <AmenityChip key={amenity} label={amenity} />
            ))}
            {hidden > 0 ? <AmenityChip label={moreChip(hidden)} /> : null}
          </View>
        ) : null}

        <AppButton
          label={DETAILS_COPY.viewAll}
          variant="secondary"
          size="medium"
          fullWidth
          onPress={onViewAll}
        />
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
  grow: {
    flex: 1,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
