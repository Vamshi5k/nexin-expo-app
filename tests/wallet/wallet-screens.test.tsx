import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { sessionStore } from '@/core/session';
import { openCheckout, type PaymentError } from '@/core/payments';
import { authApi } from '@/features/auth/api/auth.api';
import { AddMoneyScreen, WalletHistoryScreen, WalletScreen } from '@/features/wallet';
import { walletApi } from '@/features/wallet/api/wallet.api';
import type { WalletTransaction } from '@/features/wallet/types/wallet.types';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
// The library's mock renders sheet content straight away.
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));
jest.mock('@/core/payments', () => ({
  ...jest.requireActual('@/core/payments'),
  openCheckout: jest.fn(),
}));
jest.mock('@/features/auth/api/auth.api', () => ({
  ...jest.requireActual('@/features/auth/api/auth.api'),
  authApi: { ...jest.requireActual('@/features/auth/api/auth.api').authApi, getUser: jest.fn() },
}));
jest.mock('@/features/wallet/api/wallet.api', () => ({
  ...jest.requireActual('@/features/wallet/api/wallet.api'),
  walletApi: {
    getTransactions: jest.fn(),
    getCoupons: jest.fn(),
    createOrder: jest.fn(),
    verifyPayment: jest.fn(),
  },
}));

const getUser = jest.mocked(authApi.getUser);
const getTransactions = jest.mocked(walletApi.getTransactions);
const createOrder = jest.mocked(walletApi.createOrder);
const verifyPayment = jest.mocked(walletApi.verifyPayment);
const checkout = jest.mocked(openCheckout);

const USER = {
  id: '1',
  userId: 'U1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '9876543210',
  isFirstLogin: false,
  walletBalancePaise: 125050,
  isEmailVerified: true,
  isPhoneVerified: true,
  gst: null,
};

const tx = (id: string, overrides: Partial<WalletTransaction> = {}): WalletTransaction => ({
  id,
  refNo: id,
  type: 'credit',
  amountPaise: 50000,
  createdAt: '2026-11-12T10:00:00.000Z',
  stationName: null,
  ...overrides,
});

const ORDER = {
  keyId: 'rzp_test',
  orderId: 'order_1',
  amountPaise: 50000,
  currency: 'INR',
  companyName: 'Cruze',
};

beforeEach(async () => {
  jest.clearAllMocks();
  getUser.mockResolvedValue(USER);
  await sessionStore.getState().signIn('consumer', { accessToken: 'a', refreshToken: 'r' });
});

