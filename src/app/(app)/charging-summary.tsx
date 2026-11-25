import { AppPlaceholderScreen } from '@/shared/components';

import { PLACEHOLDER_COPY } from '@/features/home';

export default function ChargingSummaryRoute() {
  return (
    <AppPlaceholderScreen title="Charging" description={PLACEHOLDER_COPY.chargingSummary} back />
  );
}
