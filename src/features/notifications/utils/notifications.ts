import type {
  AppNotification,
  NotificationFilter,
  NotificationKind,
} from '../types/notifications.types';

const KIND_BY_KEY: Record<string, NotificationKind> = {
  offers: 'offers',
  offer: 'offers',
  newstation: 'new_station',
  maintenance: 'maintenance',
  customersupport: 'customer_support',
  support: 'customer_support',
  information: 'information',
  info: 'information',
};

// "New Station", "new_station", "NEW-STATION" -> 'new_station'; anything unknown is Information,
// as in the old app.
export function toKind(type: string | null | undefined): NotificationKind {
  const key = (type ?? '').toLowerCase().replace(/[\s_-]/g, '');
  return KIND_BY_KEY[key] ?? 'information';
}

export function filterNotifications(
  items: AppNotification[],
  filter: NotificationFilter,
): AppNotification[] {
  return filter === 'all' ? items : items.filter(item => item.kind === filter);
}

export const countByFilter = (items: AppNotification[], filter: NotificationFilter) =>
  filterNotifications(items, filter).length;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export type DayKey = 'today' | 'yesterday' | 'earlier' | 'none';

export function dayKey(iso: string | null, now: Date): DayKey {
  if (!iso) return 'none';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return 'none';
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return 'earlier';
}

export type DayGroup = { key: string; day: DayKey; date: string | null; items: AppNotification[] };

// Today, Yesterday, then one group per earlier date, in list order (newest first).
export function groupByDay(items: AppNotification[], now: Date): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const item of items) {
    const day = dayKey(item.createdAt, now);
    const key =
      day === 'earlier' && item.createdAt ? `d-${startOfDay(new Date(item.createdAt))}` : day;
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, day, date: item.createdAt, items: [item] });
  }
  return groups;
}

type RelativeCopy = {
  justNow: string;
  minutesAgo: (n: number) => string;
  hoursAgo: (n: number) => string;
};

// "Just now", "5 min ago", "3 h ago" for today; the time for older ones.
export function formatWhen(
  iso: string | null,
  now: Date,
  locale: string,
  copy: RelativeCopy,
): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  const minutes = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (dayKey(iso, now) === 'today' && minutes >= 0) {
    if (minutes < 1) return copy.justNow;
    if (minutes < 60) return copy.minutesAgo(minutes);
    return copy.hoursAgo(Math.floor(minutes / 60));
  }
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

export const formatDay = (iso: string | null, locale: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
    : null;
};
