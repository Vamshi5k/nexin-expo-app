import { useCallback } from 'react';

import { router } from 'expo-router';

import { useVehicleWizard } from '@/features/vehicles';

import { SETUP_HREF } from '../constants/setup.constants';

export const useVehicleSetup = () => {
  const toPermissions = useCallback(() => router.replace(SETUP_HREF.permissions), []);

  return { wizard: useVehicleWizard({ onAdded: toPermissions }), skip: toPermissions };
};
