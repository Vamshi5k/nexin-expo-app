import { useLocalSearchParams } from 'expo-router';

import { StationsScreen } from '@/features/stations';

export default function StationsRoute() {
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  return <StationsScreen focusSearch={focus === '1'} />;
}
