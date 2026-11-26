import { StyleSheet, TextInput, View } from 'react-native';

import { Wallet } from 'lucide-react-native';

import { AppText } from '@/shared/components';

import AmountChips from './AmountChips';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatPaise } from '@/shared/utils/money';

import { ADD_MONEY_COPY } from '../constants/wallet.constants';

type AmountHeroProps = {
  amountText: string;
  amountPaise: number;
  balancePaise: number;
  error: string | null;
  minPaise: number;
  quickAmountsPaise: number[];
  onChange: (text: string) => void;
  onPick: (amountPaise: number) => void;
};

// A clean white card: the label with the current balance, the amount large and left-aligned
// with its symbol, a thin line (accent once typed, red with the reason when not valid), the
// hint, then the quick amounts.
const AmountHero = ({
  amountText,
  amountPaise,
  balancePaise,
  error,
  minPaise,
  quickAmountsPaise,
  onChange,
  onPick,
}: AmountHeroProps) => {
  const t = useTheme();
  const typed = amountText.length > 0;
  const line = error ? t.colors.danger : typed ? t.colors.accent : t.colors.border;

  return (
    <View
      style={{
        gap: t.space[4],
        padding: t.space[4],
        borderRadius: t.radius.sheet,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <View style={[styles.row, styles.between, { gap: t.space[3] }]}>
        <AppText variant="caption" tone="secondary" style={styles.overline}>
          {ADD_MONEY_COPY.enterAmount}
        </AppText>
        <View
          accessible
          accessibilityLabel={`${ADD_MONEY_COPY.currentBalance} ${formatPaise(balancePaise)}`}
          style={[styles.row, { gap: t.space[1] + t.space[1] / 2 }]}
        >
          <Wallet color={t.colors.textTertiary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
          <AppText variant="caption" tone="secondary" tabular>
            {formatPaise(balancePaise)}
          </AppText>
        </View>
      </View>

      <View style={{ gap: t.space[2] }}>
        <View style={[styles.row, { gap: t.space[1] }]}>
          <AppText variant="display" tone={typed ? 'primary' : 'tertiary'}>
            {brand.currency.symbol}
          </AppText>
          <TextInput
            value={amountText}
            onChangeText={onChange}
            placeholder="0"
            placeholderTextColor={t.colors.textTertiary}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectionColor={t.colors.accent}
            accessibilityLabel={ADD_MONEY_COPY.placeholder}
            maxFontSizeMultiplier={t.layout.maxFontScale}
            style={[
              t.type.display,
              t.tabularNums,
              styles.input,
              { lineHeight: undefined, color: t.colors.textPrimary },
            ]}
          />
        </View>
        <View style={{ height: 1.5, borderRadius: 1, backgroundColor: line }} />
        <AppText
          variant="caption"
          style={{ color: error ? t.colors.dangerText : t.colors.textSecondary }}
        >
          {error ?? ADD_MONEY_COPY.amountMin(formatPaise(minPaise))}
        </AppText>
      </View>

      <AmountChips amountsPaise={quickAmountsPaise} selectedPaise={amountPaise} onPick={onPick} />
    </View>
  );
};

export default AmountHero;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
