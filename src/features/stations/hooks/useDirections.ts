import { useState } from 'react';
import { Linking, Platform } from 'react-native';

import { log } from '@/core/log';

import type { Coordinates } from '../types/stations.types';
import { mapsAppUrls } from '../utils/directions';

const openWithFallback = (url: string, fallback: string) =>
  Linking.openURL(url).catch(() =>
    Linking.openURL(fallback).catch((error: unknown) =>
      log.warn('could not open directions', { error: String(error) }),
    ),
  );

// iOS asks Apple Maps or Google Maps (BLUEPRINT B3); Android goes straight to Google Maps.
export const useDirections = () => {
  const [target, setTarget] = useState<Coordinates | null>(null);

  const open = (point: Coordinates) => {
    if (Platform.OS === 'ios') {
      setTarget(point);
      return;
    }

    const urls = mapsAppUrls(point);
    void openWithFallback(urls.googleAndroid, urls.web);
  };

  const choose = (app: 'apple' | 'google') => {
    if (!target) return;

    const urls = mapsAppUrls(target);
    setTarget(null);
    void openWithFallback(app === 'apple' ? urls.apple : urls.googleIos, urls.web);
  };

  return {
    chooserOpen: target !== null,
    open,
    close: () => setTarget(null),
    openApple: () => choose('apple'),
    openGoogle: () => choose('google'),
  };
};
