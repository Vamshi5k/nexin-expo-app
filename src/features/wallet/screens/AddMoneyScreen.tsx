import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { TicketPercent } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import {
  AppButton,
  AppEmptyState,
  AppErrorState,
  AppHeader,
  AppScreen,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import AmountChips from '../components/AmountChips';
import CouponCard from '../components/CouponCard';
import PaymentResultSheet from '../components/PaymentResultSheet';

import { useTheme, withAlpha } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatPaise } from '@/shared/utils/money';
import { riseIn } from '@/shared/utils/motion';

import { ADD_MONEY_COPY } from '../constants/wallet.constants';
import { useAddMoney } from '../hooks/useAddMoney';
import { isCouponEligible, MIN_TOP_UP_PAISE, quickAmountsPaise } from '../utils/amount';

type AddMoneyScreenProps = {
  initialAmount?: string;
};

type BreakdownRowProps = {
  label: string;
  value: string;
  badge?: string;
  strong?: boolean;
  tone?: 'primary' | 'success';
};

const BreakdownRow = ({ label, value, badge, strong, tone = 'primary' }: BreakdownRowProps) => {
  const t = useTheme();
  const valueStyle = { fontFamily: t.type.headline.fontFamily };

  return (
    <View style={[styles.row, { gap: t.space[2] }]}>
      <AppText variant={strong ? 'subhead' : 'caption'} tone={strong ? 'primary' : 'secondary'}>
        {label}
      </AppText>
      {badge ? (
        <View
          style={{
            paddingHorizontal: t.space[2],
            paddingVertical: t.space[1] / 2,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.accentSoft,
          }}
        >
          <AppText variant="caption" tone="accent">
            {badge}
          </AppText>
        </View>
      ) : null}
      <View style={styles.grow} />
      <AppText
        variant="subhead"
        tabular
        style={[valueStyle, tone === 'success' && { color: t.colors.successText }]}
      >
        {value}
      </AppText>
    </View>
  );
};

