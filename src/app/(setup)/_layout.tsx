import { GuardedStack } from '@/features/auth';

export default function SetupLayout() {
  return <GuardedStack group="setup" />;
}
