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

export type SetupPermission = 'location' | 'notifications';
