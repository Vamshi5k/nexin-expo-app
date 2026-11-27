import type { ChargingSession, HistoryTab } from '../types/history.types';

export function minutesBetween(start: string | null, stop: string | null): number | null {
  if (!start || !stop) return null;
  const ms = new Date(stop).getTime() - new Date(start).getTime();
  return Number.isFinite(ms) && ms >= 0 ? Math.floor(ms / 60000) : null;
}

// "45 min", "1h 20m", "2h".
export function formatDuration(minutes: number | null): string | null {
  if (minutes === null || minutes < 0) return null;
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

// "12.40 kWh"; tiny sessions keep three decimals so they never read as zero.
export function formatKwh(kwh: number | null): string | null {
  if (kwh === null) return null;
  return `${kwh.toFixed(kwh > 0 && kwh < 0.1 ? 3 : 2)} kWh`;
}

export function filterSessions(sessions: ChargingSession[], tab: HistoryTab): ChargingSession[] {
  if (tab === 'all') return sessions;
  return sessions.filter(session => session.status === tab);
}

// Newest first; sessions without a date go last.
export function sortSessions(sessions: ChargingSession[]): ChargingSession[] {
  const time = (s: ChargingSession) => (s.startedAt ? new Date(s.startedAt).getTime() : -Infinity);
  return [...sessions].sort((a, b) => time(b) - time(a));
}

export type MonthGroup = { key: string; date: string | null; sessions: ChargingSession[] };

// One group per calendar month, in list order, for the small month labels.
export function groupByMonth(sessions: ChargingSession[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const session of sessions) {
    const d = session.startedAt ? new Date(session.startedAt) : null;
    const key = d && Number.isFinite(d.getTime()) ? `${d.getFullYear()}-${d.getMonth()}` : 'none';
    const last = groups[groups.length - 1];
    if (last?.key === key) last.sessions.push(session);
    else groups.push({ key, date: key === 'none' ? null : session.startedAt, sessions: [session] });
  }
  return groups;
}

export const invoiceFileName = (transactionId: string | null, id: string) =>
  `invoice-${(transactionId ?? id).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;

// "12 Nov 2026, 3:40 pm" in the brand's locale; null for a missing or broken date.
export function formatDateTime(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// "November 2026" for the month labels.
export function formatMonth(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
    : null;
}

// "9%" -> "9", "4.5" stays "4.5": half of the total tax rate for SGST and CGST.
export const halfPercent = (percent: number) => {
  const half = percent / 2;
  return Number.isInteger(half) ? String(half) : half.toFixed(1);
};
