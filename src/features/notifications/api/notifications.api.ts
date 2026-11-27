import { api, toPage, type Envelope, type Page } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';

import { KIND_LABEL, NOTIFICATIONS_COPY } from '../constants/notifications.constants';
import type { AppNotification, NotificationDto } from '../types/notifications.types';
import { toKind } from '../utils/notifications';

const text = (v: string | null | undefined) => v?.trim() ?? '';

// Title falls back to the type's label, then a plain "Notification", never blank.
export const toNotification = (dto: NotificationDto): AppNotification => {
  const kind = toKind(dto.type);
  return {
    id: String(dto.id),
    kind,
    title: text(dto.title) || KIND_LABEL[kind] || NOTIFICATIONS_COPY.fallbackTitle,
    message: text(dto.message),
    createdAt: dto.createdAt?.trim() || null,
    read: dto.isRead === true,
  };
};

// TODO(backend): marking as read (/notifications/:id/read was defined but never used by the old
// app) is unconfirmed, so reads stay on this device for now (OPEN_QUESTIONS #29).
export const notificationsApi = {
  getPage: async (page: number): Promise<Page<AppNotification>> => {
    const res = await api.get<Envelope<NotificationDto[] | null>>(ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { page },
    });
    const result = toPage(res);
    return { ...result, items: result.items.map(toNotification) };
  },
};
