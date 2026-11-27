import { useLocalSearchParams } from 'expo-router';

import { InvoiceScreen } from '@/features/history';

export default function InvoiceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <InvoiceScreen id={String(id ?? '')} />;
}
