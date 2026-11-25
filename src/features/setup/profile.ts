import { z } from 'zod';

import { NAME_MIN_LENGTH } from './constants';

// Pure profile-setup rules. No React or UI imports, so tests load it directly.

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters`);

export const profileFormSchema = z.object({ name: nameSchema });
export type ProfileForm = z.infer<typeof profileFormSchema>;

// "Asha Rao" -> "AR"; one word -> one letter; empty -> "".
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}
