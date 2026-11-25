import { useEffect, useState } from 'react';

import { getErrorMessage, statusOf } from '@/core/api';
import { brand } from '@/core/config';
import { useAction } from '@/core/request';
import { haptics } from '@/shared/utils/haptics';
import { toast } from '@/shared/utils/toast';

import { useAuth } from './useAuth';
import { CONSUMER_OTP_LENGTH, OTP_RESEND_SECONDS } from '../constants/auth.constants';
import type { ContactType } from '../types/auth.types';
import { formatContact } from '../utils/contact';

const useCountdown = (seconds: number) => {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));

  useEffect(() => {
    if (remaining === 0) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [remaining]);

  return {
    remaining,
    restart: () => {
      const start = Date.now();
      setNow(start);
      setEndsAt(start + seconds * 1000);
    },
  };
};

type OtpFormOptions = {
  onWrongCode?: () => void;
};

// The screen owns the input ref: a ref in the result makes the React Compiler reject every read.
export const useOtpForm = (
  type: ContactType,
  value: string,
  { onWrongCode }: OtpFormOptions = {},
) => {
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const auth = useAuth();
  const verify = useAction(auth.verifyOtp);
  const resend = useAction(auth.requestOtp);
  const countdown = useCountdown(OTP_RESEND_SECONDS);

  const submit = async (otp: string) => {
    if (otp.length !== CONSUMER_OTP_LENGTH || verify.isPending) return;

    try {
      await verify.run(otp);
      haptics.success();
    } catch (error) {
      setCode('');
      setWrong(true);
      onWrongCode?.();
      haptics.warning();
      const status = statusOf(error);
      toast.error(
        status !== undefined && status >= 400 && status < 500
          ? 'Invalid OTP. Please try again.'
          : getErrorMessage(error),
      );
    }
  };

  const resendCode = async () => {
    if (resend.isPending) return;

    try {
      await resend.run(value);
      countdown.restart();
      setCode('');
      setWrong(false);
      toast.success('New OTP sent!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
    code,
    changeCode: (next: string) => {
      setWrong(false);
      setCode(next);
    },
    wrong,
    length: CONSUMER_OTP_LENGTH,
    complete: code.length === CONSUMER_OTP_LENGTH,
    verifying: verify.isPending,
    submit: (otp = code) => void submit(otp),
    resendIn: countdown.remaining,
    resending: resend.isPending,
    resend: () => void resendCode(),
    contact: value
      ? formatContact(type, value, brand.phoneCountryCode)
      : type === 'phone'
        ? 'your number'
        : 'your email',
  };
};
