import { StyleSheet, View } from 'react-native';

import { ArrowRight } from 'lucide-react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { formatPaise } from '@/shared/utils/money';

import { ADD_MONEY_COPY } from '../constants/wallet.constants';

type BalancePreviewProps = {
  balancePaise: number;
  creditsPaise: number;
};

// "Now → After": what the wallet will hold once this top-up (and any cashback) lands.
const BalancePreview = ({ balancePaise, creditsPaise }: BalancePreviewProps) => {
  const t = useTheme();
  const after = balancePaise + creditsPaise;

  const column = (label: string, value: string, highlight?: boolean) => (
    <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText
        variant="subhead"
        tabular
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          fontFamily: t.type.headline.fontFamily,
          color: highlight ? t.colors.successText : t.colors.textPrimary,
        }}
      >
        {value}
      </AppText>
    </View>
  );

  return (
    <View
      accessible
      accessibilityLabel={`${ADD_MONEY_COPY.afterTopUp}: ${formatPaise(after)}`}
      style={{
        gap: t.space[3],
        padding: t.space[4],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <AppText variant="subhead" style={{ fontFamily: t.type.headline.fontFamily }}>
        {ADD_MONEY_COPY.afterTopUp}
      </AppText>
      <View style={[styles.row, { gap: t.space[3] }]}>
        {column(ADD_MONEY_COPY.now, formatPaise(balancePaise))}
        <View
          style={[
            styles.center,
            {
              width: t.space[8],
              height: t.space[8],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <ArrowRight color={t.colors.accentText} size={t.icon.meta} strokeWidth={t.icon.stroke} />
        </View>
        {column(ADD_MONEY_COPY.after, formatPaise(after), true)}
      </View>
    </View>
  );
};

export default BalancePreview;

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
