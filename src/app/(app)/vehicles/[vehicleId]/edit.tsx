import { useLocalSearchParams } from 'expo-router';

import { EditVehicleScreen } from '@/features/vehicles';

export default function EditVehicleRoute() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  return <EditVehicleScreen vehicleId={String(vehicleId ?? '')} />;
}
