import { useRef } from 'react';
import type { TextInputInstance } from 'react-native';

import { AppText } from '@/shared/components';

import OtpView from '../components/OtpView';

import { OTP_COPY } from '../constants/auth.constants';
import { useFleetOtpForm } from '../hooks/useFleetOtpForm';

export type FleetOtpScreenProps = { fleetId: string | null; contact: string; driverId: string };

const FleetOtpScreen = ({ fleetId, contact, driverId }: FleetOtpScreenProps) => {
  const inputRef = useRef<TextInputInstance>(null);
  const otp = useFleetOtpForm(contact, driverId, {
    onWrongCode: () => inputRef.current?.focus(),
  });
  const copy = OTP_COPY.fleet;

  return (
    <OtpView
      otp={otp}
      inputRef={inputRef}
      title={copy.title}
      subtitle={copy.subtitle(otp.length)}
      verifyLabel={copy.verify}
      helpPrompt={copy.helpPrompt}
      changeLabel={copy.change}
      codeLabel={copy.codeLabel}
      aboveTitle={
        fleetId ? (
          <AppText variant="subhead" tone="accent" tabular>
            Fleet ID: {fleetId}
          </AppText>
        ) : null
      }
    />
  );
};

export default FleetOtpScreen;
