import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Heart, PlugZap, Share2, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppBackButton,
  AppEmptyState,
  AppErrorState,
  AppPressable,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import AboutSection from '../components/AboutSection';
import ConnectorGrid from '../components/ConnectorGrid';
import DetailsActionBar, { actionBarHeight } from '../components/DetailsActionBar';
import MapsChooserSheet from '../components/MapsChooserSheet';
import SummaryCard from '../components/SummaryCard';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';

import { DETAILS_COPY } from '../constants/stations.constants';
import { useStationDetails } from '../hooks/useStationDetails';

type StationDetailsScreenProps = {
  stationId: string;
};

type IconButtonProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
};

const IconButton = ({ icon: Icon, label, onPress, active }: IconButtonProps) => {
  const t = useTheme();
  const color = active ? t.colors.danger : t.colors.textPrimary;

  return (
    <AppPressable
      onPress={onPress}
      haptic="light"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active === undefined ? undefined : { selected: active }}
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
      <Icon
        color={color}
        fill={active ? color : 'transparent'}
        size={t.icon.control}
        strokeWidth={t.icon.stroke}
      />
    </AppPressable>
  );
};

const DetailsSkeleton = () => {
  const t = useTheme();

  return (
    <View testID="station-details-loading" style={{ gap: t.space[4] }}>
      <AppSkeleton height={t.space[12] * 5} radius={t.radius.sheet} />
      <AppSkeleton width="50%" height={Number(t.type.title2.lineHeight)} />
      <View style={[styles.row, { gap: t.space[3] }]}>
        <AppSkeleton height={t.space[12] * 3} radius={t.radius.card} style={styles.grow} />
        <AppSkeleton height={t.space[12] * 3} radius={t.radius.card} style={styles.grow} />
      </View>
    </View>
  );
};

// Organised in the order a driver decides: can I charge here (summary), which plug (bays),
// anything else (about), then take me there (sticky bar).
const StationDetailsScreen = ({ stationId }: StationDetailsScreenProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const details = useStationDetails(stationId);
  const { station } = details;

  const topBar = (
    <View
      style={[
        styles.row,
        {
          gap: t.space[2],
          paddingTop: insets.top + t.space[2],
          paddingBottom: t.space[3],
          paddingHorizontal: t.layout.screenPadding,
        },
      ]}
    >
      <AppBackButton onPress={details.goBack} />
      <View style={styles.grow} />
      {station ? (
        <>
          <IconButton icon={Share2} label={DETAILS_COPY.share} onPress={details.share} />
          <IconButton
            icon={Heart}
            label={details.isFavourite ? DETAILS_COPY.removeFavourite : DETAILS_COPY.addFavourite}
            onPress={details.toggleFavourite}
            active={details.isFavourite}
          />
        </>
      ) : null}
    </View>
  );

  if (details.loading) {
    return (
      <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
        {topBar}
        <View style={{ paddingHorizontal: t.layout.screenPadding }}>
          <DetailsSkeleton />
        </View>
      </View>
    );
  }

  if (!station) {
    return (
      <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
        {topBar}
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

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      {topBar}

      <ScrollView
        contentContainerStyle={{
          gap: t.layout.sectionGapLarge,
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: actionBarHeight(t, insets.bottom) + t.layout.sectionGap,
        }}
        refreshControl={
          <RefreshControl
            refreshing={details.refreshing}
            onRefresh={details.refresh}
            tintColor={t.colors.accentText}
          />
        }
      >
        <SummaryCard station={station} distance={details.distance} />

        <View style={{ gap: t.space[4] }}>
          <View style={{ gap: t.space[1] }}>
            <AppText variant="title2" accessibilityRole="header">
              {DETAILS_COPY.chooseConnector}
            </AppText>
            {details.chargers.length ? (
              <AppText variant="subhead" tone="secondary">
                {DETAILS_COPY.tip}
              </AppText>
            ) : null}
          </View>

          {details.chargers.length ? (
            details.chargers.map((charger, index) => (
              <ConnectorGrid
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

        <AboutSection station={station} onCall={details.call} />
      </ScrollView>

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
