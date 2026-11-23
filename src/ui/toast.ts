/**
 * The ONLY file that imports sonner-native. Screens use `toast` and the root layout
 * mounts `<AppToaster />`; both are themed from tokens and work in light and dark.
 */
import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import { createElement } from 'react';
import { Toaster, toast as sonner } from 'sonner-native';

import { useTheme } from '@/theme';

import { haptics } from './haptics';

type Options = { description?: string; duration?: number };

type PromiseMessages<T> = {
  loading: string;
  success: string | ((result: T) => string);
  error: string | ((error: unknown) => string);
};

export const toast = {
  success(message: string, options?: Options) {
    haptics.success();
    return sonner.success(message, options);
  },
  error(message: string, options?: Options) {
    haptics.error();
    return sonner.error(message, options);
  },
  info(message: string, options?: Options) {
    return sonner.info(message, options);
  },
  /** Shows loading, then success or error; haptics follow the outcome. */
  promise<T>(promise: Promise<T>, messages: PromiseMessages<T>) {
    const tracked = promise.then(
      (value) => {
        haptics.success();
        return value;
      },
      (error: unknown) => {
        haptics.error();
        throw error;
      },
    );
    return sonner.promise(tracked, {
      loading: messages.loading,
      success: (r: T) =>
        typeof messages.success === 'function' ? messages.success(r) : messages.success,
      error: messages.error,
    });
  },
  dismiss(id?: string | number) {
    return sonner.dismiss(id);
  },
};

/** Mount once in the root layout. */
export function AppToaster() {
  const t = useTheme();
  const c = t.colors;
  const icon = (Icon: typeof Info, color: string) =>
    createElement(Icon, { color, size: 20, strokeWidth: 1.75 });

  return createElement(Toaster, {
    position: 'top-center',
    theme: t.scheme,
    duration: 3500,
    visibleToasts: 3,
    swipeToDismissDirection: 'up',
    maxFontSizeMultiplier: t.layout.maxFontScale,
    icons: {
      success: icon(CircleCheck, c.success),
      error: icon(CircleAlert, c.danger),
      info: icon(Info, c.accentText),
    },
    toastOptions: {
      style: {
        backgroundColor: c.surfaceRaised,
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: c.border,
        ...t.shadow,
      },
      titleStyle: { ...t.type.subhead, color: c.textPrimary },
      descriptionStyle: { ...t.type.caption, color: c.textSecondary },
    },
  });
}
