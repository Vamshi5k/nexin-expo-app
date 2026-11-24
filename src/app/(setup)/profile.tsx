import { SignedInPlaceholderScreen } from '@/features/auth';

/** TEMPORARY: the real ProfileSetup screen comes in the setup phase. */
export default function SetupProfileRoute() {
  return (
    <SignedInPlaceholderScreen
      title="Profile setup"
      description="First-time users finish their profile here. This screen arrives in a later phase."
    />
  );
}
