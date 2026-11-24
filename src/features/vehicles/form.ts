import { z } from 'zod';

import {
  CUSTOM_CAPACITY_MAX_KWH,
  CUSTOM_CAPACITY_MIN_KWH,
  MAC_ID_MAX_LENGTH,
  MAC_ID_MIN_LENGTH,
  REG_NO_MIN_LENGTH,
} from './constants';

// Pure vehicle-form rules. No React or UI imports, so tests load it directly.

export const detailsSchema = z.object({
  regNo: z
    .string()
    .trim()
    .min(1, 'Registration number is required')
    .min(REG_NO_MIN_LENGTH, 'Invalid registration number'),
  macId: z
    .string()
    .trim()
    .refine((v) => v === '' || (v.length >= MAC_ID_MIN_LENGTH && v.length <= MAC_ID_MAX_LENGTH), {
      message: 'Invalid MAC ID',
    }),
  maxAmount: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d+$/.test(v), { message: 'Must be a valid number' }),
});

export const customCapacitySchema = z
  .string()
  .trim()
  .min(1, 'Capacity is required')
  .refine((v) => /^\d+(\.\d+)?$/.test(v), { message: 'Must be a valid number' })
  .transform(Number)
  .refine((n) => n >= CUSTOM_CAPACITY_MIN_KWH, {
    message: `Minimum ${CUSTOM_CAPACITY_MIN_KWH} kWh`,
  })
  .refine((n) => n <= CUSTOM_CAPACITY_MAX_KWH, {
    message: `Maximum ${CUSTOM_CAPACITY_MAX_KWH} kWh`,
  });

export function matchesQuery(name: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q === '' || name.toLowerCase().includes(q);
}

export function formatCapacity(kwh: number): string {
  return `${Number.isInteger(kwh) ? kwh : kwh.toFixed(1)} kWh`;
}
