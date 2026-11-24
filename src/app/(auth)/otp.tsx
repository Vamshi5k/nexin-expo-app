import { useLocalSearchParams } from 'expo-router';

import { OtpScreen, type ContactType } from '@/features/auth';

/** /otp?type=phone|email&value=... */
export default function OtpRoute() {
  const { type, value } = useLocalSearchParams<{ type?: string; value?: string }>();
  const contactType: ContactType = type === 'email' ? 'email' : 'phone';
  return <OtpScreen type={contactType} value={value ?? ''} />;
}
