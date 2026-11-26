import { useEffect, useState } from 'react';

import { getErrorMessage, statusOf } from '@/core/api';
import { useAction } from '@/core/request';
import { haptics } from '@/shared/utils/haptics';
import { toast } from '@/shared/utils/toast';

import { profileApi } from '../api/profile.api';
import {
  OTP_COPY,
  PROFILE_OTP_LENGTH,
  PROFILE_OTP_RESEND_SECONDS,
} from '../constants/profile.constants';
import type { ContactKind } from '../types/profile.types';

type Target = { kind: ContactKind; contact: string };

type ContactOtpOptions = {
  onVerified: (kind: ContactKind, contact: string) => void;
};

// The verify sheet: sends the code when it opens, verifies on the last digit, and allows a
// resend after a 30 s cooldown. A 4xx on verify means a wrong or expired code.
export const useContactOtp = ({ onVerified }: ContactOtpOptions) => {
  const [target, setTarget] = useState<Target | null>(null);
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const send = useAction(profileApi.sendOtp);
  const verify = useAction(profileApi.verifyOtp);
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    if (remaining === 0) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [remaining]);

  const sendTo = async (next: Target) => {
    try {
      await send.run(next.contact);
      const start = Date.now();
      setNow(start);
      setResendAt(start + PROFILE_OTP_RESEND_SECONDS * 1000);
      toast.success(OTP_COPY.sent);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  };

  const open = async (kind: ContactKind, contact: string) => {
    if (send.isPending) return;

    const next = { kind, contact };
    setCode('');
    setWrong(false);
    if (await sendTo(next)) setTarget(next);
  };

  const submit = async (value: string) => {
    if (!target || verify.isPending || value.length < PROFILE_OTP_LENGTH) return;

    try {
      await verify.run(target.contact, value);
      haptics.success();
      toast.success(OTP_COPY.verified);
      onVerified(target.kind, target.contact);
      setTarget(null);
    } catch (error) {
      const status = statusOf(error);
      if (status !== undefined && status >= 400 && status < 500) {
        setWrong(true);
        haptics.error();
        return;
      }
      toast.error(getErrorMessage(error));
    }
  };

  const change = (value: string) => {
    setWrong(false);
    setCode(value);
  };

  const resend = async () => {
    if (!target || remaining > 0 || send.isPending) return;

    setCode('');
    setWrong(false);
    await sendTo(target);
  };

  return {
    open: (kind: ContactKind, contact: string) => void open(kind, contact),
    sending: send.isPending,
    visible: target !== null,
    kind: target?.kind ?? 'phone',
    contact: target?.contact ?? '',
    code,
    change,
    submit: (value: string) => void submit(value),
    verifying: verify.isPending,
    wrong,
    remaining,
    resend: () => void resend(),
    close: () => setTarget(null),
  };
};
