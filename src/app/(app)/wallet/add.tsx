import { useLocalSearchParams } from 'expo-router';

import { AddMoneyScreen } from '@/features/wallet';

export default function AddMoneyRoute() {
  const { amount } = useLocalSearchParams<{ amount?: string; source?: string }>();
  return <AddMoneyScreen initialAmount={amount} />;
}
