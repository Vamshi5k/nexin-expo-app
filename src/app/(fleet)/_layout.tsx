import { GuardedStack } from '@/features/auth';

/** Fleet driver screens: fleet session only, and only while the fleet feature is on. */
export default function FleetLayout() {
  return <GuardedStack group="fleet" />;
}
