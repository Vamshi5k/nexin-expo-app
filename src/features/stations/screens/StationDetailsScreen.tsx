import { useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';

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
import StationSummary from '../components/StationSummary';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';
import { riseIn } from '@/shared/utils/motion';

import { DETAILS_COPY, pad2, type DetailsTab } from '../constants/stations.constants';
import { useHeaderReveal } from '../hooks/useHeaderReveal';
import { useHeroImages } from '../hooks/useHeroImages';
import { useHeroParallax } from '../hooks/useHeroParallax';
import { useStationDetails } from '../hooks/useStationDetails';
import { useStickyTabs } from '../hooks/useStickyTabs';
import { freeConnectors } from '../utils/connector';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationDetailsScreenProps = {
  stationId: string;
};

// The photo panel takes about a third of the screen at a fixed size, so images never push the
// page around.
const HERO_RATIO = 0.3;
// Until the tabs are measured they never pin.
const NOT_MEASURED = Number.MAX_SAFE_INTEGER;

// Photo panel, then the name and the figures that matter (free connectors, power, price,
// route), then Chargers / Info tabs that pin under a header with the name, status and address.
const StationDetailsScreen = ({ stationId }: StationDetailsScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height: screenHeight } = useWindowDimensions();
  const details = useStationDetails(stationId);
  const { station } = details;
  const heroHeight = Math.round(screenHeight * HERO_RATIO);
  const top = topBarSpace(t, insets.top);
  const [tabsY, setTabsY] = useState<number | null>(null);
  const stickAt = tabsY === null ? NOT_MEASURED : tabsY - top;
  const header = useHeaderReveal(heroHeight - top + t.space[12], t.space[10]);
  const heroStyle = useHeroParallax(header.scrollY, heroHeight);
  const { tab, selectTab, scrollRef, pinnedStyle } = useStickyTabs<DetailsTab>(
    'chargers',
    header.scrollY,
    stickAt,
  );
  const hero = useHeroImages(station?.imageUrls ?? []);
  const overPhoto = hero.images.length > 0 && !header.revealed;

  const onTabsLayout = (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    if (y !== tabsY) setTabsY(y);
  };

  const topBar = (
    <DetailsTopBar
      title={station?.name ?? null}
      subtitle={
        station
          ? [station.rawStatus || STATUS_LABEL[station.status], station.address]
              .filter(Boolean)
              .join(' · ')
          : null
      }
      statusColor={station ? t.colors.connector[pinColorKey(station.status)] : undefined}
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
          <AppSkeleton height={heroHeight} radius={t.radius.sheet} />
        </View>
        <View style={{ gap: t.space[3], padding: t.layout.screenPadding }}>
          <AppSkeleton width="70%" height={Number(t.type.display.lineHeight)} />
          <AppSkeleton height={t.space[12] * 3} radius={t.radius.sheet} />
          <AppSkeleton height={t.space[12] * 2} radius={t.radius.card} />
          <AppSkeleton height={t.space[12] * 4} radius={t.radius.sheet} />
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

  const tabsWrap = {
    paddingHorizontal: t.layout.screenPadding,
    paddingVertical: t.space[2],
    backgroundColor: t.colors.bg,
  };

  const tabsBar = (
    <AppSegmentedControl
      segments={[
        {
          value: 'chargers',
          label: DETAILS_COPY.chargers,
          badge: details.chargers.length ? pad2(details.chargers.length) : undefined,
        },
        { value: 'info', label: DETAILS_COPY.info },
      ]}
      value={tab}
      onChange={selectTab}
      accessibilityLabel={DETAILS_COPY.sections}
    />
  );

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <StatusBar style={overPhoto ? 'light' : 'dark'} />

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={header.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, t.space[4]) }}
        showsVerticalScrollIndicator={false}
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
            images={hero.images}
            page={hero.page}
            width={width}
            height={heroHeight}
            onPageChange={hero.setPage}
            onImageError={hero.onError}
          />
        </Animated.View>

        <View
          style={{
            paddingHorizontal: t.layout.screenPadding,
            paddingTop: t.space[4],
            paddingBottom: t.space[2],
            backgroundColor: t.colors.bg,
          }}
        >
          <StationSummary
            station={station}
            distance={details.distance}
            eta={details.eta}
            onDirections={details.openDirections}
          />
        </View>

        <View onLayout={onTabsLayout} style={tabsWrap}>
          {tabsBar}
        </View>

        {/* At least a screen tall, so switching to a short tab never unpins the tabs. */}
        <View
          style={{
            minHeight: screenHeight - top,
            paddingHorizontal: t.layout.screenPadding,
            paddingTop: t.space[2],
            backgroundColor: t.colors.bg,
          }}
        >
          <Animated.View key={tab} entering={riseIn(0)} style={{ gap: t.space[2] + t.space[1] }}>
            {tab === 'chargers' ? (
              details.chargers.length ? (
                <>
                  {details.chargers.some(charger => freeConnectors(charger) > 0) ? (
                    <AppText
                      variant="caption"
                      tone="secondary"
                      style={{ paddingHorizontal: t.space[1] }}
                    >
                      {DETAILS_COPY.tip}
                    </AppText>
                  ) : null}
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
                distance={details.distance}
                eta={details.eta}
                onCopyAddress={details.copyAddress}
                onCall={details.call}
                onDirections={details.openDirections}
              />
            )}
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Screen readers use the tabs in the page; this copy is only the visual pin. */}
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.pinned, tabsWrap, { top }, pinnedStyle]}
      >
        {tabsBar}
      </Animated.View>

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
  pinned: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
