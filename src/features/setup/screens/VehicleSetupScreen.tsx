import { View } from 'react-native';

import { VehicleForm } from '@/features/vehicles';
import { useTheme } from '@/theme';
import { Button, Screen } from '@/ui';

import { SetupHeader } from '../components/SetupHeader';
import { useVehicleSetup } from '../hooks';

export function VehicleSetupScreen() {
  const t = useTheme();
  const { wizard, skip } = useVehicleSetup();
  return (
    <Screen
      scroll
      footer={
        <View style={{ flexDirection: 'row', gap: t.space[3] }}>
          {wizard.stepIndex > 0 ? (
            <Button
              label="Back"
              variant="secondary"
              onPress={() => wizard.back()}
              style={{ flex: 1 }}
            />
          ) : null}
          <Button
            label={wizard.isLastStep ? 'Add Vehicle' : 'Continue'}
            onPress={wizard.next}
            disabled={!wizard.canContinue}
            loading={wizard.submitting}
            style={{ flex: 1 }}
          />
        </View>
      }
      contentStyle={{ gap: t.space[6] }}
    >
      <SetupHeader
        step={2}
        right={
          <Button label="Skip" variant="ghost" size="medium" onPress={skip} haptic="selection" />
        }
      />
      <VehicleForm wizard={wizard} />
    </Screen>
  );
}
