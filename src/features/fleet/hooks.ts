import { queryOptions } from '@tanstack/react-query';

import { queryKeys } from '@/core/query';

import { getFleetUserByToken } from './api';
import { toFleetUser } from './mappers';

export const fleetMeQuery = () =>
  queryOptions({
    queryKey: queryKeys.fleetMe(),
    queryFn: async () => toFleetUser(await getFleetUserByToken()),
  });
