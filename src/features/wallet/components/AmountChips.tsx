import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { formatPaise } from '@/shared/utils/money';

type AmountChipsProps = {
  amountsPaise: number[];
  selectedPaise: number;
  onPick: (amountPaise: number) => void;
};

// The brand's quick top-up amounts as equal pills in one row; the one matching the field is filled.
const AmountChips = ({ amountsPaise, selectedPaise, onPick }: AmountChipsProps) => {
  const t = useTheme();

  return (
    <View style={[styles.wrap, { gap: t.space[2] }]}>
      {amountsPaise.map(amount => {
        const selected = amount === selectedPaise;
        return (
          <AppPressable
            key={amount}
            onPress={() => onPick(amount)}
            haptic="selection"
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              flexBasis: 0,
              minWidth: 0,
              alignItems: 'center',
              paddingHorizontal: t.space[1],
              paddingVertical: t.space[2],
              borderRadius: t.radius.pill,
              borderWidth: t.layout.hairline,
              borderColor: selected ? t.colors.accent : t.colors.borderStrong,
              backgroundColor: selected ? t.colors.accentSoft : t.colors.surface,
            }}
          >
            <AppText
              variant="subhead"
              tabular
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                fontFamily: t.type.headline.fontFamily,
                color: selected ? t.colors.accentText : t.colors.textPrimary,
              }}
            >
              {formatPaise(amount)}
            </AppText>
          </AppPressable>
        );
      })}
    </View>
  );
};

export default AmountChips;

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
});
