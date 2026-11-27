import { Fragment } from 'react';
import { View } from 'react-native';

import Animated from 'react-native-reanimated';

import { AppSkeleton } from '@/shared/components';

import TransactionRow from './TransactionRow';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import type { WalletTransaction } from '../types/wallet.types';

type TransactionListProps = {
  transactions: WalletTransaction[];
  stagger?: number;
};

type TransactionSkeletonProps = {
  rows: number;
};

// Rows on one white card with hairlines between them; they rise in one after another.
const TransactionList = ({ transactions, stagger = 0 }: TransactionListProps) => {
  const t = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: t.space[4],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      {transactions.map((tx, index) => (
        <Fragment key={tx.id}>
          {index > 0 ? (
            <View style={{ height: t.layout.hairline, backgroundColor: t.colors.border }} />
          ) : null}
          <Animated.View entering={riseIn(stagger + Math.min(index, 6))}>
            <TransactionRow transaction={tx} />
          </Animated.View>
        </Fragment>
      ))}
    </View>
  );
};

export const TransactionSkeleton = ({ rows }: TransactionSkeletonProps) => {
  const t = useTheme();

  return (
    <View
      testID="transactions-loading"
      style={{
        gap: t.space[4],
        padding: t.space[4],
        borderRadius: t.radius.card,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}>
          <AppSkeleton width={t.space[10]} height={t.space[10]} radius={t.radius.control} />
          <View style={{ flex: 1, gap: t.space[2] }}>
            <AppSkeleton width="60%" height={t.space[3]} />
            <AppSkeleton width="35%" height={t.space[3]} />
          </View>
          <AppSkeleton width={t.space[12]} height={t.space[3]} />
        </View>
      ))}
    </View>
  );
};

export default TransactionList;
