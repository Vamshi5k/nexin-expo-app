import { z } from 'zod';

import { brand, phonePattern } from '@/core/config';

/** Phone from brand.phoneRegex / phoneLength (digits only, no country code). */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .regex(/^\d+$/, 'Enter a valid mobile number')
  .length(brand.phoneLength, `Enter a ${brand.phoneLength}-digit mobile number`)
  .regex(phonePattern, 'Enter a valid mobile number');

/** Screen-audit deviation: "Enter a valid email address" replaces Yup's default. */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'));

export const otpSchema = (length: number) => z.string().regex(/^\d+$/).length(length);

export const phoneFormSchema = z.object({ contact: phoneSchema });
export const emailFormSchema = z.object({ contact: emailSchema });
export type ContactForm = { contact: string };
