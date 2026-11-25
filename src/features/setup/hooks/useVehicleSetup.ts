import { useCallback } from 'react';

import { router } from 'expo-router';

import { saveSetupStep, useAuth } from '@/features/auth';
import { useVehicleWizard } from '@/features/vehicles';

import { SETUP_HREF } from '../constants/setup.constants';

// Added or skipped, the vehicle step is done: it is saved first so a restart opens
// Permissions and never offers a second "Add Vehicle".
export const useVehicleSetup = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const toPermissions = useCallback(() => {
    if (userId) saveSetupStep(userId, 'permissions');
    router.replace(SETUP_HREF.permissions);
  }, [userId]);

  return { wizard: useVehicleWizard({ onAdded: toPermissions }), skip: toPermissions };
};
