import { View } from 'react-native';

import { AppButton, AppScreen, AppPageHeader } from '@/shared/components';

import VehicleFormBody from '../components/VehicleFormBody';
import VehicleTrail from '../components/VehicleTrail';

import { useTheme } from '@/shared/theme';

import { ADD_COPY, VEHICLES_HREF } from '../constants/vehicles.constants';
import { useAddVehicle } from '../hooks/useAddVehicle';

// Add Vehicle (BLUEPRINT E4): the setup wizard without Skip, in the app's header style.
const AddVehicleScreen = () => {
  const t = useTheme();
  const { wizard, back } = useAddVehicle();

  return (
    <AppScreen
      scroll
      wash
      contentStyle={{ gap: t.space[3], paddingTop: t.space[2] }}
      footer={
        <AppButton
          label={wizard.isLastStep ? ADD_COPY.add : ADD_COPY.continue}
          onPress={wizard.next}
          disabled={!wizard.canContinue}
          loading={wizard.submitting}
        />
      }
    >
      <AppPageHeader
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

export default AddVehicleScreen;
