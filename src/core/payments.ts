import { TurboModuleRegistry } from 'react-native';

export type CheckoutOptions = {
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  name: string;
  description: string;
  color: string;
  prefill: { name?: string; email?: string; contact?: string };
};

export type CheckoutSuccess = {
  paymentId: string;
  orderId: string;
  signature: string;
};

export type PaymentErrorKind = 'unavailable' | 'cancelled' | 'failed';

export type PaymentError = Error & { name: 'PaymentError'; kind: PaymentErrorKind };

const paymentError = (kind: PaymentErrorKind, message: string): PaymentError =>
  Object.assign(new Error(message), { name: 'PaymentError' as const, kind });

export const isPaymentError = (error: unknown): error is PaymentError =>
  error instanceof Error && error.name === 'PaymentError';

// react-native-razorpay throws on import when the installed build has no native module (an old
// dev build or Expo Go), so check first and load it only when a payment starts.
export const paymentsAvailable = () => TurboModuleRegistry.get('RNRazorpayCheckout') !== null;

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = { code?: number; description?: string };

// Razorpay reports a closed checkout as code 0 on Android and 2 on iOS.
const CANCEL_CODES = [0, 2];

// Opens Razorpay's checkout. Resolves with the signed payment; rejects with a PaymentError.
export async function openCheckout(options: CheckoutOptions): Promise<CheckoutSuccess> {
  if (!paymentsAvailable()) {
    throw paymentError('unavailable', 'Payments need the latest app build.');
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RazorpayCheckout = (require('react-native-razorpay') as { default: RazorpayModule })
    .default;

  try {
    const result = await RazorpayCheckout.open({
      key: options.keyId,
      order_id: options.orderId,
      amount: options.amountPaise,
      currency: options.currency,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      theme: { color: options.color },
    });

    return {
      paymentId: result.razorpay_payment_id,
      orderId: result.razorpay_order_id,
      signature: result.razorpay_signature,
    };
  } catch (error) {
    const failure = (error ?? {}) as RazorpayFailure;
    const cancelled = failure.code !== undefined && CANCEL_CODES.includes(failure.code);
    throw paymentError(
      cancelled ? 'cancelled' : 'failed',
      failure.description || 'Payment failed.',
    );
  }
}

type RazorpayModule = {
  open: (options: Record<string, unknown>) => Promise<RazorpaySuccess>;
};
