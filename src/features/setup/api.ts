import { api } from '@/core/api';

export async function updateProfile(firstName: string): Promise<void> {
  await api.put('/profile', { first_name: firstName });
}
