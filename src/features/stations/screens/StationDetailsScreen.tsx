import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { PlugZap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppBackButton,
  AppEmptyState,
  AppErrorState,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import ChargerSection from '../components/ChargerSection';
import DetailsActionBar, { actionBarHeight } from '../components/DetailsActionBar';
import DetailsHero, { heroHeight } from '../components/DetailsHero';
import MapsChooserSheet from '../components/MapsChooserSheet';
import StationInfo from '../components/StationInfo';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';

import { DETAILS_COPY } from '../constants/stations.constants';
import { useStationDetails } from '../hooks/useStationDetails';
import { pinColorKey } from '../utils/status';

type StationDetailsScreenProps = {
  stationId: string;
};

const DetailsSkeleton = () => {
  const t = useTheme();

  return (
    <View testID="station-details-loading">
      <AppSkeleton height={heroHeight(t)} radius={0} />
      <View style={{ gap: t.space[3], padding: t.layout.screenPadding }}>
        <AppSkeleton
          width={t.space[12] * 2}
          height={t.space[6] + t.space[1]}
          radius={t.radius.pill}
        />
        <AppSkeleton width="80%" height={Number(t.type.title2.lineHeight)} />
        <AppSkeleton width="60%" />
        <AppSkeleton
          height={t.space[12] * 4}
          radius={t.radius.card}
          style={{ marginTop: t.space[4] }}
        />
      </View>
    </View>
  );
};

const StationDetailsScreen = ({ stationId }: StationDetailsScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const details = useStationDetails(stationId);
  const { station } = details;

  if (details.loading) {
    return (
      <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
        <DetailsSkeleton />
      </View>
    );
  }

  if (!station) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: t.colors.bg, paddingTop: insets.top + t.space[2] },
        ]}
      >
        <View style={{ paddingHorizontal: t.space[4] }}>
          <AppBackButton onPress={details.goBack} />
        </View>
        <View style={[styles.screen, styles.center]}>
          <AppErrorState
            title={DETAILS_COPY.loadError}
            message={getErrorMessage(details.error)}
            onRetry={details.retry}
            retryLabel={DETAILS_COPY.retry}
          />
        </View>
      </View>
    );
  }

  const statusColor = t.colors.connector[pinColorKey(station.status)];

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <ScrollView
        contentContainerStyle={{
          gap: t.layout.sectionGap,
          paddingBottom: actionBarHeight(t, insets.bottom) + t.layout.sectionGap,
        }}
        refreshControl={
          <RefreshControl
            refreshing={details.refreshing}
            onRefresh={details.refresh}
            tintColor={t.colors.accentText}
            progressViewOffset={insets.top}
          />
        }
      >
        <DetailsHero
          stationId={station.id}
          imageUrl={station.imageUrl}
          statusColor={statusColor}
          isFavourite={details.isFavourite}
          onBack={details.goBack}
          onShare={details.share}
          onToggleFavourite={details.toggleFavourite}
        />

        <StationInfo station={station} distance={details.distance} />

        {station.amenities.length ? (
          <View style={{ gap: t.space[2], paddingHorizontal: t.layout.screenPadding }}>
            <AppText variant="headline" accessibilityRole="header">
              {DETAILS_COPY.amenities}
            </AppText>
            <View style={[styles.wrap, { gap: t.space[2] }]}>
              {station.amenities.map(amenity => (
                <View
                  key={amenity}
                  style={{
                    paddingHorizontal: t.space[3],
                    paddingVertical: t.space[1],
                    borderRadius: t.radius.pill,
                    backgroundColor: t.colors.surfaceSunken,
                  }}
                >
                  <AppText variant="caption" tone="secondary">
                    {amenity}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ gap: t.space[3], paddingHorizontal: t.layout.screenPadding }}>
          <View style={{ gap: t.space[1] }}>
            <AppText variant="headline" accessibilityRole="header">
              {DETAILS_COPY.chargers}
            </AppText>
            {details.chargers.length ? (
              <AppText variant="caption" tone="secondary">
                {DETAILS_COPY.tip}
              </AppText>
            ) : null}
          </View>

          {details.chargers.length ? (
            details.chargers.map((charger, index) => (
              <ChargerSection
                key={charger.id}
                charger={charger}
                index={index}
                onConnectorPress={details.openConnector}
              />
            ))
          ) : (
            <AppEmptyState
              icon={PlugZap}
              title={DETAILS_COPY.noChargers}
              description={DETAILS_COPY.noChargersBody}
            />
          )}
        </View>
      </ScrollView>

      <DetailsActionBar
        onDirections={details.openDirections}
        onCall={station.phone ? details.call : null}
      />

      <MapsChooserSheet
        open={details.directions.chooserOpen}
        onClose={details.directions.close}
        onApple={details.directions.openApple}
        onGoogle={details.directions.openGoogle}
      />
    </View>
  );
};

export default StationDetailsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
