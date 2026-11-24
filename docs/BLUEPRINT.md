# Cruze EV → Expo Rebuild Blueprint
23 Nov 2026 · @Vamshi Animela

> **Notes for this repo (read first)**
> - Routes live in `src/app/`. Wherever this blueprint says `app/...`, read `src/app/...`.
> - The old app is at `../Cruzev_nexin_whitelable_app` (read-only reference).
> - This blueprint describes Cruze EV. In this template, every brand value it mentions (colours, hosts, client tokens, scheme, bundle id, domains, ₹ amounts, Hyderabad region, phone regex) comes from `brand/` via `src/core/config`, never inline.
> - "Theme tokens to copy" (section 5) are Cruze EV's brand values only. How the UI looks is defined by `docs/DESIGN.md`, which wins on any visual question.
> - The phase numbering in section 7 is the original plan. The phase prompts you receive take precedence (Phase 1 = foundation, Phase 2 = client config + auth, and so on).
> - Items marked "confirm with backend" go in `docs/OPEN_QUESTIONS.md`; implement behind a named constant, don't guess silently.

## 1. Overview of the current app

Cruze EV is a bare React Native 0.83.1 (React 19.2, TypeScript) white-label EV charging app with two modes: consumer (find stations, scan QR, prepay from wallet, live charging, invoices) and fleet driver (assigned vehicle, running session, session history). It has 33 root-stack routes, 5 bottom tabs, about 20 modals and about 42k lines in src/. This blueprint is verified against main @ ee9a672; the repo also holds a longer MIGRATION_AUDIT.md (2026-11-19) and docs/screen-audit.md (verbatim UI copy per screen) to keep open while building.

### Tech stack today

| Concern | Current library | Notes |
|---|---|---|
| Navigation | React Navigation 7 (native-stack + bottom-tabs) | One flat root stack, no auth guard |
| State | 4 React Contexts (Auth, Fleet, Location, Wallet) | Location and Wallet contexts are dead stubs. Server data lives in screen useState |
| HTTP | axios + interceptors | Bearer token, x-client-token, 401 refresh queue |
| Realtime | socket.io-client 4.8 | Separate user and fleet sockets |
| Forms | formik + yup |  |
| Storage | AsyncStorage | Tokens stored unencrypted |
| Maps | react-native-maps (Google) + react-native-map-clustering | Custom style JSON in utils/mapsjson.ts |
| Location | react-native-get-location, android-location-enabler, react-native-permissions |  |
| QR | react-native-vision-camera 4 |  |
| Payments | react-native-razorpay | Key comes from server per order |
| Push | RN Firebase messaging + Notifee | Init is broken (see bugs) |
| PDF | react-native-blob-util | Invoice download |
| UI | lucide-react-native, react-native-svg, multi-slider, simple-toast | Inter font |

### Source folders

