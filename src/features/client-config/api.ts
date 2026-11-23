import { api, unwrap, type Envelope } from '@/core/api';

import type { ClientInfoDto } from './types';

export const CLIENT_INFO_PATH = '/client/info';

export async function getClientInfo(): Promise<ClientInfoDto> {
  const res = await api.get<Envelope<ClientInfoDto>>(CLIENT_INFO_PATH, {
    params: { details: true, login: true, logo: true, clientDetails: true },
  });
  return unwrap(res);
}
