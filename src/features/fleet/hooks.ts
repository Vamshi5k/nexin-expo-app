import { queryOptions } from '@tanstack/react-query';

import { queryKeys } from '@/core/query';

import { getFleetUserByToken, toFleetUser } from './api';

export const fleetMeQuery = () =>
  queryOptions({
    queryKey: queryKeys.fleetMe(),
    queryFn: async () => toFleetUser(await getFleetUserByToken()),
  });
