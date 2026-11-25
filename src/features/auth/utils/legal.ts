import * as WebBrowser from 'expo-web-browser';

import { log } from '@/core/log';
import { toast } from '@/shared/utils/toast';

// Not pure: opens the in-app browser and shows a toast when the link is missing or fails.
export const openLegal = async (url: string | null) => {
  if (!url) {
    toast.error('Link not available');
    return;
  }

  try {
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    log.warn('could not open legal link', { error: String(error) });
    toast.error('Unable to open link');
  }
};
