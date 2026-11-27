// Not pure: reads the device push token and sends it to the API (PUT /auth/fcm).
import * as Notifications from 'expo-notifications';

import { authApi } from '@/features/auth';

import { log } from '@/core/log';

export async function syncPushToken(): Promise<void> {
  try {
    const token = await Notifications.getDevicePushTokenAsync();
    if (typeof token.data === 'string' && token.data) await authApi.registerPushToken(token.data);
  } catch (error) {
    log.warn('push token sync failed', { error: String(error) });
  }
}
