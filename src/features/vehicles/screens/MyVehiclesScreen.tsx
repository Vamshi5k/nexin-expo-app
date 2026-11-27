import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Car, Plus } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppButton,
  AppDialog,
  AppEmptyState,
  AppErrorState,
  AppFade,
  AppSkeleton,
  AppPageHeader,
} from '@/shared/components';

import VehicleActionsSheet from '../components/VehicleActionsSheet';
import VehicleCard from '../components/VehicleCard';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import { VEHICLES_COPY, VEHICLES_HREF } from '../constants/vehicles.constants';
import { useMyVehicles } from '../hooks/useMyVehicles';

const SKELETONS = 3;

// My Vehicles (BLUEPRINT E3): the primary vehicle first, each card with ⋯ for Edit / Make
// primary / Delete and the auto-charge switch; Add Vehicle pinned at the bottom.
const MyVehiclesScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const list = useMyVehicles();
  const deleting = list.deleteFor;

  const body = () => {
    if (list.loading) {
      return (
        <View testID="vehicles-loading" style={{ gap: t.space[3] }}>
          {Array.from({ length: SKELETONS }, (_, index) => (
            <AppSkeleton key={index} height={t.space[12] * 3} radius={t.radius.card} />
          ))}
        </View>
      );
    }
    if (list.failed) {
      return (
        <AppErrorState
          title={VEHICLES_COPY.loadError}
          message={list.errorMessage}
          onRetry={list.retry}
          retryLabel={VEHICLES_COPY.retry}
        />
      );
    }
    if (list.empty) {
      return (
        <AppEmptyState
          icon={Car}
          title={VEHICLES_COPY.emptyTitle}
          description={VEHICLES_COPY.emptyBody}
        />
      );
    }
    return list.vehicles.map((vehicle, index) => (
      <Animated.View key={vehicle.id} entering={riseIn(index + 1)}>
        <VehicleCard
          vehicle={vehicle}
          title={list.title(vehicle)}
          busy={list.isBusy(vehicle)}
          onPress={() => list.openEdit(vehicle)}
          onMore={() => list.openSheet(vehicle)}
          onToggleAutoCharge={() => list.toggleAutoCharge(vehicle)}
        />
      </Animated.View>
    ));
  };

  const deleteMessage = deleting
    ? [
        VEHICLES_COPY.deleteBody(list.title(deleting), deleting.regNo),
        deleting.isPrimary ? VEHICLES_COPY.deletePrimary : null,
        list.isOnly ? VEHICLES_COPY.deleteOnly : null,
      ]
        .filter(Boolean)
        .join(' ')
    : undefined;

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <View pointerEvents="none" style={[styles.wash, { height: insets.top + t.space[12] * 4 }]}>
        <AppFade id="vehicles-wash" color={t.colors.accent} from={0.22} to={0} top />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          gap: t.space[3],
          paddingTop: insets.top + t.space[2],
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: t.space[6],
        }}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={list.refresh}
            tintColor={t.colors.accentText}
            progressViewOffset={insets.top}
          />
        }
      >
        <View style={{ marginBottom: t.space[2] }}>
          <AppPageHeader
            title={VEHICLES_COPY.title}
            subtitle={
              list.vehicles.length ? VEHICLES_COPY.count(list.vehicles.length) : VEHICLES_COPY.empty
            }
            fallbackHref={VEHICLES_HREF.profile}
          />
        </View>
        {body()}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: t.layout.screenPadding,
          paddingTop: t.space[3],
          paddingBottom: Math.max(insets.bottom, t.space[4]),
          borderTopWidth: t.layout.hairline,
          borderTopColor: t.colors.border,
          backgroundColor: t.colors.bg,
        }}
      >
        <AppButton label={VEHICLES_COPY.add} icon={Plus} onPress={list.openAdd} />
      </View>

      <VehicleActionsSheet
        open={list.sheetFor !== null}
        title={list.sheetFor ? list.title(list.sheetFor) : ''}
        isPrimary={!!list.sheetFor?.isPrimary}
        onClose={list.closeSheet}
        onEdit={() => list.sheetFor && list.openEdit(list.sheetFor)}
        onMakePrimary={() => list.sheetFor && list.makePrimary(list.sheetFor)}
        onDelete={() => list.sheetFor && list.askDelete(list.sheetFor)}
      />

      <AppDialog
        open={deleting !== null}
        title={VEHICLES_COPY.deleteTitle}
        message={deleteMessage}
        confirmLabel={VEHICLES_COPY.remove}
        cancelLabel={VEHICLES_COPY.cancel}
        onConfirm={list.confirmDelete}
        onCancel={list.cancelDelete}
        loading={list.deleting}
        destructive
      />
    </View>
  );
};

export default MyVehiclesScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
