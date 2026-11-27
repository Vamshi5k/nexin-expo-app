import { File, Paths } from 'expo-file-system';

import { api, unwrap, type Envelope } from '@/core/api';
import { API_URL, CLIENT_TOKEN } from '@/core/config';
import { ENDPOINTS } from '@/core/endpoints';
import { sessionStore } from '@/core/session';

import type {
  ChargingSession,
  Invoice,
  InvoiceDto,
  SessionDto,
  SessionStatus,
} from '../types/history.types';
import { minutesBetween } from '../utils/history';

const num = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const text = (v: number | string | null | undefined): string | null => {
  const s = v === null || v === undefined ? '' : String(v).trim();
  return s ? s : null;
};

const paise = (v: number | string | null | undefined): number | null => {
  const n = num(v);
  return n === null ? null : Math.round(n * 100);
};

// TODO(backend): the blueprint says 1 completed, 2 in progress; the old app treated 0 as in
// progress and the rest as failed. Both 0 and 2 count as active (OPEN_QUESTIONS #27).
export const toStatus = (code: number | string | null | undefined): SessionStatus | null => {
  const n = num(code);
  if (n === null) return null;
  if (n === 1) return 'completed';
  if (n === 0 || n === 2) return 'active';
  return 'failed';
};

export const toSession = (dto: SessionDto): ChargingSession => {
  const wh = num(dto.totalWh);
  return {
    id: String(dto.id),
    transactionId: text(dto.transactionId),
    status: toStatus(dto.status) ?? 'failed',
    startedAt: text(dto.startDate),
    energyKwh: wh === null ? null : wh / 1000,
    durationMin: num(dto.charginDuration),
    costPaise: paise(dto.price),
    connectorId: text(dto.connectorId),
    sessionId: text(dto.session?.sessionId),
    powerKw: num(dto.charger?.capacity),
    powerType: text(dto.charger?.powerType),
    stationName: text(dto.charger?.station?.name) ?? '',
    address: text(dto.charger?.station?.stationLocation?.address) ?? '',
  };
};

// Same maths as the old invoice: energy charge = amount, rate = amount / kWh, tax split equally
// into SGST and CGST, total = price.
export const toInvoice = (dto: InvoiceDto): Invoice => {
  const wh = num(dto.totalWh);
  const kwh = wh === null ? null : wh / 1000;
  const energyPaise = paise(dto.amount);
  const place = dto.charger?.station?.stationLocation;
  const address = [place?.address, place?.city, place?.state, place?.pincode, place?.country]
    .map(part => text(part))
    .filter(Boolean)
    .join(', ');

  return {
    id: String(dto.id),
    transactionId: text(dto.transactionId),
    status: toStatus(dto.status),
    startedAt: text(dto.startDate),
    stoppedAt: text(dto.stopDate),
    durationMin: minutesBetween(text(dto.startDate), text(dto.stopDate)),
    energyKwh: kwh,
    startSoc: num(dto.startSoc),
    stopSoc: num(dto.stopSoc),
    chargerType: text(dto.charger?.powerType),
    connectorType: text(dto.connectorDetails?.portType),
    chargerId: text(dto.chargerId),
    connectorId: text(dto.connectorId),
    stationName: text(dto.charger?.station?.name) ?? '',
    address,
    helpNumber: text(dto.charger?.station?.helpNumber),
    vehicleRegNo: text(dto.vehicle?.regNo)?.toUpperCase() ?? null,
    energyPaise,
    ratePaise: energyPaise !== null && kwh ? Math.round(energyPaise / kwh) : null,
    taxPaise: paise(dto.gst),
    taxPercent: num(dto.calcTaxPercent),
    totalPaise: paise(dto.price),
  };
};

export const historyApi = {
  getSessions: async (): Promise<ChargingSession[]> => {
    const res = await api.get<Envelope<{ transactions?: SessionDto[] | null } | null>>(
      ENDPOINTS.CHARGING.HISTORY,
    );
    return (unwrap(res)?.transactions ?? []).map(toSession);
  },

  getInvoice: async (transactionId: string): Promise<Invoice> => {
    const res = await api.get<Envelope<InvoiceDto>>(ENDPOINTS.INVOICE.SUMMARY(transactionId));
    return toInvoice(unwrap(res));
  },

  // Saves the invoice PDF into the app's documents and returns the file's uri. Sent with the
  // signed-in token like any API call (the summary request just before keeps it fresh).
  downloadInvoicePdf: async (transactionId: string, fileName: string): Promise<string> => {
    const token = sessionStore.getState().tokens?.accessToken;
    const target = new File(Paths.document, fileName);
    const file = await File.downloadFileAsync(
      `${API_URL}${ENDPOINTS.INVOICE.PDF(transactionId)}`,
      target,
      {
        headers: {
          Accept: 'application/pdf',
          'x-client-token': CLIENT_TOKEN,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        idempotent: true,
      },
    );
    return file.uri;
  },
};
