import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Lock, TicketPercent } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import {
  AppButton,
  AppErrorState,
  AppBackButton,
  AppScreen,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import AmountHero from '../components/AmountHero';
import CouponCard from '../components/CouponCard';
import PaymentResultSheet from '../components/PaymentResultSheet';
import SecureStrip from '../components/SecureStrip';

import { useTheme } from '@/shared/theme';

import { formatPaise } from '@/shared/utils/money';
import { riseIn } from '@/shared/utils/motion';

import { ADD_MONEY_COPY, WALLET_HREF } from '../constants/wallet.constants';
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
        <View
          style={[
            styles.row,
            {
              gap: t.space[3],
              padding: t.space[3],
              borderRadius: t.radius.card,
              borderWidth: t.layout.hairline,
              borderStyle: 'dashed',
              borderColor: t.colors.borderStrong,
            },
          ]}
        >
          <View
            style={[
              styles.center,
              {
                width: t.space[10],
                height: t.space[10],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.accentSoft,
              },
            ]}
          >
            <TicketPercent
              color={t.colors.accentText}
              size={t.icon.control}
              strokeWidth={t.icon.stroke}
            />
          </View>
          <View style={styles.grow}>
            <AppText variant="subhead" style={{ fontFamily: t.type.headline.fontFamily }}>
              {ADD_MONEY_COPY.noCoupons}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {ADD_MONEY_COPY.noCouponsBody}
            </AppText>
          </View>
        </View>
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
        wash
        contentStyle={{ gap: t.space[5], paddingTop: t.space[2] }}
        footer={
          <AppButton
            label={payLabel}
            icon={Lock}
            onPress={money.submit}
            loading={money.busy}
            disabled={!money.valid}
          />
        }
      >
        <Animated.View entering={riseIn(0)} style={{ gap: t.space[4] }}>
          <View style={styles.row}>
            <AppBackButton fallbackHref={WALLET_HREF.tab} />
          </View>
          <View style={{ gap: t.space[1] / 2 }}>
            <AppText variant="title2" accessibilityRole="header">
              {ADD_MONEY_COPY.title}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {ADD_MONEY_COPY.subtitle}
            </AppText>
          </View>
        </Animated.View>

        <Animated.View entering={riseIn(1)}>
          <AmountHero
            amountText={money.amountText}
            amountPaise={money.amountPaise}
            balancePaise={money.balancePaise}
            error={showError ? (money.error ?? null) : null}
            minPaise={MIN_TOP_UP_PAISE}
            afterPaise={money.valid ? money.balancePaise + money.totalPaise : null}
            quickAmountsPaise={quickAmountsPaise}
            onChange={money.setAmount}
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
            <AppText
              variant="caption"
              tone="secondary"
              accessibilityRole="header"
              style={[styles.overline, { paddingHorizontal: t.space[1] }]}
            >
              {ADD_MONEY_COPY.coupons}
            </AppText>
            {coupons}
          </Animated.View>
        ) : null}
        <Animated.View entering={riseIn(4)}>
          <SecureStrip />
        </Animated.View>
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
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
