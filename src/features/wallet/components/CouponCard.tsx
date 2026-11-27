import { StyleSheet, View } from 'react-native';

import { Check, TicketPercent, X } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { ADD_MONEY_COPY } from '../constants/wallet.constants';
import type { Coupon } from '../types/wallet.types';

type CouponCardProps = {
  coupon: Coupon;
  eligible: boolean;
  applied: boolean;
  onPress: (coupon: Coupon) => void;
};

// A ticket: the cashback on the left, a dashed tear line with notches, the code and terms on
// the right. Applied coupons take the accent border.
const CouponCard = ({ coupon, eligible, applied, onPress }: CouponCardProps) => {
  const t = useTheme();
  const notch = t.space[3];
  const description = coupon.description ?? ADD_MONEY_COPY.couponFallback(coupon.cashbackPercent);
  const StatusIcon = eligible ? Check : X;

  return (
    <AppPressable
      onPress={() => onPress(coupon)}
      haptic="selection"
      accessibilityRole="button"
      accessibilityState={{ selected: applied, disabled: !eligible }}
      accessibilityLabel={`${coupon.code}, ${description}, ${eligible ? ADD_MONEY_COPY.eligible : ADD_MONEY_COPY.notEligible}`}
      style={[
        styles.row,
        {
          borderRadius: t.radius.card,
          borderWidth: applied ? 1.5 : t.layout.hairline,
          borderColor: applied ? t.colors.accent : t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
          opacity: eligible || applied ? 1 : 0.7,
        },
      ]}
    >
      <View
        style={[
          styles.center,
          {
            width: t.space[12] + t.space[6],
            alignSelf: 'stretch',
            gap: t.space[1],
            backgroundColor: applied ? t.colors.accentSoft : t.colors.surfaceSunken,
            borderTopLeftRadius: t.radius.card,
            borderBottomLeftRadius: t.radius.card,
          },
        ]}
      >
        <TicketPercent
          color={t.colors.accentText}
          size={t.icon.control}
          strokeWidth={t.icon.stroke}
        />
        <AppText
          variant="subhead"
          tabular
          style={{ fontFamily: t.type.headline.fontFamily, color: t.colors.accentText }}
        >
          {`${coupon.cashbackPercent}%`}
        </AppText>
      </View>

      <View style={[styles.tear, { borderColor: t.colors.borderStrong }]}>
        <View
          style={[
            styles.notch,
            {
              top: -notch / 2,
              width: notch,
              height: notch,
              borderRadius: notch,
              backgroundColor: t.colors.bg,
              left: -notch / 2,
            },
          ]}
        />
        <View
          style={[
            styles.notch,
            {
              bottom: -notch / 2,
              width: notch,
              height: notch,
              borderRadius: notch,
              backgroundColor: t.colors.bg,
              left: -notch / 2,
            },
          ]}
        />
      </View>

      <View style={[styles.grow, { gap: t.space[1], padding: t.space[3] }]}>
        <View style={[styles.row, { gap: t.space[2] }]}>
          <AppText
            variant="subhead"
            style={[styles.grow, { fontFamily: t.type.headline.fontFamily }]}
            numberOfLines={1}
          >
            {coupon.code}
          </AppText>
          <View
            style={[
              styles.row,
              {
                gap: t.space[1],
                paddingHorizontal: t.space[2],
                paddingVertical: t.space[1] / 2,
                borderRadius: t.radius.pill,
                backgroundColor: eligible ? t.colors.successSoft : t.colors.dangerSoft,
              },
            ]}
          >
            <StatusIcon
              color={eligible ? t.colors.successText : t.colors.dangerText}
              size={t.space[3]}
              strokeWidth={t.icon.stroke + 0.5}
            />
            <AppText
              variant="caption"
              style={{ color: eligible ? t.colors.successText : t.colors.dangerText }}
            >
              {eligible ? ADD_MONEY_COPY.eligible : ADD_MONEY_COPY.notEligible}
            </AppText>
          </View>
        </View>
        <AppText variant="caption" tone="secondary" numberOfLines={2}>
          {description}
        </AppText>
        <AppText
          variant="caption"
          style={{
            color: applied ? t.colors.accentText : t.colors.textTertiary,
            fontFamily: t.type.headline.fontFamily,
          }}
        >
          {applied ? ADD_MONEY_COPY.applied : ADD_MONEY_COPY.apply}
        </AppText>
      </View>
    </AppPressable>
  );
};

export default CouponCard;

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
  tear: {
    alignSelf: 'stretch',
    width: 0,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
  },
  notch: {
    position: 'absolute',
  },
});
