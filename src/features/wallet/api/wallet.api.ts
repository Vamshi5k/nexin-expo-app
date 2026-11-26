import { api, toPage, unwrap, type Envelope, type Page } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';
import type { CheckoutSuccess } from '@/core/payments';
import { rupeesToPaise } from '@/shared/utils/money';

import type {
  Coupon,
  CouponDto,
  PaymentOrder,
  PaymentOrderDto,
  WalletTransaction,
  WalletTransactionDto,
} from '../types/wallet.types';

const text = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

const num = (v: number | string | null | undefined): number => {
  const n = typeof v === 'string' ? Number(v) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

// The API spells debits several ways; anything that isn't 'Credit' moved money out.
export const toTransaction = (dto: WalletTransactionDto, index: number): WalletTransaction => {
  const credit = (dto.type ?? '').trim().toLowerCase() === 'credit';
  const refNo = text(dto.refNo);

  return {
    id: String(dto.id ?? refNo ?? `${dto.createdAt ?? 'row'}-${index}`),
    refNo,
    type: credit ? 'credit' : 'debit',
    amountPaise: Math.abs(rupeesToPaise(dto.amount)),
    createdAt: text(dto.createdAt),
    stationName: text(dto.charger?.station?.name),
  };
};

export const toCoupon = (dto: CouponDto): Coupon | null => {
  const code = text(dto.code);
  if (dto.id === null || dto.id === undefined || !code) return null;

  return {
    id: String(dto.id),
    code,
    description: text(dto.description),
    cashbackPercent: num(dto.cashbackPercent),
    minAmountPaise: rupeesToPaise(dto.amount),
    endsAt: text(dto.endDate),
  };
};

// Only ACTIVE coupons can be applied (BLUEPRINT D3).
export const toActiveCoupons = (dtos: CouponDto[]): Coupon[] =>
  dtos
    .filter(dto => (dto.status ?? '').trim().toUpperCase() === 'ACTIVE')
    .map(toCoupon)
    .filter((coupon): coupon is Coupon => coupon !== null);

export const toPaymentOrder = (dto: PaymentOrderDto): PaymentOrder => {
  const keyId = text(dto.keyId);
  const orderId = text(dto.orderId);
  if (!keyId || !orderId) throw new Error('The payment order is missing its key or order id.');

  return {
    keyId,
    orderId,
    // Razorpay's order amount is already in paise.
    amountPaise: Math.round(num(dto.amount)),
    currency: text(dto.currency) ?? 'INR',
    companyName: text(dto.companyName),
  };
};

export const walletApi = {
  getTransactions: async (page: number, limit: number): Promise<Page<WalletTransaction>> => {
    const res = await api.get<Envelope<WalletTransactionDto[] | null>>(
      ENDPOINTS.WALLET.TRANSACTIONS,
      { params: { page, limit } },
    );
    const raw = toPage(res);
    return { ...raw, items: raw.items.map(toTransaction) };
  },

  getCoupons: async (): Promise<Coupon[]> => {
    const res = await api.get<Envelope<CouponDto[] | null>>(ENDPOINTS.WALLET.COUPONS);
    return toActiveCoupons(unwrap(res) ?? []);
  },

  // The API takes the top-up in rupees.
  createOrder: async (amountPaise: number, couponId: string | null): Promise<PaymentOrder> => {
    const res = await api.post<Envelope<PaymentOrderDto>>(ENDPOINTS.WALLET.ORDER, {
      amount: amountPaise / 100,
      couponId,
    });
    return toPaymentOrder(unwrap(res));
  },

  verifyPayment: async (payment: CheckoutSuccess): Promise<void> => {
    await api.post(ENDPOINTS.WALLET.VERIFY, {
      razorpay_payment_id: payment.paymentId,
      razorpay_order_id: payment.orderId,
      razorpay_signature: payment.signature,
    });
  },
};
