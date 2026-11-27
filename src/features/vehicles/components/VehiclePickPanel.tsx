import { View } from 'react-native';

import { AppButton, AppScreen } from '@/shared/components';

import VehicleFormBody from './VehicleFormBody';
import VehiclesHeader from './VehiclesHeader';
import VehicleTrail from './VehicleTrail';

import { useTheme } from '@/shared/theme';

import { ADD_COPY, EDIT_VEHICLE_COPY, VEHICLES_HREF } from '../constants/vehicles.constants';
import { useVehicleWizard } from '../hooks/useVehicleWizard';
import type { VehiclePick } from '../types/vehicles.types';

type VehiclePickPanelProps = {
  onPicked: (pick: VehiclePick) => void;
  onCancel: () => void;
};

// Edit Vehicle's "Change": brand, model and battery through the wizard's pickers, then back to
// the form with the new picks. Mounted only while changing, so lists load only when needed.
const VehiclePickPanel = ({ onPicked, onCancel }: VehiclePickPanelProps) => {
  const t = useTheme();
  const wizard = useVehicleWizard({ onPicked });

  const back = () => {
    if (!wizard.back()) onCancel();
  };

  return (
    <AppScreen
      scroll
      wash
      contentStyle={{ gap: t.space[4], paddingTop: t.space[2] }}
      footer={
        <AppButton
          label={wizard.isLastStep ? EDIT_VEHICLE_COPY.usePick : ADD_COPY.continue}
          onPress={wizard.next}
          disabled={!wizard.canContinue}
        />
      }
    >
      <VehiclesHeader
        eyebrow={ADD_COPY.step(wizard.stepIndex, wizard.stepCount)}
        title={wizard.title}
        subtitle={wizard.subtitle}
        fallbackHref={VEHICLES_HREF.list}
        onBack={back}
      />
      <VehicleTrail wizard={wizard} />
      <View>
        <VehicleFormBody wizard={wizard} />
      </View>
    </AppScreen>
  );
};

export default VehiclePickPanel;
