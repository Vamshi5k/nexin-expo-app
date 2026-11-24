import { GuardedStack } from '@/features/auth';

/** First-run steps: consumer session only. */
export default function SetupLayout() {
  return <GuardedStack group="setup" />;
}
