import { queryOptions } from '@tanstack/react-query';

import { queryKeys } from '@/core/query';

import { userByToken } from './api';
import { toUser } from './mappers';

export const meQuery = () =>
  queryOptions({
    queryKey: queryKeys.me(),
    queryFn: async () => toUser(await userByToken()),
  });
