import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Car, Cpu, Hash, Save } from 'lucide-react-native';
import Animated from 'react-native-reanimated';

import {
  AppButton,
  AppDialog,
  AppEmptyState,
  AppErrorState,
  AppFormInput,
  AppScreen,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import VehicleGlyph from '../components/VehicleGlyph';
import VehiclePickPanel from '../components/VehiclePickPanel';
import VehiclesHeader from '../components/VehiclesHeader';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';
import { riseIn } from '@/shared/utils/motion';

import {
  EDIT_VEHICLE_COPY,
  MAC_ID_MAX_LENGTH,
  REG_NO_MAX_LENGTH,
  VEHICLES_COPY,
  VEHICLES_HREF,
} from '../constants/vehicles.constants';
import { useEditVehicle } from '../hooks/useEditVehicle';

type EditVehicleScreenProps = {
  vehicleId: string;
};

type SectionProps = {
  title: string;
  step: number;
  children: ReactNode;
};

const Section = ({ title, step, children }: SectionProps) => {
  const t = useTheme();

  return (
    <Animated.View entering={riseIn(step)} style={{ gap: t.space[2] }}>
      <AppText
        variant="caption"
        tone="secondary"
        accessibilityRole="header"
        style={[styles.overline, { paddingHorizontal: t.space[1] }]}
      >
        {title}
      </AppText>
      <View
        style={{
          gap: t.space[4],
          padding: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
};

// Edit Vehicle (BLUEPRINT E5): a form, not the wizard. The vehicle card swaps brand, model and
// battery through the pickers; the details are edited in place.
const EditVehicleScreen = ({ vehicleId }: EditVehicleScreenProps) => {
  const t = useTheme();
  const edit = useEditVehicle(vehicleId);

  if (edit.picking) {
    return <VehiclePickPanel onPicked={edit.onPicked} onCancel={edit.cancelPicking} />;
  }

  const header = (
    <VehiclesHeader
      title={EDIT_VEHICLE_COPY.title}
      subtitle={EDIT_VEHICLE_COPY.subtitle}
      fallbackHref={VEHICLES_HREF.list}
    />
  );

  if (edit.loading || edit.failed || edit.notFound) {
    return (
      <AppScreen scroll wash contentStyle={{ gap: t.space[5], paddingTop: t.space[2] }}>
        {header}
        {edit.loading ? (
          <View testID="edit-vehicle-loading" style={{ gap: t.space[3] }}>
            <AppSkeleton height={t.space[12] * 2} radius={t.radius.card} />
            <AppSkeleton height={t.space[12] * 4} radius={t.radius.card} />
          </View>
        ) : edit.failed ? (
          <AppErrorState
            title={VEHICLES_COPY.loadError}
            message={edit.errorMessage}
            onRetry={edit.retry}
            retryLabel={VEHICLES_COPY.retry}
          />
        ) : (
          <AppEmptyState
            icon={Car}
            title={EDIT_VEHICLE_COPY.notFound}
            description={EDIT_VEHICLE_COPY.notFoundBody}
            actionLabel={EDIT_VEHICLE_COPY.backToList}
            onAction={edit.backToList}
          />
        )}
      </AppScreen>
    );
  }

  return (
    <>
      <AppScreen
        scroll
        wash
        contentStyle={{ gap: t.space[5], paddingTop: t.space[2] }}
        footer={
          <AppButton
            label={EDIT_VEHICLE_COPY.save}
            icon={Save}
            onPress={edit.submit}
            loading={edit.saving}
            disabled={!edit.canSave}
          />
        }
      >
        {header}

        <Section title={EDIT_VEHICLE_COPY.vehicle} step={1}>
          <View style={[styles.row, { gap: t.space[3] }]}>
            <View
              style={[
                styles.center,
                {
                  width: t.space[10],
                  height: t.space[10],
                  borderRadius: t.radius.control,
                  backgroundColor: t.colors.accentSoft,
                },
              ]}
            >
              <VehicleGlyph color={t.colors.accentText} size={t.icon.control} />
            </View>
            <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
              <AppText
                variant="subhead"
                numberOfLines={1}
                style={{ fontFamily: t.type.headline.fontFamily }}
              >
                {edit.title}
              </AppText>
              <AppText variant="caption" tone="secondary" tabular>
                {`${EDIT_VEHICLE_COPY.battery} · ${edit.battery}`}
              </AppText>
            </View>
            <AppButton
              label={EDIT_VEHICLE_COPY.change}
              variant="secondary"
              size="medium"
              onPress={edit.startPicking}
            />
          </View>
        </Section>

        <Section title={EDIT_VEHICLE_COPY.details} step={2}>
          <AppFormInput
            control={edit.control}
            name="regNo"
            label={EDIT_VEHICLE_COPY.regNo}
            placeholder={brand.regNoPlaceholder}
            icon={Hash}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={REG_NO_MAX_LENGTH}
          />
        </Section>

        <Section title={EDIT_VEHICLE_COPY.autoCharge} step={3}>
          <AppFormInput
            control={edit.control}
            name="macId"
            label={EDIT_VEHICLE_COPY.macId}
            placeholder={EDIT_VEHICLE_COPY.macIdPlaceholder}
            icon={Cpu}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={MAC_ID_MAX_LENGTH}
          />
          <AppFormInput
            control={edit.control}
            name="maxAmount"
            label={EDIT_VEHICLE_COPY.maxAmount}
            placeholder={EDIT_VEHICLE_COPY.maxAmountPlaceholder}
            prefix={brand.currency.symbol}
            keyboardType="number-pad"
          />
        </Section>
      </AppScreen>

      <AppDialog
        open={edit.leaveOpen}
        title={EDIT_VEHICLE_COPY.discardTitle}
        message={EDIT_VEHICLE_COPY.discardBody}
        confirmLabel={EDIT_VEHICLE_COPY.discard}
        cancelLabel={EDIT_VEHICLE_COPY.keepEditing}
        onConfirm={edit.discard}
        onCancel={edit.keepEditing}
        destructive
      />
    </>
  );
};

export default EditVehicleScreen;

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
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
