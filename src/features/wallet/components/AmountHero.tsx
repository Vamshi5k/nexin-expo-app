import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/shared/components';

import AmountChips from './AmountChips';

import { useTheme, withAlpha } from '@/shared/theme';

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

// The wallet's dark card again: current balance on top, the amount large in the middle with an
// accent underline (red with the reason when it's not valid), quick amounts as glass pills.
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
  const ink = t.colors.surface;
  const soft = withAlpha(t.colors.surface, 0.65);

  return (
    <View
      style={[
        styles.card,
        {
          gap: t.space[4],
          padding: t.space[5],
          borderRadius: t.radius.sheet,
          backgroundColor: t.colors.textPrimary,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: t.space[12] * 5,
            height: t.space[12] * 5,
            borderRadius: t.radius.pill,
            backgroundColor: withAlpha(t.colors.accent, 0.16),
          },
        ]}
      />

      <View style={[styles.row, styles.between]}>
        <AppText variant="caption" style={{ color: soft }}>
          {ADD_MONEY_COPY.enterAmount}
        </AppText>
        <View
          style={[
            styles.row,
            {
              gap: t.space[1],
              paddingHorizontal: t.space[3],
              paddingVertical: t.space[1],
              borderRadius: t.radius.pill,
              backgroundColor: withAlpha(t.colors.surface, 0.1),
            },
          ]}
        >
          <AppText variant="caption" style={{ color: soft }}>
            {ADD_MONEY_COPY.currentBalance}
          </AppText>
          <AppText
            variant="caption"
            tabular
            style={{ color: ink, fontFamily: t.type.headline.fontFamily }}
          >
            {formatPaise(balancePaise)}
          </AppText>
        </View>
      </View>

      <View style={[styles.row, styles.center, { gap: t.space[2], paddingVertical: t.space[2] }]}>
        <AppText variant="title1" style={{ color: amountText ? ink : soft }}>
          {brand.currency.symbol}
        </AppText>
        <TextInput
          value={amountText}
          onChangeText={onChange}
          placeholder="0"
          placeholderTextColor={soft}
          keyboardType="decimal-pad"
          returnKeyType="done"
          selectionColor={t.colors.accent}
          accessibilityLabel={ADD_MONEY_COPY.placeholder}
          maxFontSizeMultiplier={t.layout.maxFontScale}
          style={[
            t.type.display,
            t.tabularNums,
            styles.input,
            { lineHeight: undefined, color: ink },
          ]}
        />
      </View>

      <View style={{ gap: t.space[2] }}>
        <View
          style={{
            height: 2,
            borderRadius: 1,
            backgroundColor: error ? t.colors.danger : t.colors.accent,
            opacity: amountPaise || error ? 1 : 0.4,
          }}
        />
        <AppText variant="caption" align="center" style={{ color: error ? t.colors.danger : soft }}>
          {error ?? ADD_MONEY_COPY.amountMin(formatPaise(minPaise))}
        </AppText>
      </View>

      <AmountChips
        amountsPaise={quickAmountsPaise}
        selectedPaise={amountPaise}
        onPick={onPick}
        inverse
      />
    </View>
  );
};

export default AmountHero;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '-55%',
    right: '-35%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
  },
  input: {
    minWidth: 32,
    paddingVertical: 0,
  },
});
