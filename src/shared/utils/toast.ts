import { createElement } from 'react';

import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import { Toaster, toast as sonner } from 'sonner-native';

import { useTheme } from '@/shared/theme';

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
  promise<T>(promise: Promise<T>, messages: PromiseMessages<T>) {
    const tracked = promise.then(
      value => {
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

export const AppToaster = () => {
  const t = useTheme();
  const c = t.colors;
  const icon = (Icon: typeof Info, color: string) =>
    createElement(Icon, { color, size: 20, strokeWidth: 1.75 });

  return createElement(Toaster, {
    position: 'bottom-center',
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
      },
      titleStyle: { ...t.type.subhead, color: c.textPrimary },
      descriptionStyle: { ...t.type.caption, color: c.textSecondary },
    },
  });
};
