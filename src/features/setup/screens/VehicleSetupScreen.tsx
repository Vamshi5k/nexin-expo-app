import { VehicleFormBody, VehicleTrail } from '@/features/vehicles';
import { Button } from '@/ui';

import { SetupLayout } from '../components/SetupLayout';
import { useVehicleSetup } from '../hooks';

export function VehicleSetupScreen() {
  const { wizard, skip } = useVehicleSetup();
  return (
    <SetupLayout
      step={2}
      title={wizard.title}
      subtitle={wizard.subtitle}
      onBack={wizard.stepIndex > 0 ? () => wizard.back() : undefined}
      right={
        <Button label="Skip" variant="ghost" size="medium" onPress={skip} haptic="selection" />
      }
      aboveTitle={<VehicleTrail wizard={wizard} />}
      footer={
        <Button
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
}
