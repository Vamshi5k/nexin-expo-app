import { AppButton } from '@/shared/components';

import SetupLayout from '../components/SetupLayout';
import { VehicleFormBody, VehicleTrail } from '@/features/vehicles';

import { useVehicleSetup } from '../hooks/useVehicleSetup';

const VehicleSetupScreen = () => {
  const { wizard, skip } = useVehicleSetup();

  return (
    <SetupLayout
      step={2}
      title={wizard.title}
      subtitle={wizard.subtitle}
      onBack={wizard.stepIndex > 0 ? () => wizard.back() : undefined}
      right={
        <AppButton label="Skip" variant="ghost" size="medium" onPress={skip} haptic="selection" />
      }
      aboveTitle={<VehicleTrail wizard={wizard} />}
      footer={
        <AppButton
          label={wizard.isLastStep ? 'Add Vehicle' : 'Continue'}
          onPress={wizard.next}
          disabled={!wizard.canContinue}
          loading={wizard.submitting}
        />
      }
    >
      <VehicleFormBody wizard={wizard} />
    </SetupLayout>
  );
};

export default VehicleSetupScreen;
