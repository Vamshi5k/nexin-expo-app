import { SignedInPlaceholderScreen } from '@/features/auth';

/** TEMPORARY: the fleet home comes in the fleet phase. */
export default function FleetHomeRoute() {
  return (
    <SignedInPlaceholderScreen
      title="Fleet"
      description="Your assigned vehicle and running session will show here."
    />
  );
}
