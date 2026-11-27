/**
 * Dynamic Expo config. Everything client-specific comes from brand/; everything
 * secret or machine-specific comes from process.env (EAS env vars or a local .env).
 * See docs/WHITE_LABEL.md and .env.example.
 */
// Expo compiles this file but not the TypeScript files it imports; tsx's require
// hook lets brand/*.ts load. Must stay the first import.
import 'tsx/cjs';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ConfigContext, ExpoConfig } from 'expo/config';

import brandConfig from './brand/brand.config';
import { resolveAppEnv, resolveEnv, type AppEnv } from './brand/env';
import { parseBrand } from './brand/schema';

const APP_ENV = resolveAppEnv(process.env.APP_ENV);
const brand = parseBrand(brandConfig);
const env = resolveEnv(APP_ENV, {
  API_HOST: process.env.API_HOST,
  SOCKET_URL: process.env.SOCKET_URL,
  CLIENT_TOKEN: process.env.CLIENT_TOKEN,
});

/** Suffixes let development, staging and production builds install side by side. */
const VARIANT: Record<AppEnv, { id: string; scheme: string; name: string }> = {
  development: { id: '.dev', scheme: '-dev', name: ' (Dev)' },
  staging: { id: '.staging', scheme: '-staging', name: ' (Stg)' },
  production: { id: '', scheme: '', name: '' },
};
const variant = VARIANT[APP_ENV];

/**
 * Firebase config files. On EAS these are "file" env vars, so process.env holds a
 * path to a temp copy. Locally, drop the files into brand/firebase/ (gitignored).
 * Returns undefined when no file exists so prebuild still works without Firebase.
 */
function firebaseFile(envVar: string | undefined, localName: string): string | undefined {
  if (envVar) return envVar;
  const local = resolve(__dirname, 'brand/firebase', localName);
  return existsSync(local) ? `./brand/firebase/${localName}` : undefined;
}

const USER_INTERFACE_STYLE = {
  system: 'automatic',
  light: 'light',
  dark: 'dark',
} as const satisfies Record<typeof brand.appearance, NonNullable<ExpoConfig['userInterfaceStyle']>>;

const scheme = `${brand.scheme}${variant.scheme}`;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `${brand.appName}${variant.name}`,
  slug: brand.slug,
  owner: brand.owner,
  scheme,
  version: '1.0.0',
  platforms: ['ios', 'android'],
  orientation: 'portrait',
  // Automatic so the in-app Appearance setting can follow the phone; the brand's choice is the
  // in-app default (ThemeProvider), not a native lock.
  userInterfaceStyle: USER_INTERFACE_STYLE.system,
  icon: './brand/assets/icon.png',

  ios: {
    bundleIdentifier: `${brand.bundleId}${variant.id}`,
    supportsTablet: false,
    googleServicesFile: firebaseFile(
      process.env.GOOGLE_SERVICE_INFO_PLIST,
      'GoogleService-Info.plist',
    ),
    associatedDomains: brand.deepLinkDomains.map(d => `applinks:${d}`),
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: `${brand.androidPackage}${variant.id}`,
    adaptiveIcon: {
      foregroundImage: './brand/assets/adaptive-icon.png',
      backgroundColor: brand.adaptiveIcon.backgroundColor,
    },
    predictiveBackGestureEnabled: false,
    googleServicesFile: firebaseFile(process.env.GOOGLE_SERVICES_JSON, 'google-services.json'),
    intentFilters: brand.deepLinkDomains.length
      ? [
          {
            action: 'VIEW',
            autoVerify: true,
            data: brand.deepLinkDomains.map(host => ({ scheme: 'https', host })),
            category: ['BROWSABLE', 'DEFAULT'],
          },
        ]
      : undefined,
  },

  plugins: [
    'expo-router',
    // Dev builds only: hide the floating tools button so it never covers primary actions.
    // The dev menu still opens with a shake (or `adb shell input keyevent 82`).
    ['expo-dev-client', { toolsButton: false }],
    [
      'expo-splash-screen',
      {
        image: './brand/assets/splash.png',
        imageWidth: brand.splash.imageWidth,
        resizeMode: 'contain',
        backgroundColor: brand.splash.backgroundColor,
        ...(brand.splash.darkBackgroundColor
          ? {
              dark: {
                image: './brand/assets/splash.png',
                backgroundColor: brand.splash.darkBackgroundColor,
              },
            }
          : {}),
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: `${brand.appName} uses your location to show charging stations near you.`,
      },
    ],
    // Keys come only from env. Without the iOS key the app falls back to Apple Maps.
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_KEY,
        iosGoogleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY,
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: `${brand.appName} uses the camera to scan charger QR codes.`,
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-notifications',
      { icon: './brand/assets/notification-icon.png', color: brand.colors.primary },
    ],
    // Remaining native plugin slots, added in the phases that need them:
    // - Firebase: '@react-native-firebase/app', '@react-native-firebase/messaging'
    //   (+ expo-build-properties { ios: { useFrameworks: 'static' } }).
    // - Payments: react-native-razorpay (needs a config plugin or prebuild patch).
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    appEnv: APP_ENV,
    env,
    brand,
    maps: {
      googleOnIos: Boolean(process.env.GOOGLE_MAPS_IOS_KEY),
      googleOnAndroid: Boolean(process.env.GOOGLE_MAPS_ANDROID_KEY),
    },
    ...(brand.easProjectId ? { eas: { projectId: brand.easProjectId } } : {}),
  },
});
