import { GuardedStack } from '@/features/auth';

/** Signed-out only. A signed-in session is sent to "/", which picks setup, home or fleet. */
export default function AuthLayout() {
  return <GuardedStack group="auth" />;
}
