import { AppPlaceholderScreen } from '@/shared/components';

import { PLACEHOLDER_COPY } from '@/features/home';

export default function ScanRoute() {
  return <AppPlaceholderScreen title="Scan" description={PLACEHOLDER_COPY.scan} back />;
}
