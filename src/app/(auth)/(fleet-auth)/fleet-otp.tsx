import { Redirect, useLocalSearchParams } from 'expo-router';

import { FLEET_HREF, FleetOtpScreen } from '@/features/auth';

export default function FleetOtpRoute() {
  const { fleetId, contact, driverId } = useLocalSearchParams<{
    fleetId?: string;
    contact?: string;
    driverId?: string;
  }>();
  if (!contact || !driverId) return <Redirect href={FLEET_HREF.login} />;
  return <FleetOtpScreen fleetId={fleetId || null} contact={contact} driverId={driverId} />;
}
