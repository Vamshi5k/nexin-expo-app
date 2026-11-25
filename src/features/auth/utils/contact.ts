import { z } from 'zod';

import { brand, phonePattern } from '@/core/config';

import type { ContactType } from '../types/auth.types';

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .regex(/^\d+$/, 'Enter a valid mobile number')
  .length(brand.phoneLength, `Enter a ${brand.phoneLength}-digit mobile number`)
  .regex(phonePattern, 'Enter a valid mobile number');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'));

export const contactFormSchema = {
  phone: z.object({ contact: phoneSchema }),
  email: z.object({ contact: emailSchema }),
};

export function sanitizeOtp(input: string, length: number): string {
  return input.replace(/\D/g, '').slice(0, length);
}

export function otpCells(
  value: string,
  length: number,
): { digit: string; state: 'filled' | 'active' | 'empty' }[] {
  return Array.from({ length }, (_, i) => ({
    digit: value[i] ?? '',
    state: i < value.length ? 'filled' : i === value.length ? 'active' : 'empty',
  }));
}

export function formatContact(type: ContactType, value: string, countryCode: string): string {
  if (type === 'email') return value;
  const half = Math.ceil(value.length / 2);

  return `${countryCode} ${value.slice(0, half)} ${value.slice(half)}`.trim();
}
