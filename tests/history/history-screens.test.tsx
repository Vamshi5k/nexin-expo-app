import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { apiError } from '@/core/api';
import { ChargingHistoryScreen, InvoiceScreen } from '@/features/history';
import { historyApi } from '@/features/history/api/history.api';
import type { ChargingSession, Invoice } from '@/features/history/types/history.types';
import { toast } from '@/shared/utils/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));
jest.mock('@/features/history/api/history.api', () => ({
  ...jest.requireActual('@/features/history/api/history.api'),
  historyApi: {
    getSessions: jest.fn(),
    getInvoice: jest.fn(),
    downloadInvoicePdf: jest.fn(async () => 'file:///docs/invoice-9001.pdf'),
  },
}));

const api = jest.mocked(historyApi);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharing = jest.mocked(require('expo-sharing') as typeof import('expo-sharing'));

const DONE: ChargingSession = {
  id: '41',
  transactionId: '9001',
  status: 'completed',
  startedAt: '2026-11-12T10:00:00.000Z',
  energyKwh: 12.4,
  durationMin: 45,
  costPaise: 35650,
  connectorId: '2',
  sessionId: 'S-1',
  powerKw: 60,
  powerType: 'DC',
  stationName: 'Hub One',
  address: 'MG Road',
};
const LIVE: ChargingSession = {
  ...DONE,
  id: '42',
  status: 'active',
  startedAt: '2026-11-20T10:00:00.000Z',
  stationName: 'Hub Two',
};

const INVOICE: Invoice = {
  id: '41',
  transactionId: '9001',
  status: 'completed',
  startedAt: '2026-11-12T10:00:00.000Z',
  stoppedAt: '2026-11-12T11:20:00.000Z',
  durationMin: 80,
  energyKwh: 10,
  startSoc: 20,
  stopSoc: 80,
  chargerType: 'DC',
  connectorType: 'CCS2',
  chargerId: 'CRZ_01',
  connectorId: '2',
  stationName: 'Hub One',
  address: 'MG Road, Hyderabad',
  helpNumber: null,
  vehicleRegNo: 'KA01AB1234',
  energyPaise: 30000,
  ratePaise: 3000,
  taxPaise: 5400,
  taxPercent: 18,
  totalPaise: 35400,
};

beforeEach(() => {
  jest.clearAllMocks();
  api.getSessions.mockResolvedValue([DONE, LIVE]);
  api.getInvoice.mockResolvedValue(INVOICE);
});

describe('Charging History', () => {
  it('lists newest first with tokens, cost and status; tabs filter with counts', async () => {
    await renderWithApp(<ChargingHistoryScreen />);

    expect(await screen.findByText('Hub Two')).toBeTruthy();
    expect(screen.getAllByText(/^Hub (One|Two)$/).map(n => n.props.children)).toEqual([
      'Hub Two',
      'Hub One',
    ]);
    expect(screen.getAllByText('12.40 kWh').length).toBe(2);
    expect(screen.getAllByText('45 min').length).toBe(2);
    expect(screen.getAllByText('C2').length).toBe(2);
    expect(screen.getAllByText('60 kW DC').length).toBe(2);
    expect(screen.getAllByText('₹356.50').length).toBe(2);
    expect(screen.getByText('In progress')).toBeTruthy();
    expect(screen.getByText('2 sessions')).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'Active' }));
    expect(screen.queryByText('Hub One')).toBeNull();
    expect(screen.getByText('Hub Two')).toBeTruthy();
  });

  it('both completed and active cards open the invoice', async () => {
    await renderWithApp(<ChargingHistoryScreen />);
    await fireEvent.press(await screen.findByLabelText(/^Hub Two, In progress/));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/invoice/[id]',
      params: { id: '42' },
    });
    await fireEvent.press(screen.getByLabelText(/^Hub One, Completed/));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: '/(app)/invoice/[id]',
      params: { id: '41' },
    });
  });

  it('empty and error states', async () => {
    api.getSessions.mockResolvedValueOnce([]);
    const empty = await renderWithApp(<ChargingHistoryScreen />);
    expect(await screen.findByText('No charging sessions yet')).toBeTruthy();
    await empty.unmount();

    api.getSessions.mockRejectedValueOnce(apiError('down', 'network'));
    await renderWithApp(<ChargingHistoryScreen />);
    expect(await screen.findByText("Couldn't load your charging history")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByText('Hub One')).toBeTruthy();
  });
});

describe('Invoice', () => {
  it('shows the receipt with session, location and billing split into SGST and CGST', async () => {
    await renderWithApp(<InvoiceScreen id="41" />);

    expect(await screen.findByText('Hub One')).toBeTruthy();
    expect(api.getInvoice).toHaveBeenCalledWith('41');
    expect(screen.getAllByText('₹354').length).toBeGreaterThan(0);
    expect(screen.getByText('9001')).toBeTruthy();
    expect(screen.getByText('10.00 kWh')).toBeTruthy();
    expect(screen.getByText('1h 20m')).toBeTruthy();
    expect(screen.getByText('20% → 80%')).toBeTruthy();
    expect(screen.getByText('CCS2 · C2')).toBeTruthy();
    expect(screen.getByText('KA01AB1234')).toBeTruthy();
    expect(screen.getByText('₹300')).toBeTruthy();
    expect(screen.getByText('₹30.00/kWh')).toBeTruthy();
    expect(screen.getByText('SGST (9%)')).toBeTruthy();
    expect(screen.getByText('CGST (9%)')).toBeTruthy();
    expect(screen.getAllByText('₹27').length).toBe(2);
    expect(screen.queryByText('Help line')).toBeNull();
  });

  it('Download saves the PDF and opens the share sheet', async () => {
    await renderWithApp(<InvoiceScreen id="41" />);
    await act(async () =>
      fireEvent.press(await screen.findByRole('button', { name: 'Download Invoice' })),
    );

    expect(api.downloadInvoicePdf).toHaveBeenCalledWith('41', 'invoice-9001.pdf');
    expect(sharing.shareAsync).toHaveBeenCalledWith(
      'file:///docs/invoice-9001.pdf',
      expect.objectContaining({ mimeType: 'application/pdf' }),
    );
    expect(toast.success).toHaveBeenCalledWith('Invoice saved');
  });

  it('a failed download says so', async () => {
    api.downloadInvoicePdf.mockRejectedValueOnce(new Error('404'));
    await renderWithApp(<InvoiceScreen id="41" />);
    await act(async () =>
      fireEvent.press(await screen.findByRole('button', { name: 'Download Invoice' })),
    );
    expect(toast.error).toHaveBeenCalledWith("Couldn't download the invoice. Please try again.");
    expect(sharing.shareAsync).not.toHaveBeenCalled();
  });

  it('an active session shows a note instead of Download', async () => {
    api.getInvoice.mockResolvedValueOnce({ ...INVOICE, status: 'active' });
    await renderWithApp(<InvoiceScreen id="42" />);
    expect(await screen.findByText(/still charging/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Download Invoice' })).toBeNull();
  });

  it('a failed load shows the error with Retry', async () => {
    api.getInvoice.mockRejectedValueOnce(apiError('down', 'network'));
    await renderWithApp(<InvoiceScreen id="41" />);
    expect(await screen.findByText("Couldn't load this invoice")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByText('Hub One')).toBeTruthy();
  });
});
