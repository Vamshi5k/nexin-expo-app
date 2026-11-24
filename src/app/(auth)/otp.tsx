import { Redirect, useLocalSearchParams } from 'expo-router';

import { OtpScreen, START_HREF, type ContactType } from '@/features/auth';

export default function OtpRoute() {
  const { type, value } = useLocalSearchParams<{ type?: string; value?: string }>();
  if (!value) return <Redirect href={START_HREF.login} />;
  const contactType: ContactType = type === 'email' ? 'email' : 'phone';
  return <OtpScreen type={contactType} value={value} />;
}
