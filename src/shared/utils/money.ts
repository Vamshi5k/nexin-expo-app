export const rupeesToPaise = (value: number | string | null | undefined): number => {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
