import { fleetApi } from '@/features/fleet';

import { brand } from '@/core/config';
import { sessionStore } from '@/core/session';

import { useOtpCode } from './useOtpCode';
import { FLEET_OTP_LENGTH, OTP_COPY } from '../constants/auth.constants';
import { formatContact } from '../utils/contact';

type FleetOtpFormOptions = {
  onWrongCode?: () => void;
};

// Verify only stores the fleet tokens: the guard sends the driver to "/", which loads the
// driver and opens fleet home.
export const useFleetOtpForm = (
  contact: string,
  driverId: string,
  { onWrongCode }: FleetOtpFormOptions = {},
) => {
  const otp = useOtpCode({
    length: FLEET_OTP_LENGTH,
    verify: async code => {
      await sessionStore.getState().signIn('fleet', await fleetApi.verifyOtp(code));
    },
    resend: () => fleetApi.resendOtp(driverId),
    resentMessage: OTP_COPY.fleet.resent,
    onWrongCode,
  });

  return { ...otp, contact: formatContact('phone', contact, brand.phoneCountryCode) };
};
