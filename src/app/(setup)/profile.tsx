import { SignedInPlaceholderScreen } from '@/features/auth';

export default function SetupProfileRoute() {
  return (
    <SignedInPlaceholderScreen
      title="Profile setup"
      description="First-time users finish their profile here. This screen arrives in a later phase."
    />
  );
}
