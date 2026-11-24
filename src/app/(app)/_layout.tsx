import { GuardedStack } from '@/features/auth';

export default function AppLayout() {
  return <GuardedStack group="app" />;
}
