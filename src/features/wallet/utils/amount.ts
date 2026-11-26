import { z } from 'zod';

import { brand } from '@/core/config';
import { formatPaise, rupeesToPaise } from '@/shared/utils/money';

import { ADD_MONEY_COPY } from '../constants/wallet.constants';
import type { Coupon } from '../types/wallet.types';

export const MIN_TOP_UP_PAISE = rupeesToPaise(brand.minTopUpRupees);

// Digits and at most two decimals, the way people type money.
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export const amountSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, ADD_MONEY_COPY.amountRequired)
    .regex(AMOUNT_PATTERN, ADD_MONEY_COPY.amountInvalid)
    .refine(value => rupeesToPaise(value) >= MIN_TOP_UP_PAISE, {
      message: ADD_MONEY_COPY.amountMin(formatPaise(MIN_TOP_UP_PAISE)),
    }),
});

// Keeps what the field accepts to digits and one dot with two decimals.
export function cleanAmountInput(text: string): string {
  const digits = text.replace(/[^\d.]/g, '');
  const [whole = '', ...rest] = digits.split('.');
  if (!rest.length) return whole;
  return `${whole}.${rest.join('').slice(0, 2)}`;
}

export const amountToPaise = (text: string) =>
  AMOUNT_PATTERN.test(text.trim()) ? rupeesToPaise(text.trim()) : 0;

export const isCouponEligible = (coupon: Coupon, amountPaise: number) =>
  amountPaise >= coupon.minAmountPaise;

// Cashback on top of the top-up, rounded to the paisa.
export const couponBonusPaise = (coupon: Coupon | null, amountPaise: number) =>
  coupon && isCouponEligible(coupon, amountPaise)
    ? Math.round((amountPaise * coupon.cashbackPercent) / 100)
    : 0;

export const totalCreditsPaise = (coupon: Coupon | null, amountPaise: number) =>
  amountPaise + couponBonusPaise(coupon, amountPaise);

export const quickAmountsPaise = brand.quickTopUpRupees.map(rupees => rupeesToPaise(rupees));
