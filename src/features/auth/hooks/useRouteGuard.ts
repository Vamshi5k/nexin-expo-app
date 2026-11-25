import { useEffect } from 'react';

import { useSegments } from 'expo-router';

import { useClientConfig } from '@/features/client-config';

import { log } from '@/core/log';
import { sessionStore, useSession } from '@/core/session';

import { useAuth } from './useAuth';
import type { GuardDecision, RouteGroup } from '../types/auth.types';
import { guardRoute, setupStepFor } from '../utils/authFlow';

export const useRouteGuard = (group: RouteGroup): GuardDecision => {
  const mode = useSession(s => s.mode);
  const fleetEnabled = useClientConfig().features.fleet;
  const { user } = useAuth();
  const segments = useSegments();
  const decision = guardRoute(group, {
    mode,
    fleetEnabled,
    setupStep: mode === 'consumer' && user ? setupStepFor(user) : null,
    screen: segments[segments.length - 1],
  });

  useEffect(() => {
    if (decision !== 'end-session') return;
    log.info('fleet feature is off; ending the fleet session');
    void sessionStore.getState().signOut();
  }, [decision]);

  return decision;
};