// Add Money (BLUEPRINT D3): a big amount field with quick amounts, the coupon breakdown and
// list when the brand has coupons, then Razorpay. Success, failure and "not confirmed" each get
// their own sheet.
const AddMoneyScreen = ({ initialAmount }: AddMoneyScreenProps) => {
  const t = useTheme();
  const money = useAddMoney(initialAmount);
  const showError = money.amountText.length > 0 && !!money.error;
  const payLabel =
    money.valid && money.amountPaise > 0
      ? ADD_MONEY_COPY.payAmount(formatPaise(money.amountPaise))
      : ADD_MONEY_COPY.pay;

  const coupons = (() => {
    if (!money.couponsOn) return null;
    if (money.couponsLoading) {
      return (
        <View style={{ gap: t.space[3] }}>
          <AppSkeleton height={t.space[12] * 2} radius={t.radius.card} />
          <AppSkeleton height={t.space[12] * 2} radius={t.radius.card} />
        </View>
      );
    }
    if (money.couponsFailed) {
      return (
        <AppErrorState
          message={ADD_MONEY_COPY.couponsError}
          onRetry={money.retryCoupons}
          retryLabel={ADD_MONEY_COPY.tryAgain}
        />
      );
    }
    if (!money.coupons.length) {
      return (
        <AppEmptyState
          icon={TicketPercent}
          title={ADD_MONEY_COPY.noCoupons}
          description={ADD_MONEY_COPY.noCouponsBody}
        />
      );
    }
    return (
      <View style={{ gap: t.space[3] }}>
        {money.coupons.map((coupon, index) => (
          <Animated.View key={coupon.id} entering={riseIn(3 + index)}>
            <CouponCard
              coupon={coupon}
              eligible={isCouponEligible(coupon, money.amountPaise)}
              applied={money.coupon?.id === coupon.id}
              onPress={money.toggleCoupon}
            />
          </Animated.View>
        ))}
      </View>
    );
  })();

  return (
    <>
      <AppScreen
        scroll
        contentStyle={{ gap: t.space[5], paddingTop: t.space[2] }}
        footer={
          <AppButton
            label={payLabel}
            onPress={money.submit}
            loading={money.busy}
            disabled={!money.valid}
          />
        }
      >
        <AppHeader title={ADD_MONEY_COPY.title} back />

        <Animated.View
          entering={riseIn(0)}
          style={[
            styles.center,
            {
              gap: t.space[3],
              padding: t.space[5],
              borderRadius: t.radius.sheet,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.border,
              backgroundColor: t.colors.surfaceRaised,
            },
          ]}
        >
          <AppText variant="caption" tone="secondary">
            {ADD_MONEY_COPY.enterAmount}
          </AppText>
          <View style={[styles.row, { gap: t.space[1] }]}>
            <AppText variant="title1" tone={money.amountText ? 'primary' : 'tertiary'}>
              {brand.currency.symbol}
            </AppText>
            <TextInput
              value={money.amountText}
              onChangeText={money.setAmount}
              placeholder="0"
              placeholderTextColor={t.colors.textTertiary}
              keyboardType="decimal-pad"
              returnKeyType="done"
              selectionColor={t.colors.accent}
              accessibilityLabel={ADD_MONEY_COPY.placeholder}
              maxFontSizeMultiplier={t.layout.maxFontScale}
              style={[
                t.type.title1,
                t.tabularNums,
                styles.amountInput,
                { lineHeight: undefined, color: t.colors.textPrimary },
              ]}
            />
          </View>
          <View
            style={{
              alignSelf: 'stretch',
              height: 2,
              borderRadius: 1,
              backgroundColor: showError ? t.colors.danger : withAlpha(t.colors.accent, 0.5),
            }}
          />
          <AppText
            variant="caption"
            align="center"
            style={{ color: showError ? t.colors.dangerText : t.colors.textSecondary }}
          >
            {showError ? money.error : ADD_MONEY_COPY.amountMin(formatPaise(MIN_TOP_UP_PAISE))}
          </AppText>
          <AmountChips
            amountsPaise={quickAmountsPaise}
            selectedPaise={money.amountPaise}
            onPick={amount => money.setAmount(String(amount / 100))}
          />
        </Animated.View>

        {money.coupon && money.bonusPaise > 0 ? (
          <Animated.View
            entering={FadeIn.duration(t.motion.duration)}
            exiting={FadeOut.duration(t.motion.durationFast)}
            style={{
              gap: t.space[3],
              padding: t.space[4],
              borderRadius: t.radius.card,
              backgroundColor: t.colors.surfaceRaised,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.border,
            }}
          >
            <AppText variant="headline">{ADD_MONEY_COPY.breakdown}</AppText>
            <BreakdownRow label={ADD_MONEY_COPY.amount} value={formatPaise(money.amountPaise)} />
            <BreakdownRow
              label={ADD_MONEY_COPY.couponDiscount}
              badge={ADD_MONEY_COPY.couponBadge(money.coupon.code, money.coupon.cashbackPercent)}
              value={`+${formatPaise(money.bonusPaise)}`}
              tone="success"
            />
            <View style={{ height: t.layout.hairline, backgroundColor: t.colors.border }} />
            <BreakdownRow
              label={ADD_MONEY_COPY.totalCredits}
              value={formatPaise(money.totalPaise)}
              strong
            />
          </Animated.View>
        ) : null}

        {money.couponsOn ? (
          <Animated.View entering={riseIn(2)} style={{ gap: t.space[3] }}>
            <AppText variant="headline" accessibilityRole="header">
              {ADD_MONEY_COPY.coupons}
            </AppText>
            {coupons}
          </Animated.View>
        ) : null}
      </AppScreen>

      {money.step === 'ordering' || money.step === 'verifying' ? (
        <Animated.View
          entering={FadeIn.duration(t.motion.durationFast)}
          exiting={FadeOut.duration(t.motion.durationFast)}
          style={[
            StyleSheet.absoluteFill,
            styles.center,
            { gap: t.space[3], backgroundColor: t.colors.overlay },
          ]}
          accessibilityLiveRegion="polite"
        >
          <View
            style={[
              styles.center,
              {
                gap: t.space[3],
                padding: t.space[6],
                borderRadius: t.radius.sheet,
                backgroundColor: t.colors.surfaceRaised,
              },
            ]}
          >
            <ActivityIndicator color={t.colors.accentText} />
            <AppText variant="subhead">{ADD_MONEY_COPY.processing}</AppText>
          </View>
        </Animated.View>
      ) : null}

      <PaymentResultSheet
        outcome={money.outcome}
        onClose={money.closeOutcome}
        onRetry={money.retry}
      />
    </>
  );
};

export default AddMoneyScreen;

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
  amountInput: {
    minWidth: 24,
    paddingVertical: 0,
  },
});
