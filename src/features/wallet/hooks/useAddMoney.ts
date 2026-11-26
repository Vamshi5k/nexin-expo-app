import { useState } from 'react';
import { Keyboard } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { useAuth } from '@/features/auth';
import { useClientConfig } from '@/features/client-config';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';
import { isPaymentError, openCheckout } from '@/core/payments';
import { useRequest } from '@/core/request';
import { formatPaise } from '@/shared/utils/money';
import { toast } from '@/shared/utils/toast';

import { walletApi } from '../api/wallet.api';
import { ADD_MONEY_COPY } from '../constants/wallet.constants';
import type { AddMoneyForm, Coupon, PaymentOrder, PaymentOutcome } from '../types/wallet.types';
import {
  amountSchema,
  amountToPaise,
  cleanAmountInput,
  couponBonusPaise,
  isCouponEligible,
  totalCreditsPaise,
} from '../utils/amount';

type Step = 'idle' | 'ordering' | 'paying' | 'verifying';

const noCoupons = () => Promise.resolve<Coupon[]>([]);

// Add Money (BLUEPRINT D3): amount and coupon, then create the order, open Razorpay, verify the
// signed payment and refresh the balance. A failed or cancelled checkout can retry the same order;
// a payment that went through but didn't verify must not be paid again.
export const useAddMoney = (initialAmount?: string) => {
  const t = useTheme();
  const { user, loadUser } = useAuth();
  const config = useClientConfig();
  const couponsOn = config.features.coupons;

  const form = useForm<AddMoneyForm>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: cleanAmountInput(initialAmount ?? '') },
    mode: 'onChange',
  });
  const amountText = useWatch({ control: form.control, name: 'amount' });
  const amountPaise = amountToPaise(amountText);
  const valid = amountSchema.safeParse({ amount: amountText }).success;

  const coupons = useRequest(couponsOn ? walletApi.getCoupons : noCoupons, {
    enabled: couponsOn,
  });
  const [couponId, setCouponId] = useState<string | null>(null);
  const coupon = coupons.data?.find(item => item.id === couponId) ?? null;

  const [step, setStep] = useState<Step>('idle');
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [outcome, setOutcome] = useState<PaymentOutcome | null>(null);
  const busy = step !== 'idle';

  const setAmount = (text: string) =>
    form.setValue('amount', cleanAmountInput(text), { shouldValidate: true, shouldDirty: true });

  const toggleCoupon = (next: Coupon) => {
    if (couponId === next.id) {
      setCouponId(null);
      return;
    }
    if (!isCouponEligible(next, amountPaise)) {
      toast.info(ADD_MONEY_COPY.couponMin(formatPaise(next.minAmountPaise)));
      return;
    }
    setCouponId(next.id);
  };

  const checkout = async (paymentOrder: PaymentOrder, credits: number) => {
    setStep('paying');
    let payment;
    try {
      payment = await openCheckout({
        keyId: paymentOrder.keyId,
        orderId: paymentOrder.orderId,
        amountPaise: paymentOrder.amountPaise,
        currency: paymentOrder.currency,
        name: paymentOrder.companyName ?? config.brandName,
        description: ADD_MONEY_COPY.description,
        color: t.colors.accent,
        prefill: {
          name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || undefined,
          email: user?.email ?? undefined,
          contact: user?.phone ?? undefined,
        },
      });
    } catch (error) {
      setStep('idle');
      if (isPaymentError(error) && error.kind === 'unavailable') {
        toast.error(ADD_MONEY_COPY.needsRebuild);
        return;
      }
      setOutcome({ kind: 'failed', message: ADD_MONEY_COPY.failedBody });
      return;
    }

    setStep('verifying');
    try {
      await walletApi.verifyPayment(payment);
      await loadUser().catch(() => undefined);
      setOutcome({ kind: 'success', creditedPaise: credits, orderId: paymentOrder.orderId });
    } catch {
      setOutcome({ kind: 'unconfirmed', orderId: paymentOrder.orderId });
    } finally {
      setStep('idle');
    }
  };

  const submit = form.handleSubmit(async () => {
    if (busy) return;
    Keyboard.dismiss();

    if (coupon && !isCouponEligible(coupon, amountPaise)) {
      toast.info(ADD_MONEY_COPY.couponMin(formatPaise(coupon.minAmountPaise)));
      return;
    }

    setStep('ordering');
    let created: PaymentOrder;
    try {
      created = await walletApi.createOrder(amountPaise, coupon?.id ?? null);
    } catch (error) {
      setStep('idle');
      toast.error(getErrorMessage(error));
      return;
    }

    setOrder(created);
    await checkout(created, totalCreditsPaise(coupon, amountPaise));
  });

  // "Try Again" after a failed or cancelled checkout reuses the same order.
  const retry = () => {
    if (!order || busy) return;
    setOutcome(null);
    void checkout(order, totalCreditsPaise(coupon, amountPaise));
  };

  const closeOutcome = () => {
    const done = outcome?.kind === 'success' || outcome?.kind === 'unconfirmed';
    setOutcome(null);
    if (done && router.canGoBack()) router.back();
  };

  return {
    control: form.control,
    amountText,
    amountPaise,
    valid,
    error: form.formState.errors.amount?.message,
    setAmount,
    couponsOn,
    coupons: coupons.data ?? [],
    couponsLoading: couponsOn && coupons.loading && coupons.data === undefined,
    couponsFailed: couponsOn && !!coupons.error && coupons.data === undefined,
    retryCoupons: () => void coupons.refetch(),
    coupon,
    bonusPaise: couponBonusPaise(coupon, amountPaise),
    totalPaise: totalCreditsPaise(coupon, amountPaise),
    balancePaise: user?.walletBalancePaise ?? 0,
    toggleCoupon,
    busy,
    step,
    submit: () => void submit(),
    outcome,
    retry,
    closeOutcome,
  };
};
