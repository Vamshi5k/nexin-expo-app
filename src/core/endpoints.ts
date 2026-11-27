export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/app/login',
    VERIFY: '/auth/app/verify',
    REFRESH: '/auth/refresh',
    USER: '/auth/user-by-token',
    FCM: '/auth/fcm',
    LOGOUT: '/auth/logout',
  },
  FLEET: {
    LOGIN: '/fleet/login',
    VERIFY_OTP: '/fleet/verify-otp',
    RESEND_OTP: '/fleet/resend-otp',
    DRIVER: '/fleet/get-by-token',
    LOGOUT: '/fleet/logout',
  },
  CLIENT: {
    INFO: '/client/info',
  },
  STATIONS: {
    LOCATIONS: '/station/locations',
    LIST: '/station',
    DETAILS: (stationId: string) => `/station/${stationId}`,
    FAVOURITES: '/station/favourites/all',
    FAVOURITE: (stationId: string) => `/station/favourites/${stationId}`,
  },
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    SEND_OTP: '/profile/send-otp',
    VERIFY_OTP: '/profile/verify-otp',
    // TODO(backend): unconfirmed, not called yet (OPEN_QUESTIONS #19).
    DELETE: '/profile',
  },
  WALLET: {
    TRANSACTIONS: '/transactions',
    COUPONS: '/coupon',
    ORDER: '/payment',
    VERIFY: '/payment/verify',
  },
  VEHICLES: {
    ADD: '/vehicle',
    BRANDS: '/vehicle/brand',
    MODELS: (brandId: string) => `/vehicle/model/${brandId}`,
    CAPACITIES: (modelId: string) => `/vehicle/capacity/${modelId}`,
  },
} as const;
