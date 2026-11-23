/** Consumer OTP length (BLUEPRINT A4). Fleet passes its own length to OtpInput. */
export const CONSUMER_OTP_LENGTH = 4;
/** Seconds before "Resend code" is offered again. */
export const OTP_RESEND_SECONDS = 30;

/** Keeps digits only, up to `length`. Handles paste and SMS autofill ("Your code is 1234."). */
export function sanitizeOtp(input: string, length: number): string {
  return input.replace(/\D/g, '').slice(0, length);
}

export type OtpCellState = 'filled' | 'active' | 'empty';

/** One entry per box: its digit and whether it is filled, the next to type, or empty. */
export function otpCells(value: string, length: number): { digit: string; state: OtpCellState }[] {
  return Array.from({ length }, (_, i) => ({
    digit: value[i] ?? '',
    state: i < value.length ? 'filled' : i === value.length ? 'active' : 'empty',
  }));
}

/** "9876543210" -> "+91 98765 43210" for display. Emails are returned as-is. */
export function formatContact(type: 'phone' | 'email', value: string, countryCode: string): string {
  if (type === 'email') return value;
  const half = Math.ceil(value.length / 2);
  return `${countryCode} ${value.slice(0, half)} ${value.slice(half)}`.trim();
}
