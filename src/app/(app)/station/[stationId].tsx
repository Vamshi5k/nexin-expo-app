import { useLocalSearchParams } from 'expo-router';

import { StationDetailsScreen } from '@/features/stations';

export default function StationDetailsRoute() {
  const { stationId } = useLocalSearchParams<{ stationId: string }>();
  return <StationDetailsScreen stationId={stationId} />;
}
