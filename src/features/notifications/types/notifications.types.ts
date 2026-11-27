export type NotificationKind =
  'offers' | 'new_station' | 'maintenance' | 'customer_support' | 'information';

export type NotificationFilter = 'all' | NotificationKind;

export type NotificationDto = {
  id: number | string;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  createdAt?: string | null;
  isRead?: boolean | null;
};

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string | null;
  read: boolean;
};
