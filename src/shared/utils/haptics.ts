import * as Haptics from 'expo-haptics';

import { log } from '@/core/log';

function safe(run: () => Promise<void>) {
  run().catch((e: unknown) => log.debug('haptics unavailable', { e: String(e) }));
}

export const haptics = {
  selection: () => safe(() => Haptics.selectionAsync()),
  light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

export type HapticKind = keyof typeof haptics;
