import { brand } from '@/core/config';
import { toActiveCoupons, toPaymentOrder, toTransaction } from '@/features/wallet/api/wallet.api';
import type { Coupon, WalletTransaction } from '@/features/wallet/types/wallet.types';
import {
  amountSchema,
  amountToPaise,
  cleanAmountInput,
  couponBonusPaise,
  isCouponEligible,
  MIN_TOP_UP_PAISE,
  totalCreditsPaise,
} from '@/features/wallet/utils/amount';
import {
  filterTransactions,
  groupByMonth,
  signedAmount,
  transactionTitle,
} from '@/features/wallet/utils/transactions';

const tx = (overrides: Partial<WalletTransaction> = {}): WalletTransaction => ({
  id: '1',
  refNo: 'R1',
  type: 'credit',
  amountPaise: 50000,
  createdAt: '2026-11-12T10:00:00.000Z',
  stationName: null,
  ...overrides,
});

const coupon: Coupon = {
  id: 'c1',
  code: 'BONUS10',
  description: null,
  cashbackPercent: 10,
  minAmountPaise: 50000,
  endsAt: null,
};

describe('wallet mappers', () => {
  it('a Credit row is money in; anything else is a charge, always a positive amount', () => {
    expect(toTransaction({ refNo: 'R1', type: 'Credit', amount: 500 }, 0)).toMatchObject({
      id: 'R1',
      type: 'credit',
      amountPaise: 50000,
    });
    expect(
      toTransaction(
        { id: 4, type: 'Debit', amount: '-120.5', charger: { station: { name: 'Hub' } } },
        1,
      ),
    ).toMatchObject({ id: '4', type: 'debit', amountPaise: 12050, stationName: 'Hub' });
  });

  it('only ACTIVE coupons with an id and a code are kept', () => {
    const coupons = toActiveCoupons([
      { id: 1, code: 'A', status: 'ACTIVE', cashbackPercent: '5', amount: 200 },
      { id: 2, code: 'B', status: 'EXPIRED' },
      { id: 3, code: ' ', status: 'ACTIVE' },
    ]);
    expect(coupons).toEqual([
      expect.objectContaining({ id: '1', code: 'A', cashbackPercent: 5, minAmountPaise: 20000 }),
    ]);
  });

  it('a payment order without its key or order id is refused', () => {
    expect(() => toPaymentOrder({ orderId: 'o' })).toThrow();
    expect(toPaymentOrder({ keyId: 'k', orderId: 'o', amount: 50000 })).toMatchObject({
      amountPaise: 50000,
      currency: 'INR',
    });
  });
});

describe('amount rules', () => {
  it('the minimum comes from the brand config', () => {
    expect(MIN_TOP_UP_PAISE).toBe(brand.minTopUpRupees * 100);
    const min = String(brand.minTopUpRupees);
    expect(amountSchema.safeParse({ amount: min }).success).toBe(true);
    expect(amountSchema.safeParse({ amount: String(brand.minTopUpRupees - 1) }).success).toBe(
      false,
    );
  });

  it('empty, letters and three decimals are invalid', () => {
    expect(amountSchema.safeParse({ amount: '' }).success).toBe(false);
    expect(amountSchema.safeParse({ amount: 'abc' }).success).toBe(false);
    expect(amountSchema.safeParse({ amount: '500.123' }).success).toBe(false);
  });

  it('typing is cleaned to digits and two decimals', () => {
    expect(cleanAmountInput('₹1,2a3.456')).toBe('123.45');
    expect(cleanAmountInput('5..0')).toBe('5.0');
    expect(amountToPaise('250.5')).toBe(25050);
    expect(amountToPaise('nope')).toBe(0);
  });

  it('cashback applies only from the coupon minimum', () => {
    expect(isCouponEligible(coupon, 49999)).toBe(false);
    expect(couponBonusPaise(coupon, 49999)).toBe(0);
    expect(couponBonusPaise(coupon, 100000)).toBe(10000);
    expect(totalCreditsPaise(coupon, 100000)).toBe(110000);
    expect(totalCreditsPaise(null, 100000)).toBe(100000);
  });
});

describe('transaction display', () => {
  it('titles and signed amounts', () => {
    expect(transactionTitle(tx())).toBe('Wallet Recharge');
    expect(transactionTitle(tx({ type: 'debit', stationName: 'Hub' }))).toBe('Charging - Hub');
    expect(transactionTitle(tx({ type: 'debit' }))).toBe('Charging - Unknown Station');
    expect(signedAmount(tx())).toBe('+ ₹500');
    expect(signedAmount(tx({ type: 'debit', amountPaise: 12050 }))).toBe('- ₹120.50');
  });

  it('filters by type and groups by month in order', () => {
    const list = [
      tx({ id: 'a', createdAt: '2026-11-20T10:00:00Z' }),
      tx({ id: 'b', type: 'debit', createdAt: '2026-11-02T10:00:00Z' }),
      tx({ id: 'c', createdAt: '2026-10-30T10:00:00Z' }),
    ];
    expect(filterTransactions(list, 'debit').map(t => t.id)).toEqual(['b']);
    const sections = groupByMonth(list);
    expect(sections).toHaveLength(2);
    expect(sections[0]!.data.map(t => t.id)).toEqual(['a', 'b']);
  });
});
