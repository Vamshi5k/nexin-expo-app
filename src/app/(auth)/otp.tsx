import { Redirect, useLocalSearchParams } from 'expo-router';

import { OtpScreen, START_HREF, type ContactType } from '@/features/auth';

/** /otp?type=phone|email&value=... Without a contact (e.g. a bare deep link) -> login. */
export default function OtpRoute() {
  const { type, value } = useLocalSearchParams<{ type?: string; value?: string }>();
  if (!value) return <Redirect href={START_HREF.login} />;
  const contactType: ContactType = type === 'email' ? 'email' : 'phone';
  return <OtpScreen type={contactType} value={value} />;
}
