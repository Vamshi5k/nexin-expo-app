import { StyleSheet, View } from 'react-native';

import { ArrowDownLeft, PlugZap } from 'lucide-react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import type { WalletTransaction } from '../types/wallet.types';
import { signedAmount, transactionDate, transactionTitle } from '../utils/transactions';

type TransactionRowProps = {
  transaction: WalletTransaction;
};

// One wallet movement: a tinted icon tile (money in, or a charge), title and date, and the
// signed amount in green or red.
const TransactionRow = ({ transaction }: TransactionRowProps) => {
  const t = useTheme();
  const credit = transaction.type === 'credit';
  const Icon = credit ? ArrowDownLeft : PlugZap;
  const title = transactionTitle(transaction);
  const amount = signedAmount(transaction);
  const date = transactionDate(transaction.createdAt);

  return (
    <View
      accessible
      accessibilityLabel={`${title}, ${amount}${date ? `, ${date}` : ''}`}
      style={[styles.row, { gap: t.space[3], paddingVertical: t.space[3] }]}
    >
      <View
        style={[
          styles.center,
          {
            width: t.space[10],
            height: t.space[10],
            borderRadius: t.radius.control,
            backgroundColor: credit ? t.colors.successSoft : t.colors.dangerSoft,
          },
        ]}
      >
        <Icon
          color={credit ? t.colors.successText : t.colors.dangerText}
          size={t.icon.meta}
          strokeWidth={t.icon.stroke}
        />
      </View>
      <View style={styles.grow}>
        <AppText
          variant="subhead"
          numberOfLines={1}
          style={{ fontFamily: t.type.headline.fontFamily }}
        >
          {title}
        </AppText>
        {date ? (
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {date}
          </AppText>
        ) : null}
      </View>
      <AppText
        variant="subhead"
        tabular
        style={{
          fontFamily: t.type.headline.fontFamily,
          color: credit ? t.colors.successText : t.colors.dangerText,
        }}
      >
        {amount}
      </AppText>
    </View>
  );
};

export default TransactionRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
