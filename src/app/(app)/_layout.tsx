import { GuardedStack } from '@/features/auth';

/** Signed-in consumer screens. Anything else (incl. logged-out deep links) goes to "/". */
export default function AppLayout() {
  return <GuardedStack group="app" />;
}
