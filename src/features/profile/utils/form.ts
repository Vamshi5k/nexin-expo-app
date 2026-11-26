import { z } from 'zod';

import { EDIT_COPY } from '../constants/profile.constants';
import type { EditProfileForm, ProfileChangesDto } from '../types/profile.types';

// GSTIN: 2-digit state code, 10-character PAN, entity number, "Z", checksum.
export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type PhoneRules = { pattern: RegExp; length: number };

// The brand's phone rules come in from config, so this file stays free of brand imports. Phone
// is required only when the account already has one (it can't be cleared); an account that
// signed up by email may leave it empty.
export const editProfileSchema = (phone: PhoneRules, { phoneRequired = true } = {}) =>
  z.object({
    firstName: z.string().trim().min(1, EDIT_COPY.firstNameRequired),
    lastName: z.string().trim(),
    email: z
      .string()
      .trim()
      .refine(value => value === '' || EMAIL_PATTERN.test(value), EDIT_COPY.emailInvalid),
    phone: z
      .string()
      .trim()
      .refine(value => !phoneRequired || value !== '', EDIT_COPY.phoneRequired)
      .refine(
        value => value === '' || phone.pattern.test(value),
        EDIT_COPY.phoneInvalid(phone.length),
      ),
    gst: z
      .string()
      .trim()
      .transform(value => value.toUpperCase())
      .refine(value => value === '' || GSTIN_PATTERN.test(value), EDIT_COPY.gstInvalid),
  });

// "+91 98765 43210" or "919876543210" -> "9876543210": the last `length` digits.
export function localPhone(raw: string | null | undefined, length: number): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  return digits.length > length ? digits.slice(-length) : digits;
}

const clean = (form: EditProfileForm): EditProfileForm => ({
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  gst: form.gst.trim().toUpperCase(),
});

// Only what changed, trimmed, in the API's field names. Empty when nothing did.
export function changedFields(
  initial: EditProfileForm,
  values: EditProfileForm,
): ProfileChangesDto {
  const before = clean(initial);
  const after = clean(values);
  const changes: ProfileChangesDto = {};

  if (after.firstName !== before.firstName) changes.first_name = after.firstName;
  if (after.lastName !== before.lastName) changes.last_name = after.lastName;
  if (after.email !== before.email) changes.email = after.email;
  if (after.phone !== before.phone) changes.phone = after.phone;
  if (after.gst !== before.gst) changes.gst = after.gst;
  return changes;
}

export const hasChanges = (initial: EditProfileForm, values: EditProfileForm) =>
  Object.keys(changedFields(initial, values)).length > 0;

// "Asha Rao" -> "AR"; one word -> one letter; nothing -> "".
export const initialsOf = (first: string, last: string): string =>
  [first, last]
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
