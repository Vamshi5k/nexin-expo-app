import { brand } from '@/core/config';

export const rupeesToPaise = (value: number | string | null | undefined): number => {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

export const formatPaise = (paise: number): string => {
  const rupees = paise / 100;
  const decimals = Number.isInteger(rupees) ? 0 : 2;
  return `${brand.currency.symbol}${rupees.toLocaleString(brand.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 2,
  })}`;
};

// Rates always show paise, so cards side by side read in one format.
export const formatRate = (paise: number): string =>
  `${brand.currency.symbol}${(paise / 100).toLocaleString(brand.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
