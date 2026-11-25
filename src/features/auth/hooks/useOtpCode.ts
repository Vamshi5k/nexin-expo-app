import { useEffect, useState } from 'react';

import { getErrorMessage, statusOf } from '@/core/api';
import { useAction } from '@/core/request';
import { haptics } from '@/shared/utils/haptics';
import { toast } from '@/shared/utils/toast';

import { OTP_RESEND_SECONDS } from '../constants/auth.constants';

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

type OtpCodeOptions = {
  length: number;
  verify: (otp: string) => Promise<void>;
  resend: () => Promise<void>;
  resentMessage: string;
  onWrongCode?: () => void;
};

// Code entry, verify and the resend cooldown, shared by the consumer and fleet OTP screens.
export const useOtpCode = ({
  length,
  verify: verifyCode,
  resend: resendCode,
  resentMessage,
  onWrongCode,
}: OtpCodeOptions) => {
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const verify = useAction(verifyCode);
  const resend = useAction(resendCode);
  const countdown = useCountdown(OTP_RESEND_SECONDS);

  const submit = async (otp: string) => {
    if (otp.length !== length || verify.isPending) return;

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

  const resendNow = async () => {
    if (resend.isPending) return;

    try {
      await resend.run();
      countdown.restart();
      setCode('');
      setWrong(false);
      toast.success(resentMessage);
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
    length,
    complete: code.length === length,
    verifying: verify.isPending,
    submit: (otp = code) => void submit(otp),
    resendIn: countdown.remaining,
    resending: resend.isPending,
    resend: () => void resendNow(),
  };
};

export type OtpCode = ReturnType<typeof useOtpCode>;
