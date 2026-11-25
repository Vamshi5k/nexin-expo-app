import type { Href } from 'expo-router';

export const SETUP_STEPS = ['Profile', 'Vehicle', 'Permissions'] as const;

export const SETUP_HREF = {
  profile: '/(setup)/profile',
  vehicle: '/(setup)/vehicle',
  permissions: '/(setup)/permissions',
  home: '/(app)/(tabs)/home',
} as const satisfies Record<string, Href>;

export const NAME_MIN_LENGTH = 2;

// expo-notifications' native device token (FCM on Android, APNs on iOS) is sent until Firebase
// messaging is added; the backend's expected token type is unconfirmed (OPEN_QUESTIONS #13).
export const PUSH_TOKEN_SOURCE = 'device' as const;

export const PROFILE_COPY = {
  title: 'Complete your profile',
  subtitle: 'Tell us a bit about yourself to personalize your experience',
  nameLabel: 'Full Name',
  namePlaceholder: 'John Doe',
};

// One screen for both permissions (owner decision; BLUEPRINT A7 + A8). Row copy is from the
// two old screens; the title and subtitle are new.
export const PERMISSIONS_COPY = {
  title: 'Allow access',
  subtitle: 'Turn these on to find chargers near you and get charging updates.',
  location: {
    title: 'Location',
    description:
      'We use your location to find nearby EV charging stations and guide you there quickly.',
  },
  notifications: {
    title: 'Notifications',
    description: 'Get real-time updates and never miss important alerts',
  },
  locationNote: 'Your location is never stored or shared.',
  settingsNote: 'You can manage preferences in Settings anytime',
};
