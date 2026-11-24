import { GuardedStack } from '@/features/auth';

export default function FleetLayout() {
  return <GuardedStack group="fleet" />;
}
