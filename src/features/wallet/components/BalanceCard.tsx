import { StyleSheet, View } from 'react-native';

import { Eye, EyeOff, Plus } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import WalletArt from './WalletArt';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatPaise } from '@/shared/utils/money';

import { WALLET_COPY } from '../constants/wallet.constants';
import { useCountUp } from '../hooks/useCountUp';

type BalanceCardProps = {
  balancePaise: number;
  hidden: boolean;
  onToggleHidden: () => void;
  onAddMoney: () => void;
};

// A plain white card on the screen's brand wash: the animated wallet and the balance rolling up
// to its value. Theme surfaces only, so it is light in light mode and dark in dark mode. The eye
// hides the balance (not remembered, like the old app).
const BalanceCard = ({ balancePaise, hidden, onToggleHidden, onAddMoney }: BalanceCardProps) => {
  const t = useTheme();
  const shown = useCountUp(balancePaise);
  const ink = t.colors.textPrimary;
  const soft = t.colors.textSecondary;
  const EyeIcon = hidden ? Eye : EyeOff;

  return (
    <View
      style={[
        styles.card,
        {
          gap: t.space[4],
          padding: t.space[4],
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={[styles.grow, { gap: t.space[1] }]}>
          <View style={[styles.row, { gap: t.space[2] }]}>
            <AppText variant="caption" style={{ color: soft }}>
              {WALLET_COPY.balance}
            </AppText>
            <AppPressable
              onPress={onToggleHidden}
              haptic="light"
              feedback="opacity"
              hitSlop={t.space[3]}
              accessibilityRole="button"
              accessibilityLabel={hidden ? WALLET_COPY.showBalance : WALLET_COPY.hideBalance}
            >
              <EyeIcon color={soft} size={t.icon.meta} strokeWidth={t.icon.stroke} />
            </AppPressable>
          </View>
          <AppText
            variant="title1"
            tabular
            numberOfLines={1}
            adjustsFontSizeToFit
            accessibilityLabel={`${WALLET_COPY.balance} ${hidden ? WALLET_COPY.hidden : formatPaise(balancePaise)}`}
            style={{ color: ink }}
          >
            {hidden ? `${brand.currency.symbol} ${WALLET_COPY.hidden}` : formatPaise(shown)}
          </AppText>
        </View>
        <WalletArt size={t.space[12] + t.space[8]} />
      </View>

      <AppPressable
        onPress={onAddMoney}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={WALLET_COPY.addMoney}
        style={[
          styles.row,
          styles.center,
          {
            gap: t.space[2],
            height: t.layout.minTouch,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.accent,
          },
        ]}
      >
        <Plus color={t.colors.onAccent} size={t.icon.meta} strokeWidth={t.icon.stroke + 0.5} />
        <AppText
          variant="subhead"
          style={{ color: t.colors.onAccent, fontFamily: t.type.headline.fontFamily }}
        >
          {WALLET_COPY.addMoney}
        </AppText>
      </AppPressable>
    </View>
  );
};

export default BalanceCard;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
