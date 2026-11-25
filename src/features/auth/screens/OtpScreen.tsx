import { useRef } from 'react';
import type { TextInputInstance } from 'react-native';

import OtpView from '../components/OtpView';

import { OTP_COPY } from '../constants/auth.constants';
import { useOtpForm } from '../hooks/useOtpForm';
import type { ContactType } from '../types/auth.types';

export type OtpScreenProps = { type: ContactType; value: string };

const OtpScreen = ({ type, value }: OtpScreenProps) => {
  const inputRef = useRef<TextInputInstance>(null);
  const otp = useOtpForm(type, value, { onWrongCode: () => inputRef.current?.focus() });
  const copy = OTP_COPY.consumer;

  return (
    <OtpView
      otp={otp}
      inputRef={inputRef}
      title={copy.title}
      subtitle={copy.subtitle(otp.length)}
      verifyLabel={copy.verify}
      helpPrompt={copy.helpPrompt}
      changeLabel={type === 'phone' ? 'Change Number' : 'Change Email'}
    />
  );
};

export default OtpScreen;
