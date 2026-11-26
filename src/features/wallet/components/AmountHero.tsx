import { StyleSheet, TextInput, View } from 'react-native';

import { AppFade, AppText } from '@/shared/components';

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

// The wallet's card again: current balance on top, the amount large in the middle with an
// accent underline (red with the reason when it's not valid), quick amounts as pills. Theme
// surfaces only, so it follows light and dark mode.
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
  const ink = t.colors.textPrimary;
  const soft = t.colors.textTertiary;

  return (
    <View
      style={[
        styles.card,
        {
          gap: t.space[4],
          padding: t.space[5],
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <AppFade id="amount-wash" color={t.colors.accent} from={0.12} to={0} top />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: t.space[12] * 5,
            height: t.space[12] * 5,
            borderRadius: t.radius.pill,
            backgroundColor: withAlpha(t.colors.accent, 0.07),
          },
        ]}
      />

      <View style={[styles.row, styles.between]}>
        <AppText variant="caption" tone="secondary">
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
              backgroundColor: t.colors.surfaceSunken,
            },
          ]}
        >
          <AppText variant="caption" tone="secondary">
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
        <AppText
          variant="caption"
          align="center"
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
