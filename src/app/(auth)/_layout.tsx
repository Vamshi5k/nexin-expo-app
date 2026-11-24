import { GuardedStack } from '@/features/auth';

export default function AuthLayout() {
  return <GuardedStack group="auth" />;
}
