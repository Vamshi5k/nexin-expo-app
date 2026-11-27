import { ENDPOINTS } from '@/core/endpoints';
import { toInvoice, toSession, toStatus } from '@/features/history/api/history.api';
import type { ChargingSession } from '@/features/history/types/history.types';
import {
  filterSessions,
  formatDuration,
  formatKwh,
  groupByMonth,
  halfPercent,
  invoiceFileName,
  minutesBetween,
  sortSessions,
} from '@/features/history/utils/history';

const session = (id: string, overrides: Partial<ChargingSession> = {}): ChargingSession => ({
  id,
  transactionId: null,
  status: 'completed',
  startedAt: null,
  energyKwh: null,
  durationMin: null,
  costPaise: null,
  connectorId: null,
  sessionId: null,
  powerKw: null,
  powerType: null,
  stationName: 'Hub',
  address: '',
  ...overrides,
});

describe('history mappers', () => {
  it('status: 1 completed, 0 and 2 active, others failed', () => {
    expect(toStatus(1)).toBe('completed');
    expect(toStatus('2')).toBe('active');
    expect(toStatus(0)).toBe('active');
    expect(toStatus(3)).toBe('failed');
    expect(toStatus(null)).toBeNull();
  });

  it('toSession reads energy in kWh, cost in paise and the station', () => {
    expect(
      toSession({
        id: 41,
        transactionId: 9001,
        status: 1,
        startDate: '2026-11-12T10:00:00.000Z',
        totalWh: 12400,
        charginDuration: 45,
        price: '356.5',
        connectorId: 2,
        session: { sessionId: 'S-1' },
        charger: {
          capacity: 60,
          powerType: 'DC',
          station: { name: 'Hub One', stationLocation: { address: 'MG Road' } },
        },
      }),
    ).toEqual({
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
    });
    expect(toSession({ id: 2 })).toMatchObject({
      energyKwh: null,
      costPaise: null,
      stationName: '',
    });
  });

  it('toInvoice follows the old billing maths', () => {
    const invoice = toInvoice({
      id: 41,
      transactionId: 9001,
      status: 1,
      startDate: '2026-11-12T10:00:00.000Z',
      stopDate: '2026-11-12T11:20:00.000Z',
      totalWh: 10000,
      amount: 300,
      gst: 54,
      calcTaxPercent: 18,
      price: 354,
      startSoc: 20,
      stopSoc: 80,
      chargerId: 'CRZ_01',
      connectorId: 2,
      connectorDetails: { portType: 'CCS2' },
      vehicle: { regNo: 'ka01ab1234' },
      charger: {
        powerType: 'DC',
        station: {
          name: 'Hub One',
          helpNumber: '9876543210',
          stationLocation: { address: 'MG Road', city: 'Hyderabad', pincode: 500081 },
        },
      },
    });
    expect(invoice).toMatchObject({
      durationMin: 80,
      energyKwh: 10,
      energyPaise: 30000,
      ratePaise: 3000,
      taxPaise: 5400,
      taxPercent: 18,
      totalPaise: 35400,
      address: 'MG Road, Hyderabad, 500081',
      vehicleRegNo: 'KA01AB1234',
      connectorType: 'CCS2',
    });
  });

  it('endpoints', () => {
    expect(ENDPOINTS.CHARGING.HISTORY).toBe('/device-transactions');
    expect(ENDPOINTS.INVOICE.SUMMARY('41')).toBe('/invoice/summary/41');
    expect(ENDPOINTS.INVOICE.PDF('41')).toBe('/invoice/41');
  });
});

describe('history helpers', () => {
  it('formats duration, energy and the half tax rate', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(80)).toBe('1h 20m');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(null)).toBeNull();
    expect(formatKwh(12.4)).toBe('12.40 kWh');
    expect(formatKwh(0.05)).toBe('0.050 kWh');
    expect(halfPercent(18)).toBe('9');
    expect(halfPercent(5)).toBe('2.5');
    expect(minutesBetween('2026-11-12T10:00:00Z', '2026-11-12T09:00:00Z')).toBeNull();
  });

  it('sorts newest first, filters by tab and groups by month', () => {
    const list = sortSessions([
      session('1', { startedAt: '2026-10-02T10:00:00Z' }),
      session('2', { startedAt: '2026-11-12T10:00:00Z', status: 'active' }),
      session('3', { startedAt: '2026-11-01T10:00:00Z' }),
    ]);
    expect(list.map(s => s.id)).toEqual(['2', '3', '1']);
    expect(filterSessions(list, 'active').map(s => s.id)).toEqual(['2']);
    expect(filterSessions(list, 'completed').map(s => s.id)).toEqual(['3', '1']);
    expect(groupByMonth(list).map(g => g.sessions.map(s => s.id))).toEqual([['2', '3'], ['1']]);
  });

  it('invoice file names are safe', () => {
    expect(invoiceFileName('TX/9001', '41')).toBe('invoice-TX9001.pdf');
    expect(invoiceFileName(null, '41')).toBe('invoice-41.pdf');
  });
});
