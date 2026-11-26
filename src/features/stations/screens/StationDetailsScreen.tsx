import { RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { PlugZap } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppEmptyState, AppErrorState, AppSkeleton, AppText } from '@/shared/components';

import AboutSection from '../components/AboutSection';
import ChargerGroup from '../components/ChargerGroup';
import DetailsActionBar, { actionBarHeight } from '../components/DetailsActionBar';
import DetailsTopBar, { topBarSpace } from '../components/DetailsTopBar';
import MapsChooserSheet from '../components/MapsChooserSheet';
import StationHero from '../components/StationHero';
import StationInfoSheet from '../components/StationInfoSheet';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';
import { riseIn } from '@/shared/utils/motion';

import { DETAILS_COPY } from '../constants/stations.constants';
import { useHeaderReveal } from '../hooks/useHeaderReveal';
import { useHeroImages } from '../hooks/useHeroImages';
import { useHeroParallax } from '../hooks/useHeroParallax';
import { useStationDetails } from '../hooks/useStationDetails';

type StationDetailsScreenProps = {
  stationId: string;
};

// The hero takes about 40% of the screen at a fixed size, so images never push the page around.
const HERO_RATIO = 0.4;

// Hero first (photos or the brand illustration, status, name, stats), then chargers grouped
// with their connectors, a short About card with a full details sheet, and the Go bar.
const StationDetailsScreen = ({ stationId }: StationDetailsScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height: screenHeight } = useWindowDimensions();
  const details = useStationDetails(stationId);
  const { station } = details;
  const heroHeight = Math.round(screenHeight * HERO_RATIO);
  const top = topBarSpace(t, insets.top);
  const header = useHeaderReveal(heroHeight - top, t.space[12]);
  const heroStyle = useHeroParallax(header.scrollY, heroHeight);
  const hero = useHeroImages(station?.imageUrls ?? []);
  const overPhoto = hero.images.length > 0 && !header.revealed;

  const topBar = (
    <DetailsTopBar
      title={station?.name ?? null}
      isFavourite={details.isFavourite}
      barStyle={station ? header.barStyle : undefined}
      titleStyle={header.titleStyle}
      onBack={details.goBack}
      onShare={station ? details.share : null}
      onToggleFavourite={station ? details.toggleFavourite : null}
    />
  );

  if (details.loading) {
    return (
      <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
        <View testID="station-details-loading">
          <AppSkeleton height={heroHeight} radius={0} />
        </View>
        <View style={{ gap: t.space[3], padding: t.layout.screenPadding }}>
          <AppSkeleton width="40%" height={Number(t.type.headline.lineHeight)} />
          <AppSkeleton height={t.space[12] * 4} radius={t.radius.card} />
          <AppSkeleton height={t.space[12] * 4} radius={t.radius.card} />
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
      <StatusBar style={overPhoto ? 'light' : 'dark'} />

      <Animated.ScrollView
        onScroll={header.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: actionBarHeight(t, insets.bottom) }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={details.refreshing}
            onRefresh={details.refresh}
            tintColor={t.colors.accentText}
            progressViewOffset={top}
          />
        }
      >
        <Animated.View style={heroStyle}>
          <StationHero
            station={station}
            distance={details.distance}
            images={hero.images}
            page={hero.page}
            width={width}
            height={heroHeight}
            onPageChange={hero.setPage}
            onImageError={hero.onError}
          />
        </Animated.View>

        {/* Opaque so the hero slides behind it while it drifts (parallax). */}
        <View
          style={{
            gap: t.layout.sectionGap,
            paddingVertical: t.layout.sectionGap,
            backgroundColor: t.colors.bg,
          }}
        >
          <Animated.View entering={riseIn(3)} style={{ gap: t.space[6] }}>
            <View style={{ gap: t.space[1], paddingHorizontal: t.layout.screenPadding }}>
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
                <ChargerGroup
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
          </Animated.View>

          <Animated.View entering={riseIn(4)} style={{ paddingHorizontal: t.layout.screenPadding }}>
            <AboutSection station={station} onViewAll={details.openInfo} />
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {topBar}

      <DetailsActionBar
        eta={details.eta}
        onDirections={details.openDirections}
        onCall={station.phone ? details.call : null}
      />

      <StationInfoSheet
        open={details.infoOpen}
        station={station}
        onClose={details.closeInfo}
        onCopyAddress={details.copyAddress}
        onCall={details.call}
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
});
