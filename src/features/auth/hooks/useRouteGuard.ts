import { useEffect } from 'react';

import { useClientConfig } from '@/features/client-config';

import { log } from '@/core/log';
import { sessionStore, useSession } from '@/core/session';

import type { GuardDecision, RouteGroup } from '../types/auth.types';
import { guardRoute } from '../utils/authFlow';

export const useRouteGuard = (group: RouteGroup): GuardDecision => {
  const mode = useSession(s => s.mode);
  const fleetEnabled = useClientConfig().features.fleet;
  const decision = guardRoute(group, { mode, fleetEnabled });

  useEffect(() => {
    if (decision !== 'end-session') return;
    log.info('fleet feature is off; ending the fleet session');
    void sessionStore.getState().signOut();
  }, [decision]);

  return decision;
};
