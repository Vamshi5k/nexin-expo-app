import { brand } from '@/core/config';

import { useAuth } from './useAuth';
import { useOtpCode } from './useOtpCode';
import { CONSUMER_OTP_LENGTH, OTP_COPY } from '../constants/auth.constants';
import type { ContactType } from '../types/auth.types';
import { formatContact } from '../utils/contact';

type OtpFormOptions = {
  onWrongCode?: () => void;
};

// The screen owns the input ref: a ref in the result makes the React Compiler reject every read.
export const useOtpForm = (
  type: ContactType,
  value: string,
  { onWrongCode }: OtpFormOptions = {},
) => {
  const auth = useAuth();
  const otp = useOtpCode({
    length: CONSUMER_OTP_LENGTH,
    verify: auth.verifyOtp,
    resend: () => auth.requestOtp(value),
    resentMessage: OTP_COPY.consumer.resent,
    onWrongCode,
  });

  return {
    ...otp,
    contact: value
      ? formatContact(type, value, brand.phoneCountryCode)
      : type === 'phone'
        ? 'your number'
        : 'your email',
  };
};
