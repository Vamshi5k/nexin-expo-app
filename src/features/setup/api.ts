import { api } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';

export async function updateProfile(firstName: string): Promise<void> {
  await api.put(ENDPOINTS.PROFILE.UPDATE, { first_name: firstName });
}