| Folder | What lives there |
|---|---|
| src/api/ | client.ts (axios), interceptors.ts, endpoints.ts |
| src/services/api/ | Thin wrappers: auth, stations, user, vehicle, wallet (sessions, trip unused) |
| src/services/ | location, notification, storage (payment and socket files are empty) |
| src/context/ | AuthContext, FleetContext (+ dead Location, Wallet) |
| src/navigations/ | AppNavigator.tsx (root stack + offline overlay), AppStack.tsx (tabs), linking.ts |
| src/screens/ | auth, map, stations, charging, scanner, wallet, profile, fleet, Nointernet |
| src/components/ | Buttons, Cards, Forms, Headers, Modals, Sections, Skeletons, Maps, Tabs, ConnectorTypes SVGs |
| src/theme/ | colors (teal #00C8D0, bg #F4FBFC), fonts, fontSizes, radius, spacing |
| src/utils/ | Mappers (station, fleet, invoice), status, distance, currency, date, permissions, network hook |

### Environments and config

All API paths are relative to API_URL = ${API_HOST}/v1. Every request sends Authorization: Bearer <token> (when logged in) and x-client-token: <CLIENT_TOKEN>, which identifies the tenant.

| Env | API_HOST and SOCKET_URL | CLIENT_TOKEN |
|---|---|---|
| development | https://852m8pd3-8080.inc1.devtunnels.ms | bf6af0f0-…-67eef6e68a06 |
| staging | https://testapi.evechos.com | bf6af0f0-…-67eef6e68a06 |
| production | https://api.nexinev.com | c7ba30bc-…-deddf96cd68d |

Other constants: timeout 20000 ms, deep-link scheme cruzeev, web domain cruzeev.com, delete-account URL https://www.cruzeev.in/delete-account, bundle ID com.cruzeev.app. Runtime branding (logo, brand name, terms/privacy/support URLs, feature flags) comes from GET /client/info.

### Bugs to fix in the rebuild, not copy

1.  Push notifications are never initialised: App.tsx only calls the init cleanup on unmount, so foreground pushes, Android channels, tap routing and FCM token refresh never run.
2.  Notification taps route to screens that don't exist (ChargingScreen, ChargingProgress, Offers).
3.  APP_ENV is hard-coded to "production" in src/constants/env.ts, so every build hits production.
4.  Keystore passwords and Google Maps keys are committed to the repo.
5.  Tokens sit in AsyncStorage and are logged on every request (ACCESS TOKEN:).
6.  No auth guard: deep links like cruzeev://wallet/add open while logged out.
7.  AddMoney receives an onSuccess function as a route param (not serialisable).
8.  MAC ID input caps at 12 chars while its placeholder AA:BB:CC:DD:EE:FF is 17.
9.  Edit Vehicle calls useEffect inside a Formik render prop.
10.  Profile menu shows "Loading…" forever when /profile fails.
11.  socket.off('meterValue') with no handler removes every listener.
12.  If both user and fleet tokens exist, fleet calls go out with the user token.

## 2. API layer and endpoints

The app calls 50 endpoints across 9 feature areas, plus 5 Socket.IO events. Port exactly these; everything else in endpoints.ts (/sessions/*, /trips/*, /payments/*, /support/*, /stations/search, reviews, /wallet/add, login-with-password) is never called.

### HTTP client rules to reproduce

- Base URL: ${API_HOST}/v1, timeout 20 s, withCredentials: true.
- Headers on every request: Authorization: Bearer <access token> and x-client-token: <CLIENT_TOKEN>.
- Envelope: most responses are { success, message, data, pagination? }. Pagination is inconsistent: some return pagination.currentPage, others pagination.page, all with totalPages. Normalise this in one place.
- 401 refresh: on a 401, queue concurrent requests, call POST /auth/refresh { refreshToken } once with a plain client (with x-client-token), save the new accessToken + refreshToken, replay the queue. If refresh returns 4xx, log out; on network/5xx, keep the session.
- Error text: response.data.message || error.message || fallback.
- Session cookie: POST /auth/app/verify sends only { otp, appName } and /fleet/verify-otp only { otp }. The server ties the OTP to the earlier login call, most likely via a cookie. Test this first in Expo.
- Startup session check: if /auth/user-by-token returns 4xx (except 408, 429), clear tokens and go to Login. Any other failure keeps the token and shows Retry on Splash.

### Config and auth (consumer)

| Method | Path | Request | Response fields used | Used by |
|---|---|---|---|---|
| GET | /client/info?details=true&login=true&logo=true&clientDetails=true | none | data.clientDetails.{brandName, termsAndConditionsUrl, privacyPolicyUrl, supportUrl, logoUrl}, data.media.{url, base64}, data.loginConfig.userLoginType ('Email' or phone), data.features.{fleetFeature, couponFeature} | App start (cached as CLIENT_CONFIG) |
| POST | /auth/app/login | { contact } | any data = OTP sent | Login, OTP resend |
| POST | /auth/app/verify | { otp, appName: 'CruzeEV' } | top-level userAccessToken \|\| accessToken, userRefreshToken \|\| refreshToken | OTP |
| GET | /auth/user-by-token | none | data.user.{id, userId, first_name, last_name, email, phone, isFirstLogin, wallet.balance, is_email_verified, is_phone_verified, gst} | Startup, after login, after payment |
| POST | /auth/refresh | { refreshToken } | accessToken, refreshToken | Interceptor |
| PUT | /auth/fcm | { fcmToken } | none | After login, token refresh |
| POST | /auth/logout | none | none | Logout (best effort) |

### Profile

| Method | Path | Request | Response fields used | Used by |
|---|---|---|---|---|
| GET | /profile | none | user fields + data.stats.{totalVehicles, totalChargingSessions, totalFavourites} | Profile tab |
| PUT | /profile | setup: { first_name }; edit: changed subset of { first_name, last_name, email, phone, gst } | none | Profile Setup, Edit Profile |
| POST | /profile/send-otp | { contact } | none | Edit Profile (verify new email/phone) |
| POST | /profile/verify-otp | { contact, otp } | none | Edit Profile |

### Vehicles

| Method | Path | Request | Response fields used | Used by |
|---|---|---|---|---|
| GET | /vehicle | none | data[].{id, regNo, vinNumber, maxAmount, autoCharge, isPrimary, capacityId, capacity (number or {capacity}), range, variant, modelId, model.{id, name, brand.name}} | My Vehicles, Charging Summary, Auto Charge |
| POST | /vehicle | { modelId, regNo, capacityId? \| capacity?, vinNumber?, maxAmount? } | status 201 | Vehicle Setup, Add Vehicle |
| PUT | /vehicle/:id | same as POST | status 200 | Edit Vehicle |
| PATCH | /vehicle/:id | { autoCharge } | none | My Vehicles toggle |
| PATCH | /vehicle/primary/:id | none | none | Set primary |
| DELETE | /vehicle/:id | none | none | Delete vehicle |
| PUT | /vehicle/:id?type=Charging | { modelId, regNo, vinNumber: macId, maxAmount } | 2xx | Add Auto Charge sheet |
| POST | /vehicle/:id?type=Charging | same | data.success | Auto Charge Enable screen (confirm PUT vs POST with backend) |
| GET | /vehicle/brand | none | data[].{id, name} | Vehicle forms |
| GET | /vehicle/model/:brandId | none | data[].{id, name} | Vehicle forms |
| GET | /vehicle/capacity/:modelId | none | data[].{id, capacity \| value, range} | Vehicle forms |

### Stations and favourites

| Method | Path | Request | Response fields used | Used by |
|---|---|---|---|---|
| GET | /station/locations | query min_power_output?, stationType?, connectorTypes? (csv) | data[].{id, name, stationUniqueId, stationType, status \| stationStatus, stationLocation.{latitude, longitude}} | Map markers (all stations) |
| GET | /station | query latitude, longitude, limit, page, search?, min_power_output?, stationType?, connectorTypes? | data[].{id, name, distance, totalConnectors, availableConnectors, connectorTypes (csv), maxPowerOutput, minStartingPrice, status, stationLocation.{address, city, latitude, longitude}}, pagination.{currentPage, totalPages} | Map cards, Stations list |
| GET | /station/:id | none | data.{id, name, status, helpNumber, amenities[].name, stationMedia[0].url, stationLocation.{…}, chargers[].{id, chargerId, capacity, powerType, status, tariff[0].price, connectors[].{id, connectorId, portType, status, currentSoc, estimatedFullChargeMinutes}}} | Station Details |
| GET | /station/charger/:chargerId | query connectorId? | data.{chargerId, powerType, capacity, station.name, tariff[0].{price, gst}, connectors[0].{connectorId, portType, status}} | Charging Summary |
| GET | /station/favourites/all | query page, limit, search? | data[].{stationId, station.{name, stationLocation}}, pagination.{currentPage, totalPages} | Favourites, Stations, Station Details |
| POST | /station/favourites/:stationId | { isFavourite } (new desired state) | data.message | Heart toggle |

### Charging sessions and invoices

| Method | Path | Request | Response fields used | Used by |
|---|---|---|---|---|
| POST | /ocpp/start/:chargerId?platform=ios\|android | { connectorId, amount, energy, percentage? } (percentage only on Battery tab) | data = sessionId | Charging Summary |
| POST | /ocpp/stop/:chargerId?platform= | { transactionId } | data.sessionId | Active Charging |
| GET | /device-transactions/running-transaction | none | data = array of running sessions, each with sessionId | After login, app start ("resume charging" card) |
| GET | /device-transactions/running/:sessionId | none | data.transaction.{id, transactionId, chargerId, status, startDate, updatedAt, totalWh, calcPrice, calcTaxPercent, price, startSoc, stopSoc, targetKwh, vehicleId, macId, charger.{powerType, chargerId, station.{name, location, helpNumber}}}, data.connectorDetails[0].portType, data.latestTransactionDetail.{batteryPercentage, powerOffered, currentImportEv} | Active Charging, Session Summary |
| GET | /device-transactions | none (not paginated) | data.transactions[].{id, transactionId, status, startDate, totalWh, charginDuration, price, connectorId, session.sessionId, charger.{capacity, powerType, station.{name, stationLocation.address}}} | Charging History |
| GET | /invoice/summary/:id | none | data.{id, transactionId, startDate, stopDate, totalWh, amount, gst, calcTaxPercent, price, startSoc, stopSoc, chargerId, connectorId, connectorDetails.portType, vehicle.regNo, user.{first_name, email}, charger.{powerType, station.{name, helpNumber, stationLocation.{address, city, state, pincode, country}}}} | Invoice |
| GET | /invoice/:id | none | binary PDF | Invoice download |

### Wallet and payments

| Method | Path | Request | Response fields used | Used by |
|---|---|---|---|---|
| GET | /transactions | query limit, page | data[].{refNo, type ('Credit' or debit), amount, createdAt, charger.station.name}, pagination.{page, totalPages} | Wallet, Wallet History |
| GET | /coupon | none | data[].{id, code, description, cashbackPercent, amount (min), endDate, status} | Add Money (when couponFeature) |
| POST | /payment | { amount, couponId \| null } | data.{keyId, orderId, amount, currency, companyName} | Add Money: create Razorpay order |
| POST | /payment/verify | { razorpay_payment_id, razorpay_order_id, razorpay_signature } | none | After Razorpay success, then refresh user |

Wallet balance itself comes from user.wallet.balance (/auth/user-by-token), not from /wallet.

### Notifications

| Method | Path | Request | Response fields used | Used by |
|---|---|---|---|---|
| GET | /notification?page= | none | data[].{id, type, title, message, createdAt, isRead}, pagination.totalPages | Notifications |

### Fleet driver

| Method | Path | Request | Response fields used | Used by |
|---|---|---|---|---|
| POST | /fleet/login | { fleetId, contact } | data.driverId | Fleet Login |
| POST | /fleet/verify-otp | { otp } | userAccessToken, userRefreshToken | Fleet OTP |
| POST | /fleet/resend-otp | { driverId } | any data | Fleet OTP |
| GET | /fleet/get-by-token | none | data.{id, fleetId, name, phone, email, licenseNumber, aadharNumber, panNumber, address, drId, status, type} | Startup, Fleet Profile |
| GET | /fleet/logout | none (GET, not POST) | none | Fleet logout |
| GET | /fleet/assigned-vehicle | none | data.{status, startDate, startTime, endTime, vehicle.{regNo, model.{name, brand.name}}} | Fleet Home |
| GET | /fleet/running-transaction | none | data[0].{chargerId, transaction.{transactionId, startDate, stopDate, startSoc, stopSoc}, latestTransactionDetail.batteryPercentage} | Fleet Home |
| POST | /fleet/ocpp/stop?platform= | { transactionId, chargerId } | none | Fleet Home stop |
| GET | /fleet/transaction?page&limit=5 | none | data[].{id, transactionId, status, startDate, totalWh, price, connectorId, session.sessionId, charger.{…}}, pagination.{page, totalPages} | Fleet Sessions |
| GET | /fleet/running/:sessionId | none | data.{sessionId, transaction.{…}, connectorDetails[0].portType, latestTransactionDetail.{batteryPercentage, voltageEv, currentImportEv, powerOffered}} | Fleet Invoice |
| PUT | /fleet/update-profile | { name, email, address } | success | Edit Fleet Profile |

### Socket.IO (realtime)

Connect to SOCKET_URL with autoConnect: false, reconnection 5 attempts every 2 s. Connect after login and emit join with the user id (fleet: fleet user id).

| Event | Direction | Where | Payload and effect |
|---|---|---|---|
| join | emit | On connect (user.id), Charging Summary (chargerId, then sessionId), Active Charging (sessionId) | Subscribe to a room |
| StartTransaction | listen | Charging Summary | Payload is the sessionId; navigate to Active Charging |
| status | listen | Charging Summary | Re-fetch charger details (connector status) |
| meterValue | listen | Active Charging | Silently re-fetch /device-transactions/running/:sessionId |
| StopTransaction | listen | Active Charging | Toast, then replace with Charging Session Summary |

Fleet screens use no socket events; they re-fetch on focus.

## 3. Navigation map

Today every route is a sibling in one flat stack with no auth guard. In Expo Router, split them into four route groups and let the session pick the group, so a logged-out deep link can never open a signed-in screen.
OTP sends a first-time user through (setup), a returning user straight to (app), and a driver to (fleet). Logout from either session lands on Login.

### Old route → new Expo Router file

| Old route (params) | New file | Group |
|---|---|---|
| Splash | app/index.tsx (redirect only) | root |
| Onboarding | app/(auth)/onboarding.tsx | auth |
| Login | app/(auth)/login.tsx | auth |
| OTP (type, value) | app/(auth)/otp.tsx | auth |
| FleetLogin | app/(auth)/fleet-login.tsx | auth |
| FleetOtp (contact, fleetId, driverId) | app/(auth)/fleet-otp.tsx | auth |
| ProfileSetup | app/(setup)/profile.tsx | setup |
| VehicleSetup | app/(setup)/vehicle.tsx | setup |
| LocationPermission | app/(setup)/location.tsx | setup |
| NotificationPermission | app/(setup)/notifications.tsx | setup |
| MainApp → Map | app/(app)/(tabs)/index.tsx | app |
| MainApp → Stations (fromMap?) | app/(app)/(tabs)/stations.tsx | app |
| MainApp → Wallet | app/(app)/(tabs)/wallet.tsx | app |
| MainApp → Profile | app/(app)/(tabs)/profile.tsx | app |
| QRScanner | app/(app)/scan.tsx (modal presentation) | app |
| StationDetails (stationId) | app/(app)/station/[stationId].tsx | app |
| ChargingSummary (chargerId, connectorId) | app/(app)/charging/summary.tsx | app |
| ActiveCharging (sessionId) | app/(app)/charging/[sessionId]/index.tsx | app |
| ChargingSessionSummary (sessionId) | app/(app)/charging/[sessionId]/complete.tsx | app |
| ChargingHistory (defaultFilter?) | app/(app)/charging/history.tsx | app |
| AutoChargeEnable (macId) | app/(app)/charging/auto-charge.tsx | app |
| ChargingInvoice (id) | app/(app)/invoice/[id].tsx | app |
| WalletHistory | app/(app)/wallet/history.tsx | app |
| AddMoney (amount?, source?) | app/(app)/wallet/add.tsx | app |
| MyVechiles | app/(app)/vehicles/index.tsx | app |
| AddVehicle | app/(app)/vehicles/add.tsx | app |
| EditVehicle (vehicle object) | app/(app)/vehicles/[vehicleId]/edit.tsx (id only) | app |
| EditProfile | app/(app)/profile/edit.tsx | app |
| FavoriteSpots | app/(app)/favorites.tsx | app |
| Notifications | app/(app)/notifications.tsx | app |
| FleetHome | app/(fleet)/fleet/index.tsx | fleet |
| FleetSessions | app/(fleet)/fleet/sessions.tsx | fleet |
| FleetInvoiceScreen (id) | app/(fleet)/fleet/invoice/[id].tsx | fleet |
| FleetProfile | app/(fleet)/fleet/profile.tsx | fleet |
| EditFleetProfile | app/(fleet)/fleet/profile-edit.tsx | fleet |

The middle tab is a button, not a screen: render a custom tabBarButton that calls router.push('/scan'), so the camera never mounts inside the tab bar.

## 4. Feature-by-feature screen specs

Each screen below lists what it shows, the API calls behind it, user actions, states and what to fix. Build them in this order; verbatim UI copy for every screen is in docs/screen-audit.md.

### Feature A: Launch and consumer auth

#### A1. Splash (Splash, initial route)

- Shows: pulsing Zap icon today (use the client logo instead). On failure: "Can't connect right now" / "Check your internet connection and try again." + Try Again.
- API (via providers): /client/info, /auth/user-by-token (if access_token), /fleet/get-by-token (if fleetToken).
- Routing: fleet user → FleetHome; user with isFirstLogin → ProfileSetup; user → MainApp; else firstlogin flag set → Login, otherwise → Onboarding.
- States: loading; error after startup failure or a 25 s timeout.
- Expo: hold the native splash with expo-splash-screen until auth resolves; no second JS splash.

#### A2. Onboarding (Onboarding)

- Shows (static): 3 slides — "Find Chargers" (Discover nearby charging stations with live availability and pricing), "Start Charging" (Select a charger, enter amount, and start or stop charging instantly), "Pay & Track" (Make secure payments, track sessions, manage vehicles, and get updates).
- Actions: swipe, Next, last slide Get Started → Login, Skip → Login.
- Storage: sets firstlogin = 'completed' (do it on completion, not on mount).

#### A3. Login (Login)

- Shows: BrandLogo, "Enter mobile number" / "Enter email", phone or email input, "Use email instead" toggle (hidden when loginType === 'Email'), "Fleet Login" link (only if fleetFeature), Continue, Terms and Privacy links.
- API: POST /auth/app/login { contact }.
- Validation: phone ^\d{10}$; email valid format.
- Then: navigate to OTP with { type: 'phone' | 'email', value }.

#### A4. OTP (OTP)

- Shows: BrandLogo, "Enter verification code", "We've sent a 4-digit code to {value}", 4 boxes, "Resend in {n}s" (30 s), Verify, "Change Number/Email".
- API: POST /auth/app/verify { otp, appName } → save tokens → GET /auth/user-by-token → GET /device-transactions/running-transaction → PUT /auth/fcm { fcmToken }. Resend: POST /auth/app/login.
- Behaviour: auto-advance, paste fills all, auto-submit on 4th digit, invalid OTP clears boxes with toast "Invalid OTP. Please try again."
- Then: isFirstLogin → ProfileSetup; no location permission → LocationPermission; else reset to MainApp.
- Expo: use one hidden input with textContentType="oneTimeCode" / autoComplete="sms-otp" for autofill.

#### A5. Profile Setup (ProfileSetup)

- Shows: "Complete your profile", Full Name (prefilled from first_name), Terms & Privacy checkbox, Continue.
- API: PUT /profile { first_name }.
- Validation: name ≥ 2 chars, terms must be accepted.
- Then: toast "Profile updated successfully" → VehicleSetup.

#### A6. Vehicle Setup wizard (VehicleSetup)

- Steps: 1 brand grid (GET /vehicle/brand) → 2 model grid (GET /vehicle/model/:brandId) → 3 capacity grid "{capacity} kWh · {range} km range" + Custom (GET /vehicle/capacity/:modelId) → 4 details: Registration No (required, ≥ 6), MAC ID (optional, ≥ 6), Max Charging Amount ₹ (numeric).
- API: POST /vehicle { modelId, regNo (upper), capacityId | capacity, vinNumber? (upper), maxAmount? } expects 201.
- Header: Back, Skip, "Step n of 4" progress. Custom capacity 10–500 kWh.
- Then (skip or success): LocationPermission → NotificationPermission → MainApp, skipping steps already granted.
- Fix: MAC ID max length should be 17; add empty states; build one shared VehicleForm reused by Add and Edit Vehicle.

#### A7. Location Permission and A8. Notification Permission

- Location shows: "Enable Location", 3 benefit rows, Continue, "Your location is never stored or shared." Requests permission, gets a fix (Android GPS prompt), then moves on even if denied.
- Notification shows: "Enable notifications", rows for Charging Alerts, Maintenance Updates, Exclusive Offers, Enable Notifications, Skip for now. Then reset to MainApp.
- Fix: after notification permission is granted, fetch the FCM token and call PUT /auth/fcm (missing today, so iOS users may never register).

#### A9. No Internet overlay (global, not a route)

- Shows: WifiOff icon, "No Connection", "You're offline. Check your Wi-Fi or mobile data and try again.", Try Again; "Still offline — check your settings" after a failed retry.
- Logic: NetInfo + probe generate_204 URLs when unreachable, 3 s grace, poll every 5 s while offline, pause in background.
- Recommendation: use a non-blocking offline banner plus per-screen offline states.

### Feature B: Main tabs and station discovery

#### B0. Bottom tabs (MainApp)

Five tabs, icon-only: Map, Stations, Scanner (raised round button that pushes the QRScanner root screen), Wallet, Profile. Icons: Lucide Map, EvCharger, ScanLine, Wallet, User. Add labels in the rebuild.

#### B1. Map tab (Map, default tab)

- Shows: Google map with custom style, clustered markers for every station (colour by status), search pill "Search stations" (navigates to Stations with fromMap: true), Filter button, Active-charging button (when a session is running), my-location FAB, carousel of the 5 nearest StationCards (name, address + city, distance km, ETA, ₹{minStartingPrice}/kWh, {maxPowerOutput} kW, connector chips, "x/y available"), "View all stations" card.
- API: GET /station/locations (markers, with filters), GET /station?latitude&longitude&limit=5&page=1&…filters (carousel), GET /device-transactions/running-transaction on focus.
- Actions: marker or card → StationDetails; swiping carousel animates map; Filters sheet (min power slider step 5 kW, Public/Private, connector types) → re-fetch both; location FAB; active button: 1 session → ActiveCharging, several → ChargingHistory { defaultFilter: 'in_progress' }.
- States: location spinner; toast "Couldn't load charging stations. Please try again." (max once per 3 s).
- Fix: default region is hard-coded to Hyderabad (17.4239, 78.3772) — move to config; refresh nearby list on region change.

#### B2. Stations tab (Stations)

- Shows: header "Stations" + profile button, search input, FavouriteStationCard list (name, address, "x.xx km", "{power} kW", availability, heart).
- API: GET /station?latitude&longitude&limit=5&page&search?, GET /station/favourites/all?page=1&limit=100 (to mark hearts), POST /station/favourites/:id { isFavourite }.
- Actions: search (500 ms debounce), pull to refresh, infinite scroll, optimistic heart toggle with rollback (toasts "Added to favourites" / "Removed from favourites"), card → StationDetails.
- States: 3 skeletons; "Location is off" + Enable location; "Couldn't load stations" + Retry; "No stations found" + Clear Search; load-more skeleton.

#### B3. Station Details (StationDetails, { stationId }, deep link station/:stationId)

- Shows: header (back, share, heart), hero image (stationMedia[0].url or fallback), info card (name, address + city, status chip, distance, ETA), Directions and Call buttons, charger list: each charger's chargerId, power type, capacity; each connector's port label + icon, status, kW, ₹/kWh (tariff[0].price), SOC, time to full.
- API: GET /station/:id, GET /station/favourites/all?page=1&limit=100, POST /station/favourites/:id.
- Actions: Directions (iOS: Apple/Google choice sheet; Android: Google Maps), Call tel:helpNumber, Share (name, address, cruzeev://station/:id, https://cruzeev.com/station/:id, Google Maps link), heart, pull to refresh. Connector tap: if Available or Preparing → ChargingSummary { stationId, connectorId, chargerId, chargerUId, status }, else toast "Connector is currently {status}".
- States: skeleton; "Couldn't load this station" + Retry.
- Fix: hard-coded rating 4, "0 reviews", network "Unknown", hours "24 / 7" — drop or source from API; guard missing tariff.

### Feature C: Charging flow

#### C1. QR Scanner (QRScanner, deep link scan)

- Shows: permission view ("Camera Permission / Scan QR Codes Instantly", Allow Camera, Not now; or "Enable Camera Access" + Open Settings if blocked). Scanning view: full-screen camera, dimmed frame, animated laser line, close, title "QR Scanner", torch toggle, "Align QR code within the frame".
- QR parsing today: split on ?; chargerId = text after /charger-details/; connectorId = last character of the query string (only works for 0–9).
- Then: vibrate 400 ms, replace with ChargingSummary { chargerId, connectorId }.
- Fix: parse with URL + searchParams.get('connectorId'), reject non-charger codes with an "Invalid QR" message, add a manual "Enter charger ID" fallback. Confirm the exact QR URL format with backend.

#### C2. Charging Summary (ChargingSummary, { chargerId, connectorId })

- Shows: header "Charging Summary" + vehicle picker (model name or "Select Vehicle"); charger card (station name, chargerId, "CONNECTOR-{id}", "{powerType} · {capacity} kW · {portType} · ₹{rate}/kWh"); connector status message; tabs Amount (quick 100/200/500/1000), kWh (quick 5/10/20/30), Battery (DC only, start/end slider default 25 → 80 %, quick targets 50/60/75/80/100); estimate card (battery gain %, units kWh, amount ₹); pricing card (Charging Cost, Subtotal, Discount 0, GST, Total to Pay); sticky CTA "Start Charging · ₹x.xx".
- API: GET /station/charger/:chargerId?connectorId, GET /vehicle (pick isPrimary), POST /ocpp/start/:chargerId?platform= { connectorId, amount, energy, percentage? }.
- Socket: emit join chargerId; on start response emit join sessionId; listen status (re-fetch charger) and StartTransaction (navigate to ActiveCharging { sessionId }).
- Price maths (work in paise): rate = tariff[0].price, gst = tariff[0].gst. Amount tab: base = total × 100 / (100 + gst), units = base / rate. kWh tab: base = units × rate, total = base × (100 + gst) / 100. Battery tab: units = (end − start) × capacity / 100. Battery gain on other tabs = units / (capacity / 100).
- Start flow: if user.wallet.balance < total → Insufficient Balance sheet (balance, required, shortfall) with Top Up → AddMoney { amount: shortfall, source: 'charging' }. Else call start and show the Preparing sheet (cosmetic steps); after 90 s with no StartTransaction show "The charger didn't respond in time…".
- States: full-screen loader; "Couldn't load charger" + Retry; toast "Couldn't load your vehicles. Battery estimates may be off."
- Fix: show the wallet balance on screen; use replace to ActiveCharging; keep numbers numeric (don't parse formatted strings).

#### C3. Active Charging (ActiveCharging, { sessionId })

- Shows: header = chargerId + status chip; progress ring (DC with SOC: battery % "Battery Level"; else kWh against targetKwh, default 20); elapsed timer from startDate; stat tiles — Energy Consumed (kWh), Initial Charge (startSoc %, DC), EV Demand (currentImportEv kW), Power Offered (powerOffered kW), Started Time, Amount (₹ = kWh × calcPrice × (1 + calcTaxPercent)). "Session Completed" banner when status === 1. "Add Vehicle Auto Charge" button when macId exists and vehicleId is empty. Stop Charging.
- API: GET /device-transactions/running/:sessionId (on focus, on meterValue, on pull), POST /ocpp/stop/:chargerId?platform= { transactionId }.
- Socket: emit join sessionId; meterValue → silent re-fetch; StopTransaction → toast "Charging Stopped Successfully" → replace with ChargingSessionSummary { sessionId }.
- States: "Fetching charging details..."; "Couldn't load this session" + Retry; stopping spinner.
- Fix: add a stop timeout fallback (poll the session), use expo-keep-awake, consider an ongoing notification.

#### C4. Charging Session Summary (ChargingSessionSummary, { sessionId })

- Shows: check icon, "Charging Complete", "{station} · {chargerId} ({powerType})", "Total Paid ₹{price}", Duration (updatedAt − startDate), Energy Used, Battery start% → end% (DC), Connector (portType), Support (call or "Not Available"), Download Receipt, Go Back (to MainApp).
- API: GET /device-transactions/running/:sessionId, GET /invoice/:transaction.id (PDF; headers Bearer, x-client-token, Accept: application/pdf).

#### C5. Invoice (ChargingInvoice, { id } = transaction DB id)

- Shows: status banner (station, date/time, total), booking id (transactionId), session details (kWh, time "Xh Ym", start/stop SOC, charger type, connector type, charger and connector ids), location + vehicle reg no, billing (service charge amount, price per unit, SGST and CGST each = half of gst and half of calcTaxPercent, total price), Download.
- API: GET /invoice/summary/:id, GET /invoice/:id (PDF).
- Fix: show an error state with Retry instead of auto going back.

#### C6. Auto Charge

- Add Auto Charge sheet (from Active Charging): lists GET /vehicle; pick one → PUT /vehicle/:id?type=Charging { modelId, regNo, vinNumber: macId, maxAmount }; or "add vehicle" → AutoChargeEnable { macId }.
- AutoChargeEnable screen: Brand and Model searchable dropdowns, MAC ID (from param), Registration No (auto-filled when model matches an existing vehicle), Max Amount, Add Vehicle → POST /vehicle/:vehicleId?type=Charging. Toast "Auto charge enabled successfully".
- Fix: confirm PUT vs POST with backend; block submit when no matching vehicleId (today it posts to /vehicle/?type=Charging).

### Feature D: Wallet and payments

#### D1. Wallet tab (Wallet)

- Shows: balance card "Available Balance ₹{user.wallet.balance}" + Add Money; "Transactions" + See All; rows: title "Wallet Recharge" (credit) or "Charging - {station}" (debit), date (en-IN, dd Mon yyyy), ±₹amount green/red.
- API: GET /auth/user-by-token (balance), GET /transactions?limit=10&page=1, GET /device-transactions/running-transaction.
- States: skeleton (only on first load in the rebuild), "No Transactions Yet", toast "Couldn't load transactions. Pull down to retry."

#### D2. Wallet History (WalletHistory)

- Shows: tabs All / Credit / Debit, same transaction rows.
- API: GET /transactions?limit=10&page with infinite scroll.
- Fix: filtering is client-side over paged data; ask backend for a type filter.

#### D3. Add Money (AddMoney, { amount?, source? })

- Shows: "Enter Amount" (₹, prefilled), Price Breakdown when a coupon is chosen (Amount, Coupon Discount "{code} · {pct}% OFF", Total Credits), Available Coupons list (only if couponFeature, only ACTIVE), Add Money, full-screen loader while submitting.
- API flow:
    1.  GET /coupon (only when coupon feature is on).
    2.  POST /payment { amount, couponId | null } → { keyId, orderId, amount, currency, companyName }.
    3.  Razorpay checkout: key: keyId, amount, currency, name: companyName || brandName, description: 'Add Funds to Wallet', order_id, prefill { email, contact, name }, theme.color: primary.
    4.  On success: POST /payment/verify { razorpay_payment_id, razorpay_order_id, razorpay_signature } → refresh user → Success modal (credits incl. cashback, order id).
    5.  Razorpay error/cancel → Failure modal with Retry (same order). Verify fails after paying → "Payment Not Confirmed … Please don't pay again … order ID {id}", no retry.
- Validation: required, numeric, ≥ ₹100. Coupon minimum: toast "Minimum ₹{min} required for this coupon".
- Fix: don't pass onSuccess as a param — invalidate the user/wallet query instead; don't reset the form before payment completes; add quick amount chips.

### Feature E: Profile and account

#### E1. Profile tab (Profile)

- Shows: header "My Account", user.userId, bell → Notifications; hero card (initials, first + last name, email or "No email provided", edit → EditProfile); Account rows: My Vehicles ("{n} registered vehicles"), Charging History ("{n} sessions"), My Favourite Spots ("{n} favourites saved") from stats; Support row: Help & Support → opens supportUrl; Logout (confirm modal), Delete Account (opens DELETE_ACCOUNT_URL), brand name + app version.
- API: GET /profile (on focus), GET /device-transactions/running-transaction, POST /auth/logout.
- Then (logout): clear tokens, disconnect socket, reset to Login.

#### E2. Edit Profile (EditProfile)

- Shows: Full Name, Email (+ "Verify" / "Verified"), Phone (10 digits, + Verify), GST (optional, placeholder 22AAAAA0000A1Z5), Save Changes.
- API: POST /profile/send-otp { contact } → POST /profile/verify-otp { contact, otp } → PUT /profile (only changed fields of first_name, last_name, email, phone, gst) → refresh user.
- Rules: "No changes detected"; changed email/phone must be verified first; success toast then back.

#### E3. My Vehicles (MyVehicles)

- Shows: count header, cards (brand + model, reg no, capacity, range, Primary badge, Auto-charge switch), swipe actions Edit / Primary / Delete, add FAB.
- API: GET /vehicle, DELETE /vehicle/:id, PATCH /vehicle/:id { autoCharge } (optimistic), PATCH /vehicle/primary/:id (optimistic).
- States: 3 skeletons; "Couldn't load vehicles" + Retry; "No vehicles yet" + Add Vehicle.
- Fix: add a visible overflow menu besides swipe; route name was misspelled MyVechiles.

#### E4. Add Vehicle and E5. Edit Vehicle

- Add: same 4-step wizard as A6, no Skip, success → back.
- Edit: same wizard pre-filled; PUT /vehicle/:vehicleId expects 200, toast "Vehicle updated successfully!". Pass the vehicle id only and load by id (today it passes the whole object and matches brand/model by name).

#### E6. Charging History (ChargingHistory, { defaultFilter? })

- Shows: tabs All / Completed / In Progress; card: station, address, transactionId, date/time, status, energy kWh, duration min (charginDuration), cost ₹, connector "C{n}", power "{capacity}kW {powerType}".
- API: GET /device-transactions (whole list, no paging).
- Status map: 1 = completed, 2 = in_progress (add "failed" for others, like fleet).
- Actions: completed → Invoice { id }; in progress → ActiveCharging { sessionId }.

#### E7. Favourite Spots (FavoriteSpots)

- Shows: search "Search stations...", cards (name, address, filled heart).
- API: GET /station/favourites/all?page&limit=10&search?, POST /station/favourites/:id { isFavourite: false }.
- States: skeletons; "No favourites found" + Clear Search; or "Find stations" → Map tab.

#### E8. Notifications (Notifications)

- Shows: tabs All / Offers / New Station / Maintenance / Customer Support / Information; card: type icon, title (fallback to type), message, createdAt.
- API: GET /notification?page=n with infinite scroll.
- Fix: show unread (isRead), add a bell badge, make cards tappable.

### Feature F: Fleet driver mode (only when fleetFeature)

#### F1. Fleet Login (FleetLogin)

- Shows: "Fleet Operator Login", Fleet ID (placeholder e.g. FLT-2024-001), Registered Mobile, Access Fleet, Terms/Privacy.
- API: POST /fleet/login { fleetId, contact } → data.driverId.
- Validation: Fleet ID ≥ 4, ^[A-Za-z0-9-]+$; phone ^[6-9][0-9]{9}$.
- Then: toast "Verification code sent successfully" → FleetOtp { contact, fleetId, driverId }.

#### F2. Fleet OTP (FleetOtp)

- Shows: "Verify your identity", "A 4-digit security code was sent to {contact}", boxes, 30 s resend, Verify & Access Fleet.
- API: POST /fleet/verify-otp { otp } → save fleet tokens → GET /fleet/get-by-token → reset to FleetHome. Resend: POST /fleet/resend-otp { driverId }.
- Rebuild: reuse the consumer OTP component with a mode prop.

#### F3. Fleet Home (FleetHome)

- Shows: greeting by time of day + fleetUser.name, avatar → FleetProfile; Assigned Vehicle card (status, reg no, "{brand} {model}", assigned date, shift "{startTime} – {endTime}"; empty: "No vehicle assigned / Contact fleet manager for vehicle assignment"); Sessions link → FleetSessions; Charging Status card (level %, start time, start SOC, duration, Stop Charging; empty: "No charging session").
- API (on focus): GET /fleet/assigned-vehicle, GET /fleet/running-transaction, GET /fleet/get-by-token. Stop: POST /fleet/ocpp/stop?platform= { transactionId, chargerId }, re-fetch after 4 s.
- Fix: battery "65 kWh" is hard-coded; Android back exits app.

#### F4. Fleet Sessions and F5. Fleet Invoice

- Sessions: filter tabs + history cards (status includes "failed"); GET /fleet/transaction?page&limit=10; tap → FleetInvoice { id: sessionId }.
- Invoice: same invoice sections as consumer, from GET /fleet/running/:sessionId (adds voltage, current, power). No PDF download. Fix the inverted price-per-unit and the 18 % GST fallback.

#### F6. Fleet Profile and F7. Edit Fleet Profile

- Profile shows: name, email, "Driver Id : {drId}", Phone, Address, Driving License (licenseNumber), ID Proof (Aadhaar masked "XXXX XXXX {last4}"), Logout (GET /fleet/logout, clear fleet tokens, go to Login — today it goes to Onboarding).
- Edit: Full Name (≥ 2), Email (valid), Address (≥ 10) → PUT /fleet/update-profile { name, email, address } → refresh fleet user.

### Shared modals and sheets

| Sheet / dialog | Used by | Content |
|---|---|---|
| Filters | Map | Min power slider (5 kW steps), Public / Private, connector types, Clear / Apply |
| Maps options | Station Details (iOS) | Apple Maps / Google Maps |
| Insufficient balance | Charging Summary | Balance, required, shortfall, Top Up / Cancel |
| Preparing to charge | Charging Summary | Animated steps, target amount/units/battery, 90 s timeout error, Cancel |
| Vehicle selection | Charging Summary | Vehicle list with primary badge, Confirm; empty "No Vehicles Found" |
| Stop charging | Active Charging, Fleet Home | Confirm with charger id |
| Add Auto Charge | Active Charging | Pick vehicle or add new |
| Custom capacity | Vehicle wizard | kWh input |
| Verify contact + OTP verify | Edit Profile | Send OTP, enter OTP |
| Delete vehicle, Logout | My Vehicles, Profile | Confirm |
| Payment success / failure | Add Money | Amount, order id, reason, Retry |
| Update available | Global | Latest version, Update / Later |
| Permission blocked | Global | Cancel / Open Settings |

Build one Sheet primitive (@gorhom/bottom-sheet) and one Dialog primitive and compose all of these from them.

## 5. Cross-cutting concerns

These run under every feature; set them up in Phase 0 before any screen. Each row maps today's library to its Expo replacement.

### Library mapping (bare RN → Expo)

| Capability | Today | Expo choice |
|---|---|---|
| Navigation | React Navigation stacks | Expo Router (file-based, typed routes, protected groups) |
| Server data | useState + useEffect per screen | Contexts for session-wide data (Auth, Fleet, ClientConfig); `useRequest` / `useAction` around plain axios for screens (drops stale responses, loading/error/refetch) |
| Client state | 4 Contexts | Zustand (session, client config, small UI state) |
| Forms | formik + yup | react-hook-form + zod (shared schemas, typed) |
| Tokens | AsyncStorage | expo-secure-store |
| Other storage | AsyncStorage | AsyncStorage or react-native-mmkv |
| Maps | react-native-maps + map-clustering | react-native-maps (config plugin) + supercluster |
| Location | get-location, location-enabler, permissions | expo-location |
| QR | vision-camera | expo-camera CameraView with barcodeScannerSettings: { barcodeTypes: ['qr'] } |
| Push token | RN Firebase messaging | Keep @react-native-firebase/messaging (backend expects FCM tokens on iOS too) |
| Local notifications | Notifee | expo-notifications (channels, foreground, tap handling) |
| Payments | react-native-razorpay | Keep it (dev client / prebuild); add ProGuard rules + iOS UPI query schemes via config plugin |
| PDF download | react-native-blob-util | expo-file-system download with headers + expo-sharing |
| Network | netinfo + probes | @react-native-community/netinfo (`useOnline`, OfflineBanner) |
| Toast | simple-toast (native) | sonner-native or burnt |
| Bottom sheets | 20 hand-rolled Modals | @gorhom/bottom-sheet |
| App update | react-native-version-check | expo-application + backend minVersion in /client/info; optional expo-updates |
| Keep awake | none | expo-keep-awake on Active Charging |
| Fonts | linked Inter .otf | expo-font config plugin |
| Icons, SVG | lucide-react-native, react-native-svg | Keep both |
| Crash reporting | none | @sentry/react-native |

Expo Go will not work (Razorpay, Firebase, Google Maps). Use a development build (expo-dev-client) from day one.

### Auth and session

- Two independent sessions: consumer (access_token, refresh_token) and fleet (fleetToken, fleetRefreshToken). Only one should be active; on login to one, clear the other (fixes the wrong-token bug).
- On first launch of the Expo build, migrate any existing AsyncStorage tokens into SecureStore so users stay logged in.
- Logout always clears locally even if the server call fails.

### Local storage keys to keep

| Key | Meaning |
|---|---|
| access_token, refresh_token | Consumer tokens (SecureStore) |
| fleetToken, fleetRefreshToken | Fleet tokens (SecureStore) |
| CLIENT_CONFIG | Cached /client/info |
| firstlogin | 'completed' after onboarding; Splash chooses Login vs Onboarding |
| FCM_TOKEN | Last synced FCM token |

Drop FIRST_LAUNCH, onboardingStep, VEHICLE_ADDED (never read).

### Push notifications

- Android channels: charging-start-channel, charging-end-channel, charging-soc-channel, offers-channel, plus a default channel.
- Tap routing by data.type: charging-start and charging-soc → ActiveCharging, charging-end → ChargingSessionSummary, Offers and anything else → Notifications. Ask backend to include sessionId in the payload.
- Sync the FCM token after login, after permission grant and on token refresh (PUT /auth/fcm). Fleet should use /fleet/fcm (defined but never used — confirm).
- Background handler: register exactly once.

### Location and maps

- Default region from config (today Hyderabad 17.4239, 78.3772). Distance uses haversine from current location.
- Android: prompt to enable GPS (Location.enableNetworkProviderAsync).
- Map style JSON lives in src/utils/mapsjson.ts; copy it. Cluster colour = primary.
- Google Maps keys go in app.config.ts from EAS env vars (not committed).

### Permissions

A single "permission blocked" dialog (Location, Camera, Notifications) with Cancel / Open Settings. In Expo, canAskAgain === false means blocked; open settings with Linking.openSettings().

### Deep links

Scheme cruzeev, domain cruzeev.com. Routes: station/:stationId, scan, charging/summary?chargerId&connectorId, charging/active/:sessionId, charging/summary/:sessionId, invoice/:id, wallet, wallet/history, wallet/add, vehicles, vehicles/add, vehicles/edit/:vehicleId, profile/edit, charging/history, favorites, notifications, fleet/*. Expo Router gives these for free from file names; add iOS Associated Domains (missing today).

### Theme tokens to copy

| Token | Value |
|---|---|
| primary / primaryLight / primaryDark | #00C8D0 / #E6F8FA / #1A8F99 |
| background / surface | #F4FBFC / #FFFFFF |
| textPrimary / textSecondary / textTertiary | #0E2E31 / #4A6A6E / #7D9B9F |
| border / borderLight | #C2EBEE / #E6F8FA |
| success / warning / error | #22C55E / #F59E0B / #D32F2F |
| connector Available / Charging / Unavailable / Faulted / Reserved / Unknown | #16a34a / #0dd5e3 / #ef4444 / #FFC107 / #f59e0b / #9E9E9E |
| radius sm / md / lg / sheet | 8 / 12 / 16 / 24 |
| spacing xs / sm / md / lg / xl | 4 / 8 / 16 / 24 / 32 |
| font | Inter Regular, Medium, SemiBold, Bold |

Connector icons (Type1, Type2, CCS1, CCS2, CHAdeMO, GB/T, Bharat AC, Bharat DC) are SVG components in src/components/ConnectorTypes/; copy them as-is.

### White-label and locale

Runtime from /client/info: brand name, logo, legal and support URLs, login type, fleet and coupon flags. Build-time today: app name, bundle id, colours, hosts, client token, scheme, Maps keys, Firebase files, icons. India-specific assumptions to move into config: ₹ / en-IN, phone regex, GST/CGST/SGST split, ₹100 top-up minimum, quick amounts. In Expo, drive build-time values from a brands/<client>.ts file read by app.config.ts.

## 6. Proposed clean Expo architecture

Use a feature-first layout: Expo Router files in app/ are thin route shells, and all logic lives in src/features/<feature>/ with a fixed internal shape (types → api → hooks → components → screens; see AGENTS.md "Folder layout"). Shared infrastructure sits in src/core/ and the design system in src/ui/.

### Folder structure

```text
app/                                  # Expo Router: routes only, no logic
  _layout.tsx                         # providers, fonts, splash gate, push init
  index.tsx                           # redirect by session (Splash logic)
  (auth)/                             # signed-out only
    onboarding.tsx  login.tsx  otp.tsx
    fleet-login.tsx  fleet-otp.tsx
  (setup)/                            # signed in, first-run steps
    profile.tsx  vehicle.tsx  location.tsx  notifications.tsx
  (app)/                              # guard: consumer session
    _layout.tsx                       # Stack + socket connect
    (tabs)/_layout.tsx                # Map, Stations, [Scan], Wallet, Profile
    (tabs)/index.tsx  stations.tsx  wallet.tsx  profile.tsx
    station/[stationId].tsx
    scan.tsx
    charging/summary.tsx              # ?chargerId&connectorId
    charging/[sessionId]/index.tsx    # live session
    charging/[sessionId]/complete.tsx
    charging/history.tsx
    charging/auto-charge.tsx
    invoice/[id].tsx
    wallet/history.tsx  wallet/add.tsx
    vehicles/index.tsx  vehicles/add.tsx  vehicles/[vehicleId]/edit.tsx
    profile/edit.tsx  favorites.tsx  notifications.tsx
  (fleet)/                            # guard: fleet session
    _layout.tsx
    fleet/index.tsx  fleet/sessions.tsx  fleet/invoice/[id].tsx
    fleet/profile.tsx  fleet/profile-edit.tsx

src/
  core/          flat files, one per concern:
    api.ts          axios client, 401 refresh queue, envelope and error helpers
    config.ts       env (from expo-constants extra) and brand
    log.ts  network.tsx (useOnline, OfflineBanner)  permissions.tsx
    request.ts      useRequest, useAction, useSessionData
    session.ts      zustand token store (mode, tokens), signOutThen
    storage.ts      SecureStore, MMKV kv (AsyncStorage fallback in Expo Go), legacy migration
    # later phases: socket.ts, notifications.ts
  features/
    # every feature: screens/ components/ api.ts hooks.tsx constants.ts types.ts index.ts
    # plus an optional <topic>.ts for pure rules with no React/UI imports
    auth/          + session.ts (schemas, routing rules, boot steps)
    client-config/
    stations/
    charging/      + pricing.ts  qr.ts
    wallet/        + razorpay.ts
    vehicles/
    profile/
    notifications/
    fleet/
  ui/            Text, Button, Input, Card, Sheet, Dialog, Skeleton, EmptyState,
                 Tabs, Screen, Header, Badge, Toast, ConnectorIcon
  theme/         tokens.ts (colors, spacing, radius, typography)
  lib/           format.ts (currency, date, duration), distance.ts, useDebounce.ts
```

### Layer rules

1.  Route files (app/**) only read params and render a screen from features/*/screens. No fetching, no state.
2.  api.ts holds every network call and nothing else; no endpoint strings anywhere else. Each call returns a domain model (Station, Session, Transaction) through a DTO mapper that sits next to it, so backend quirks (charginDuration, pagination.page vs currentPage, capacity as number or object) are fixed in one place and components never touch raw API shapes.
3.  hooks.tsx holds the feature's logic and state: its context provider if it has session-wide data, screen hooks built on `useRequest` / `useAction` / `useSessionData` (src/core/request.ts), and side effects. Screens are UI only and call these hooks.
4.  constants.ts holds static data (copy, timeouts, lengths, route hrefs) and imports no UI; types.ts holds DTOs, models and unions.
5.  Zustand holds only client state: the token store (mode consumer | fleet | none, tokens) and filters. The user, fleet driver and client config live in AuthContext, FleetContext and ClientConfigContext.
6.  Pure logic (pricing maths, QR parsing, status mapping, formatters) lives in a topic-named .ts file in the feature (charging/pricing.ts, auth/session.ts) with no React or UI imports, and has unit tests.
7.  Features import each other only through their index.ts; ui/ and core/ never import from features/.

### Key code skeletons

#### API client with token refresh

```ts
// src/core/api/client.ts
export const client = axios.create({ baseURL: env.API_URL, timeout: 20_000, withCredentials: true });

client.interceptors.request.use(async (config) => {
  const token = await session.getAccessToken();      // active mode only
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-client-token'] = env.CLIENT_TOKEN;
  return config;
});

client.interceptors.response.use(undefined, refreshOn401);  // queue + POST /auth/refresh

// src/core/api/envelope.ts
export type Page<T> = { items: T[]; page: number; totalPages: number };
export const unwrap = <T>(res: AxiosResponse<{ data: T }>) => res.data.data;
export const toPage = <T>(res: any): Page<T> => ({
  items: res.data.data ?? [],
  page: res.data.pagination?.currentPage ?? res.data.pagination?.page ?? 1,
  totalPages: res.data.pagination?.totalPages ?? 1,
});
```

#### Feature api + hook

```ts
// src/features/stations/api.ts
export async function getNearbyStations(p: NearbyParams): Promise<Page<Station>> {
  const res = await api.get<Envelope<PageDto<StationDto>>>('/station', { params: toNearbyQuery(p) });
  return toPage(unwrap(res), toStation);
}

export async function setFavourite(id: string, isFavourite: boolean): Promise<void> {
  await api.post(`/station/favourites/${id}`, { isFavourite });
}

// src/features/stations/hooks.tsx
export function useNearbyStations(p: NearbyParams) {
  const load = useCallback(() => getNearbyStations(p), [p]);
  return useRequest(load); // { data, error, loading, refetch } for skeleton / Retry / empty
}
```

#### Route guard

```tsx
// src/app/(app)/_layout.tsx: every group layout is one line
export default function AppLayout() {
  return <GuardedStack group="app" />;
}
// GuardedStack (auth/components) calls useRouteGuard -> guardRoute (auth/session.ts):
// allow -> <Stack />, redirect -> <Redirect href="/" />, end-session -> sign out.
```

#### Live session via socket + request

```ts
// src/features/charging/hooks.tsx
export function useLiveSession(sessionId: string) {
  const load = useCallback(() => getRunningSession(sessionId), [sessionId]);
  const session = useRequest(load);
  useSocketRoom(sessionId);
  useSocketEvent('meterValue', () => void session.refetch());
  useSocketEvent('StopTransaction', () => router.replace(`/charging/${sessionId}/complete`));
  return session;
}
```

### Conventions

- TypeScript strict, no any in api or hooks; typed route params via Expo Router typed routes.
- Environments via APP_ENV read in app.config.ts and EAS build profiles (development, staging, production), each with its own bundle id suffix so they install side by side.
- Secrets (Maps keys, keystore) in EAS env and credentials, never in git. Strip console.* in release.
- Tests: Jest for pricing.ts, qr.ts, mappers and formatters; Maestro for the login → charge happy path.

## 7. Build order

Build in 10 phases, each ending with something you can run on a device. Every feature phase follows the same loop: types.ts → api.ts (calls + mappers) → constants.ts / <topic>.ts → hooks.tsx → components → screens → compare side by side with the old app.

### Phase 0: Foundation

- [ ] npx create-expo-app with TypeScript, Expo Router, expo-dev-client; first dev build on Android and iOS
- [ ] app.config.ts with APP_ENV, API host, socket URL, client token, scheme cruzeev, bundle id com.cruzeev.app (+ suffixes per env)
- [ ] EAS build profiles: development, staging, production
- [ ] Theme tokens, Inter font, ui/ primitives: Text, Button, Input, Card, Screen, Header, Skeleton, EmptyState, Sheet, Dialog, Toast, Tabs
- [ ] core/api client + refresh queue + envelope helpers; Auth/Fleet/ClientConfig contexts; Zustand token store; SecureStore
- [ ] Offline banner (NetInfo) and the permission-blocked dialog
- [ ] Copy connector SVG icons, map style JSON, images

### Phase 1: Client config and consumer auth (A1–A4)

- [ ] GET /client/info with cache fallback; BrandLogo
- [ ] Splash gate in app/index.tsx + expo-splash-screen, 25 s timeout and Retry
- [ ] Onboarding, Login (phone/email by loginType, fleet link by fleetFeature), OTP with autofill
- [ ] Verify the OTP session cookie works in Expo before going further
- [ ] Route groups (auth), (setup), (app) with guards; logout
- [ ] Legacy token migration from AsyncStorage

### Phase 2: First-run setup (A5–A8)

- [ ] Profile Setup (PUT /profile)
- [ ] Shared VehicleForm wizard (brand → model → capacity → details), Vehicle Setup with Skip
- [ ] Location and Notification permission screens; send FCM token after grant

### Phase 3: Tabs and discovery (B0–B3)

- [ ] Tab bar with raised Scan button and labels
- [ ] Map: markers + clustering, filters sheet, nearby carousel, my-location, config-driven default region
- [ ] Stations list: search, infinite scroll, favourites toggle, all empty/error states
- [ ] Station Details: hero, info, directions, call, share, charger/connector list, connector tap rules

### Phase 4: Vehicles (E3–E5)

- [ ] My Vehicles list, primary, auto-charge toggle, delete
- [ ] Add and Edit Vehicle reusing VehicleForm (edit loads by id)

### Phase 5: Wallet and payments (D1–D3)

- [ ] Wallet tab and history with pagination
- [ ] Add Money: coupons, /payment, Razorpay, /payment/verify, success and failure modals; test a real low-value payment on a release build

### Phase 6: Charging (C1–C6), the core flow

- [ ] Socket client + useSocketEvent / useSocketRoom
- [ ] QR scanner with expo-camera, robust parser, manual entry fallback
- [ ] pricing.ts with unit tests matching the old maths exactly
- [ ] Charging Summary: tabs, estimate, pricing, vehicle picker, insufficient balance → Add Money, start + preparing sheet with 90 s timeout
- [ ] Active Charging: ring, stats, timer, stop with confirm, keep-awake, stop timeout fallback
- [ ] Session Summary and Invoice with PDF download
- [ ] Auto Charge sheet and screen (after confirming PUT vs POST)
- [ ] "Resume charging" button on tabs from running-transaction

### Phase 7: Profile and history (E1, E2, E6–E8)

- [ ] Profile tab with stats, support URL, delete-account URL, version
- [ ] Edit Profile with contact OTP verification
- [ ] Charging History, Favourite Spots, Notifications

### Phase 8: Fleet mode (F1–F7)

- [ ] Fleet session mode in the store, (fleet) guard, fleet tokens
- [ ] Fleet Login and OTP (shared OtpInput), Home, Sessions, Invoice, Profile, Edit Profile

### Phase 9: Push, deep links, release

- [ ] FCM token + expo-notifications channels, foreground display, tap routing to real routes
- [ ] Deep links and iOS Associated Domains; test every path while logged out (must redirect to login)
- [ ] App update prompt from backend minVersion; Sentry; strip logs
- [ ] Store builds via EAS with the existing Play upload key and iOS team

### Questions to settle with backend first

1.  Does /auth/app/verify rely on a session cookie, and does /auth/refresh also refresh fleet tokens?
2.  Exact QR URL format for chargers.
3.  Auto charge: PUT or POST /vehicle/:id?type=Charging?
4.  Account deletion: in-app DELETE /profile or the web URL (and which domain, .in or .com)?
5.  Add sessionId to push payloads; confirm /fleet/fcm.
6.  Server-side type filter for /transactions and pagination for /device-transactions.
