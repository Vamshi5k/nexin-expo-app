type NumberLike = number | string | null | undefined;

export type SessionStatus = 'completed' | 'active' | 'failed';

export type SessionDto = {
  id: number | string;
  transactionId?: number | string | null;
  status?: number | string | null;
  startDate?: string | null;
  totalWh?: NumberLike;
  charginDuration?: NumberLike;
  price?: NumberLike;
  connectorId?: number | string | null;
  session?: { sessionId?: string | null } | null;
  charger?: {
    capacity?: NumberLike;
    powerType?: string | null;
    station?: { name?: string | null; stationLocation?: { address?: string | null } | null } | null;
  } | null;
};

export type ChargingSession = {
  id: string;
  transactionId: string | null;
  status: SessionStatus;
  startedAt: string | null;
  energyKwh: number | null;
  durationMin: number | null;
  costPaise: number | null;
  connectorId: string | null;
  sessionId: string | null;
  powerKw: number | null;
  powerType: string | null;
  stationName: string;
  address: string;
};

export type InvoiceDto = {
  id: number | string;
  transactionId?: number | string | null;
  status?: number | string | null;
  startDate?: string | null;
  stopDate?: string | null;
  totalWh?: NumberLike;
  amount?: NumberLike;
  gst?: NumberLike;
  calcTaxPercent?: NumberLike;
  price?: NumberLike;
  startSoc?: NumberLike;
  stopSoc?: NumberLike;
  chargerId?: string | null;
  connectorId?: number | string | null;
  connectorDetails?: { portType?: string | null } | null;
  vehicle?: { regNo?: string | null } | null;
  charger?: {
    powerType?: string | null;
    station?: {
      name?: string | null;
      helpNumber?: string | null;
      stationLocation?: {
        address?: string | null;
        city?: string | null;
        state?: string | null;
        pincode?: string | number | null;
        country?: string | null;
      } | null;
    } | null;
  } | null;
};

export type Invoice = {
  id: string;
  transactionId: string | null;
  status: SessionStatus | null;
  startedAt: string | null;
  stoppedAt: string | null;
  durationMin: number | null;
  energyKwh: number | null;
  startSoc: number | null;
  stopSoc: number | null;
  chargerType: string | null;
  connectorType: string | null;
  chargerId: string | null;
  connectorId: string | null;
  stationName: string;
  address: string;
  helpNumber: string | null;
  vehicleRegNo: string | null;
  // Billing, all in paise: energy charge, tax split equally into SGST and CGST, and the total.
  energyPaise: number | null;
  ratePaise: number | null;
  taxPaise: number | null;
  taxPercent: number | null;
  totalPaise: number | null;
};

export type HistoryTab = 'all' | 'completed' | 'active';