describe('WalletScreen', () => {
  it('shows the balance, recent transactions and See All', async () => {
    getTransactions.mockResolvedValue({
      items: [tx('1'), tx('2', { type: 'debit', amountPaise: 12050, stationName: 'Hub' })],
      page: 1,
      totalPages: 3,
    });
    await renderWithApp(<WalletScreen />);

    expect(await screen.findByLabelText(/^Wallet Recharge, \+ ₹500, 12 Nov 2026, /)).toBeTruthy();
    expect(screen.getByText('Charging - Hub')).toBeTruthy();
    await waitFor(() => expect(screen.getByLabelText('Available Balance ₹1,250.50')).toBeTruthy());
    expect(getTransactions).toHaveBeenCalledWith(1, 10);

    await fireEvent.press(screen.getByRole('link', { name: 'See All' }));
    expect(router.push).toHaveBeenCalledWith('/(app)/wallet/history');
    await fireEvent.press(screen.getByRole('button', { name: 'Add Money' }));
    expect(router.push).toHaveBeenCalledWith('/(app)/wallet/add');
  });

  it('the eye hides and shows the balance', async () => {
    getTransactions.mockResolvedValue({ items: [], page: 1, totalPages: 1 });
    await renderWithApp(<WalletScreen />);
    await screen.findByText('No Transactions Yet');

    await fireEvent.press(screen.getByRole('button', { name: 'Hide balance' }));
    expect(screen.getByLabelText('Available Balance ••••••')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Show balance' }));
    expect(screen.getByLabelText('Available Balance ₹1,250.50')).toBeTruthy();
  });

  it('a failed load shows Retry', async () => {
    getTransactions
      .mockRejectedValueOnce(new Error('down'))
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValue({ items: [tx('1')], page: 1, totalPages: 1 });
    await renderWithApp(<WalletScreen />);

    expect(await screen.findByText("Couldn't load transactions. Pull down to retry.")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByText('Wallet Recharge')).toBeTruthy();
  });
});

describe('WalletHistoryScreen', () => {
  it('filters to debits and fetches more pages until some show up', async () => {
    getTransactions
      .mockResolvedValueOnce({ items: [tx('1'), tx('2')], page: 1, totalPages: 2 })
      .mockResolvedValueOnce({
        items: [tx('3', { type: 'debit', stationName: 'Hub' })],
        page: 2,
        totalPages: 2,
      });
    await renderWithApp(<WalletHistoryScreen />);
    expect((await screen.findAllByText('Wallet Recharge')).length).toBe(2);

    await act(async () => fireEvent.press(screen.getByText('Debit')));

    expect(await screen.findByText('Charging - Hub')).toBeTruthy();
    expect(screen.queryByText('Wallet Recharge')).toBeNull();
    expect(getTransactions).toHaveBeenLastCalledWith(2, 10);
  });

  it('nothing at all shows the empty state', async () => {
    getTransactions.mockResolvedValue({ items: [], page: 1, totalPages: 1 });
    await renderWithApp(<WalletHistoryScreen />);
    expect(await screen.findByText('No Transactions Found')).toBeTruthy();
  });
});

describe('AddMoneyScreen', () => {
  const typeAmount = async (value: string) =>
    fireEvent.changeText(screen.getByLabelText('Enter amount'), value);

  it('blocks amounts under the minimum and explains why', async () => {
    await renderWithApp(<AddMoneyScreen />);
    await typeAmount('50');

    expect(await screen.findByText('Minimum amount is ₹100')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Add Money' }));
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('a quick amount fills the field', async () => {
    await renderWithApp(<AddMoneyScreen />);
    await fireEvent.press(screen.getByText('₹500'));
    expect(screen.getByLabelText('Enter amount').props.value).toBe('500');
  });

  it('pays, verifies, refreshes the balance and shows success', async () => {
    createOrder.mockResolvedValue(ORDER);
    checkout.mockResolvedValue({ paymentId: 'pay_1', orderId: 'order_1', signature: 'sig' });
    verifyPayment.mockResolvedValue(undefined);
    await renderWithApp(<AddMoneyScreen initialAmount="500" />);

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Add ₹500' })));

    expect(createOrder).toHaveBeenCalledWith(50000, null);
    expect(checkout).toHaveBeenCalledWith(
      expect.objectContaining({ keyId: 'rzp_test', orderId: 'order_1', amountPaise: 50000 }),
    );
    expect(verifyPayment).toHaveBeenCalledWith({
      paymentId: 'pay_1',
      orderId: 'order_1',
      signature: 'sig',
    });
    expect(await screen.findByText('Payment Successful!')).toBeTruthy();
    expect(screen.getByText('order_1')).toBeTruthy();
  });

  it('a failed checkout offers Try Again with the same order', async () => {
    createOrder.mockResolvedValue(ORDER);
    const failed = Object.assign(new Error('Card declined'), {
      name: 'PaymentError',
      kind: 'failed',
    }) as PaymentError;
    checkout.mockRejectedValueOnce(failed).mockResolvedValueOnce({
      paymentId: 'pay_2',
      orderId: 'order_1',
      signature: 'sig',
    });
    verifyPayment.mockResolvedValue(undefined);
    await renderWithApp(<AddMoneyScreen initialAmount="500" />);

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Add ₹500' })));
    expect(await screen.findByText('Payment Failed')).toBeTruthy();

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Try Again' })));
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(checkout).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('Payment Successful!')).toBeTruthy();
  });

  it('paid but not verified: no retry, and a warning not to pay again', async () => {
    createOrder.mockResolvedValue(ORDER);
    checkout.mockResolvedValue({ paymentId: 'pay_1', orderId: 'order_1', signature: 'sig' });
    verifyPayment.mockRejectedValue(new Error('timeout'));
    await renderWithApp(<AddMoneyScreen initialAmount="500" />);

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Add ₹500' })));

    expect(await screen.findByText('Payment Not Confirmed')).toBeTruthy();
    expect(screen.getByText(/Please don't pay again/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try Again' })).toBeNull();
  });

  it('a build without Razorpay says to update instead of crashing', async () => {
    createOrder.mockResolvedValue(ORDER);
    checkout.mockRejectedValue(
      Object.assign(new Error('x'), { name: 'PaymentError', kind: 'unavailable' }),
    );
    await renderWithApp(<AddMoneyScreen initialAmount="500" />);

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Add ₹500' })));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Payments need the latest app build. Please update the app.',
      ),
    );
  });
});
