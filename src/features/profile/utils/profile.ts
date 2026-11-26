import { COUNT_COPY } from '../constants/profile.constants';
import type { DeletionPath, EditProfileForm, FieldErrors } from '../types/profile.types';

type CountKind = keyof typeof COUNT_COPY;

// Friendly zero, correct singular and plural; null (unknown) stays null so the UI shows a
// skeleton or nothing, never "undefined".
export function countLabel(kind: CountKind, count: number | null): string | null {
  if (count === null) return null;
  const copy = COUNT_COPY[kind];
  if (count <= 0) return copy.none;
  return count === 1 ? copy.one : copy.many(count);
}

type DeletionInput = {
  apiEnabled: boolean;
  deleteAccountUrl: string | null | undefined;
  supportUrl: string | null | undefined;
  supportEmail: string | null | undefined;
};

// In-app deletion when the API is on, else the brand's own page, else support. The row never
// disappears: the app stores require a deletion path.
export function deletionPath(input: DeletionInput): DeletionPath {
  if (input.apiEnabled) return { kind: 'api' };
  if (input.deleteAccountUrl) return { kind: 'web', url: input.deleteAccountUrl };
  return { kind: 'support', url: input.supportUrl ?? null, email: input.supportEmail ?? null };
}

const FIELD_HINTS: [keyof EditProfileForm, RegExp][] = [
  ['email', /e-?mail/i],
  ['phone', /phone|mobile|contact number/i],
  ['gst', /gst/i],
  ['firstName', /first[ _]?name|full[ _]?name/i],
  ['lastName', /last[ _]?name/i],
];

const API_FIELDS: Record<string, keyof EditProfileForm> = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  phone: 'phone',
  gst: 'gst',
};

// TODO(backend): the PUT /profile error shape is unconfirmed (OPEN_QUESTIONS #21). Reads
// `errors: { field: message | [message] }` if present, else a message that clearly names one
// field. Anything else returns {} and the caller shows a toast.
export function toFieldErrors(body: unknown): FieldErrors {
  if (!body || typeof body !== 'object') return {};
  const { errors, message } = body as { errors?: unknown; message?: unknown };

  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const mapped: FieldErrors = {};
    for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
      const field = API_FIELDS[key];
      const text = Array.isArray(value) ? value[0] : value;
      if (field && typeof text === 'string' && text) mapped[field] = text;
    }
    if (Object.keys(mapped).length) return mapped;
  }

  if (typeof message !== 'string' || !message) return {};
  const named = FIELD_HINTS.filter(([, pattern]) => pattern.test(message));
  return named.length === 1 ? { [named[0]![0]]: message } : {};
}
