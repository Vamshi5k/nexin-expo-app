export type TransactionType = 'credit' | 'debit';

export type TransactionFilter = 'all' | TransactionType;

export type WalletTransactionDto = {
  id?: number | string | null;
  refNo?: string | null;
  type?: string | null;
  amount?: number | string | null;
  createdAt?: string | null;
  charger?: { station?: { name?: string | null } | null } | null;
};

export type WalletTransaction = {
  id: string;
  refNo: string | null;
  type: TransactionType;
  amountPaise: number;
  createdAt: string | null;
  stationName: string | null;
};

export type CouponDto = {
  id?: number | string | null;
  code?: string | null;
  description?: string | null;
  cashbackPercent?: number | string | null;
  amount?: number | string | null;
  endDate?: string | null;
  status?: string | null;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  cashbackPercent: number;
  minAmountPaise: number;
  endsAt: string | null;
};

export type PaymentOrderDto = {
  keyId?: string | null;
  orderId?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  companyName?: string | null;
};

// `amountPaise` is what Razorpay charges; the API already sends it in paise.
export type PaymentOrder = {
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  companyName: string | null;
};

export type AddMoneyForm = {
  amount: string;
};

export type PaymentOutcome =
  | { kind: 'success'; creditedPaise: number; orderId: string }
  | { kind: 'failed'; message: string }
  | { kind: 'unconfirmed'; orderId: string };
