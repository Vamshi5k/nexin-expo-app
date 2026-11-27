// Not pure: opens the system share sheet (Save to Files, Drive, mail…) through expo-sharing,
// loaded on demand so a dev build made before it was added reports instead of crashing.
import { log } from '@/core/log';

export type ShareResult = 'shared' | 'unavailable';

export async function sharePdf(uri: string, title: string): Promise<ShareResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sharing = require('expo-sharing') as typeof import('expo-sharing');
    if (!(await Sharing.isAvailableAsync())) return 'unavailable';
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: title,
    });
    return 'shared';
  } catch (error) {
    log.warn('could not open the share sheet', { error: String(error) });
    return 'unavailable';
  }
}
