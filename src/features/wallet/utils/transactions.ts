import { brand } from '@/core/config';
import { formatPaise } from '@/shared/utils/money';

import { WALLET_COPY } from '../constants/wallet.constants';
import type { TransactionFilter, WalletTransaction } from '../types/wallet.types';

export function transactionTitle(tx: WalletTransaction): string {
  if (tx.type === 'credit') return WALLET_COPY.recharge;
  return WALLET_COPY.charging(tx.stationName ?? WALLET_COPY.unknownStation);
}

// "+ ₹500" for money in, "- ₹120.50" for money out.
export const signedAmount = (tx: WalletTransaction) =>
  `${tx.type === 'credit' ? '+' : '-'} ${formatPaise(tx.amountPaise)}`;

const validDate = (iso: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

// "12 Nov 2026, 4:05 pm" in the brand's locale.
export function transactionDate(iso: string | null): string {
  const date = validDate(iso);
  if (!date) return '';

  const day = date.toLocaleDateString(brand.locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString(brand.locale, { hour: 'numeric', minute: '2-digit' });
  return `${day}, ${time}`;
}

// "November 2026": the history list's section headers.
export function monthLabel(iso: string | null): string {
  const date = validDate(iso);
  if (!date) return '';
  return date.toLocaleDateString(brand.locale, { month: 'long', year: 'numeric' });
}

// The API has no type filter yet, so History filters the pages it has (BLUEPRINT D2).
export const filterTransactions = (list: WalletTransaction[], filter: TransactionFilter) =>
  filter === 'all' ? list : list.filter(tx => tx.type === filter);

export type MonthSection = { title: string; data: WalletTransaction[] };

// Groups newest-first transactions into month sections, keeping their order.
export function groupByMonth(list: WalletTransaction[]): MonthSection[] {
  const sections: MonthSection[] = [];
  for (const tx of list) {
    const title = monthLabel(tx.createdAt);
    const last = sections.at(-1);
    if (last && last.title === title) last.data.push(tx);
    else sections.push({ title, data: [tx] });
  }
  return sections;
}

// Appends the next page, skipping rows already shown.
export function appendTransactions(current: WalletTransaction[], next: WalletTransaction[]) {
  const seen = new Set(current.map(tx => tx.id));
  return [...current, ...next.filter(tx => !seen.has(tx.id))];
}
