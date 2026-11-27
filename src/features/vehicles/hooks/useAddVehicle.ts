import { router } from 'expo-router';

import { useVehicleWizard } from './useVehicleWizard';
import { VEHICLES_HREF } from '../constants/vehicles.constants';

const leave = () => {
  if (router.canGoBack()) router.back();
  else router.replace(VEHICLES_HREF.list);
};

// The setup wizard without Skip; back steps through the wizard before leaving the screen.
export const useAddVehicle = () => {
  const wizard = useVehicleWizard({ onAdded: leave });

  return {
    wizard,
    back: () => {
      if (!wizard.back()) leave();
    },
  };
};
