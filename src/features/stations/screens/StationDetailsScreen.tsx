import { RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { PlugZap } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppEmptyState,
  AppErrorState,
  AppSegmentedControl,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import ChargerGroup from '../components/ChargerGroup';
import DetailsTopBar, { topBarSpace } from '../components/DetailsTopBar';
import MapsChooserSheet from '../components/MapsChooserSheet';
import StationHero from '../components/StationHero';
import StationInfo from '../components/StationInfo';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';
import { riseIn } from '@/shared/utils/motion';

import { DETAILS_COPY, type DetailsTab } from '../constants/stations.constants';
import { useHeaderReveal } from '../hooks/useHeaderReveal';
import { useHeroImages } from '../hooks/useHeroImages';
import { useHeroParallax } from '../hooks/useHeroParallax';
import { useStationDetails } from '../hooks/useStationDetails';
import { useStickyTabs } from '../hooks/useStickyTabs';

type StationDetailsScreenProps = {
  stationId: string;
};

// The hero takes about 40% of the screen at a fixed size, so images never push the page around.
const HERO_RATIO = 0.4;

// Hero first (photos or the brand illustration, status, name, directions, stats), then
// Chargers / Info tabs. Scrolling fades the hero away and pins the tabs under a header that
// shows the station name and address.
const StationDetailsScreen = ({ stationId }: StationDetailsScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height: screenHeight } = useWindowDimensions();
  const details = useStationDetails(stationId);
  const { station } = details;
  const heroHeight = Math.round(screenHeight * HERO_RATIO);
  const top = topBarSpace(t, insets.top);
  const stickAt = heroHeight - top;
  const header = useHeaderReveal(stickAt, t.space[12]);
  const heroStyle = useHeroParallax(header.scrollY, heroHeight);
  const { tab, selectTab, scrollRef, tabsStyle } = useStickyTabs<DetailsTab>(
    'chargers',
    header.scrollY,
    stickAt,
  );
  const hero = useHeroImages(station?.imageUrls ?? []);
  const overPhoto = hero.images.length > 0 && !header.revealed;

  const topBar = (
    <DetailsTopBar
      title={station?.name ?? null}
      subtitle={station?.address ?? null}
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
        ref={scrollRef}
        onScroll={header.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, t.space[4]) }}
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
            onDirections={details.openDirections}
          />
        </Animated.View>

        {/* Above the content so it covers it once pinned under the header. */}
        <Animated.View
          style={[
            styles.tabs,
            {
              paddingHorizontal: t.layout.screenPadding,
              paddingVertical: t.space[3],
              backgroundColor: t.colors.bg,
            },
            tabsStyle,
          ]}
        >
          <AppSegmentedControl
            segments={[
              { value: 'chargers', label: DETAILS_COPY.chargers, count: details.chargers.length },
              { value: 'info', label: DETAILS_COPY.info },
            ]}
            value={tab}
            onChange={selectTab}
            accessibilityLabel={DETAILS_COPY.sections}
          />
        </Animated.View>

        {/* At least a screen tall, so switching to a short tab never unpins the tabs. */}
        <View
          style={{
            minHeight: screenHeight - top,
            paddingHorizontal: t.layout.screenPadding,
            paddingTop: t.space[2],
            backgroundColor: t.colors.bg,
          }}
        >
          <Animated.View key={tab} entering={riseIn(0)} style={{ gap: t.space[4] }}>
            {tab === 'chargers' ? (
              details.chargers.length ? (
                <>
                  <AppText variant="caption" tone="secondary">
                    {DETAILS_COPY.tip}
                  </AppText>
                  {details.chargers.map((charger, index) => (
                    <ChargerGroup
                      key={charger.id}
                      charger={charger}
                      index={index}
                      onConnectorPress={details.openConnector}
                    />
                  ))}
                </>
              ) : (
                <AppEmptyState
                  icon={PlugZap}
                  title={DETAILS_COPY.noChargers}
                  description={DETAILS_COPY.noChargersBody}
                />
              )
            ) : (
              <StationInfo
                station={station}
                onCopyAddress={details.copyAddress}
                onCall={details.call}
                onDirections={details.openDirections}
              />
            )}
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {topBar}

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
  tabs: {
    zIndex: 1,
  },
});
