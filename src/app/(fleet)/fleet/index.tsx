import { SignedInPlaceholderScreen } from '@/features/auth';

export default function FleetHomeRoute() {
  return (
    <SignedInPlaceholderScreen
      title="Fleet"
      description="Your assigned vehicle and running session will show here."
    />
  );
}
