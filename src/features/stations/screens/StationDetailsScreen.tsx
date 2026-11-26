import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { PlugZap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppEmptyState, AppErrorState, AppSkeleton } from '@/shared/components';

import AboutSection from '../components/AboutSection';
import ConnectorCarousel from '../components/ConnectorCarousel';
import DetailsActionBar, { actionBarHeight } from '../components/DetailsActionBar';
import DetailsHeroCard from '../components/DetailsHeroCard';
import DetailsTopBar, { topBarSpace } from '../components/DetailsTopBar';
import MapsChooserSheet from '../components/MapsChooserSheet';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';

import { DETAILS_COPY } from '../constants/stations.constants';
import { useStationDetails } from '../hooks/useStationDetails';

type StationDetailsScreenProps = {
  stationId: string;
};

const DetailsSkeleton = () => {
  const t = useTheme();

  return (
    <View testID="station-details-loading" style={{ gap: t.space[4] }}>
      <AppSkeleton height={t.space[12] * 6} radius={t.radius.sheet} />
      <AppSkeleton width="40%" height={Number(t.type.title2.lineHeight)} />
      <View style={[styles.row, { gap: t.space[3] }]}>
        <AppSkeleton height={t.space[12] * 4} radius={t.radius.card} style={styles.grow} />
        <AppSkeleton height={t.space[12] * 4} radius={t.radius.card} style={styles.grow} />
      </View>
    </View>
  );
};

// Built from the map screen's pieces: the same glass capsule up top, the map card grown into
// the hero, connectors as a swipeable card row, and the dark Go pill in a floating glass bar.
const StationDetailsScreen = ({ stationId }: StationDetailsScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const details = useStationDetails(stationId);
  const { station } = details;
  const top = topBarSpace(t, insets.top);

  const topBar = (
    <DetailsTopBar
      title={station?.name ?? null}
      isFavourite={details.isFavourite}
      onBack={details.goBack}
      onShare={station ? details.share : null}
      onToggleFavourite={station ? details.toggleFavourite : null}
    />
  );

  if (details.loading) {
    return (
      <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
        <View style={{ paddingTop: top, paddingHorizontal: t.layout.screenPadding }}>
          <DetailsSkeleton />
        </View>
        {topBar}
      </View>
    );
  }

  if (!station) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: t.colors.bg }]}>
        <AppErrorState
          title={DETAILS_COPY.loadError}
          message={getErrorMessage(details.error)}
          onRetry={details.retry}
          retryLabel={DETAILS_COPY.retry}
        />
        {topBar}
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <ScrollView
        contentContainerStyle={{
          gap: t.layout.sectionGapLarge,
          paddingTop: top,
          paddingBottom: actionBarHeight(t, insets.bottom) + t.layout.sectionGap,
        }}
        refreshControl={
          <RefreshControl
            refreshing={details.refreshing}
            onRefresh={details.refresh}
            tintColor={t.colors.accentText}
            progressViewOffset={top}
          />
        }
      >
        <View style={{ paddingHorizontal: t.layout.screenPadding }}>
          <DetailsHeroCard station={station} distance={details.distance} />
        </View>

        {details.chargers.length ? (
          <ConnectorCarousel chargers={details.chargers} onConnectorPress={details.openConnector} />
        ) : (
          <AppEmptyState
            icon={PlugZap}
            title={DETAILS_COPY.noChargers}
            description={DETAILS_COPY.noChargersBody}
          />
        )}

        <View style={{ paddingHorizontal: t.layout.screenPadding }}>
          <AboutSection station={station} onCall={details.call} />
        </View>
      </ScrollView>

      {topBar}

      <DetailsActionBar
        eta={details.eta}
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
});
