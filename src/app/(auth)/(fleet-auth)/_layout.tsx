import { GuardedStack } from '@/features/auth';

export default function FleetAuthLayout() {
  return <GuardedStack group="fleet-auth" />;
}
