# Progress

Phase numbers follow the project prompts, not BLUEPRINT.md section 7:

| Phase | Scope                                                                          | Blueprint section 7       | Status                              |
| ----- | ------------------------------------------------------------------------------ | ------------------------- | ----------------------------------- |
| 0     | Template and white-label brand layer                                           | part of Phase 0           | Done                                |
| 1     | Foundation (theme, UI kit, core api/session/storage, root layout) + UI refresh | Phase 0                   | Done, tag `phase-1-done`            |
| 2     | Client config and consumer auth (A1-A4, A9)                                    | Phase 1                   | Merged to `main`; device check open |
| fix   | Setup resume, fleet login (F1-F2), shared back button                          | Phase 1 + part of Phase 8 | Merged to `main` (PR #3)            |
| 3a    | Tab bar and Map home (B0, B1)                                                  | Phase 3 (part)            | Branch `feat/tabs-map`              |
| 3b    | Station Details (B3)                                                           | Phase 3 (part)            | Branch `feat/station-details`       |

## Phase 0: Template and brand layer (done, 2026-11-23)

**Done**

- Tooling: expo-dev-client, typed routes, TS strict, `@/` → `src/` and `@brand/` → `brand/`
  aliases, ESLint (expo flat config + prettier), Prettier, Jest (jest-expo).
- Scripts: `typecheck`, `lint`, `test`, `brand:check`, `format`.
- `brand/`: zod schema, Cruze EV config, per-env endpoints, map style, assets.
- `scripts/brand-check.ts`: schema, `CHANGE_ME` scan, PNG size checks.
- `app.config.ts` replaces `app.json`; `.dev` / `.staging` variants install side by side.
- `src/core/config`: `env` and `brand`, validated at startup from `expoConfig.extra`.
- `eas.json` (development, development-simulator, staging, production), `.env.example`, `.gitignore`.
- `docs/WHITE_LABEL.md`; `docs/screen-audit.md` copied from the old app.

**Verified**: `brand:check`, `typecheck`, `lint`, `test` (21 tests), `expo prebuild --clean`, and
`eas.json` profiles parsed with `@expo/eas-json`.

**Deviations**

- `docs/BLUEPRINT.md` arrived at the end of the phase, so Phase 0 was built from the task brief
  and the old app. The old app lives at `../Cruzev_nexin_whitelable_app` (AGENTS.md updated).
- Routes live in `src/app/` (create-expo-app default), not `app/`.
- Template-owned helpers live in `brand/lib/` (contrast maths) next to `schema.ts`.
- `app.config.ts` imports `tsx/cjs` so Expo can load `brand/*.ts`. `tsx` is a dev dependency
  (EAS installs dev dependencies).
- Money fields in `brand.config.ts` are whole rupees and say so in their names (`minTopUpRupees`, `quickTopUpRupees`, `quickChargeRupees`); convert to paise in `src/`.
- `easProjectId` / `owner` are optional, so `brand:check` passes with a warning until `eas init`.
- `development` points at the staging backend.
- Added a `development-simulator` EAS profile for iOS simulator builds.
- `eas config` itself was not run (needs an Expo login).

**Phase 0 fixes**

- Scheme suffixes are `-dev` / `-staging` (e.g. `cruzeev-dev`).
- Adaptive icon rebuilt from the old app's Android launcher foreground, upscaled into the centre
  66% of 1024; background colour is `brand.adaptiveIcon.backgroundColor`.
- iOS icon flattened (no alpha channel); `brand:check` fails if `icon.png` has transparency.
- Splash settings (`brand.splash`: imageWidth, backgroundColor, optional darkBackgroundColor)
  feed the expo-splash-screen plugin.
- Money fields renamed: `minTopUpRupees`, `quickTopUpRupees`, `quickChargeRupees`. (The first
  attempt was a silent no-op; fixed in 2178188 with a test pinning the names.)
- `brand.appearance` (`system` | `light` | `dark`, default `system`). Cruze EV sets `light`
  until dark tokens exist.
- `colors.accentText` (optional; derived by darkening `primary` until 4.5:1 on white and
  `background`). Cruze EV: `#117A83`. `brand:check` checks accentText on light surfaces and
  that white or dark text passes on the accent fill.
- `docs/DESIGN.md` added and referenced from AGENTS.md.
- `docs/BLUEPRINT.md` added (notes block + sections 1-7).

**Open questions**: see `docs/OPEN_QUESTIONS.md`.

## Phase 1: Foundation (done, 2026-11-23, tag `phase-1-done`)

**Done**

- Dependencies for the stack in AGENTS.md; `src/core/log.ts`; console calls stripped in
  production builds.
- Theme: semantic palette derived from brand (light and dark), tokens, `ThemeProvider`, brand
  font files and loader (`brand:check` verifies them).
- UI kit (`src/ui`): Text, Pressable, Button, Input, FormInput, Card, Screen, Header,
  LargeTitleScroll, Skeleton, EmptyState, ErrorState, Badge, StatusChip, Sheet, Dialog,
  SegmentedControl, ListGroup/ListRow, connector icons, BrandLogo (build-time), themed toasts.
- `src/core/api`: axios client, single-flight 401 refresh, response envelope and typed errors.
- `src/core`: TanStack Query client, SecureStore and MMKV storage, legacy AsyncStorage token
  migration, Zustand session store, permissions helpers with a global blocked dialog, offline
  banner.
- Root layout with providers, splash held during bootstrap, global overlays.
- Dev UI kit gallery at `/dev/ui` (non-production builds only).

**Not done here (moved to Phase 2)**: `/client/info`, runtime logo, splash gate routing and
auth route groups.

### UI refresh (2026-11-23, merged in Phase 1)

**Done**

- Palette: light bg, surface, border and borderStrong are derived from neutrals by default.
  `brand.colors.background`, `surface` and `border` are now optional light-mode overrides;
  Cruze EV dropped its teal-tinted ones (`#F4FBFC`, `#C2EBEE`; `surface #FFFFFF` matched the
  default and was removed too).
- New optional `brand.colors.accentFill` (defaults to `primary`). onAccent is always computed.
  Cruze EV keeps `#00C8D0` with dark text `#0E2E31` (7.0:1).
- `brand:check` checks contrast on the rendered light and dark palettes
  (`scripts/lib/contrast-warnings.ts`, unit-tested) and warns if onAccent misses 4.5:1.
- Button: secondary is white + neutral border + dark text; `size` is `large` (52) | `medium`
  (44, was `small`); medium defaults to content width. Dialog cancel is secondary.
- Card: `elevation` is `flat` | `elevated` (was `floating`).
- New `ListGroup` / `ListRow` (src/ui/List.tsx).
- LargeTitleScroll: floating bar with blur on iOS (expo-blur), solid on Android.
- Input: sunken fill, brand focus border and ring.
- `ThemeScope` renders a subtree in a fixed scheme (gallery light/dark preview).
- Dev gallery and placeholder home restyled. DESIGN.md updated with these decisions.

**Deviations**: none from the approved plan. Dark mode is supported by every token and
component but not polished screen by screen; Cruze EV stays on `appearance: 'light'`.

**Note**: expo-blur is native, so existing dev clients must be rebuilt (`npm run ios` /
`npm run android`).

## Structure cleanup (2026-11-25, branch `feat/setup`)

Move/rename refactor so every feature has the same shape; behaviour unchanged.
Guide for new developers: `docs/HOW_THIS_APP_WORKS.md`.

- Home screen moved from `auth` to new `features/home` (`HomeScreen`); the fleet placeholder
  also lives there (`FleetHomeScreen`).
- `auth/routing.tsx`: `useBoot`, `useStartRoute`, `useRouteGuard` (out of `auth/hooks.tsx`).
- `useOnboarding` holds the onboarding logic; `OnboardingScreen` only renders.
- `BootErrorScreen` is shown only by the root layout (startup failure and first user-load
  failure); `StartRedirect` only redirects.
- `OfflineBanner` and `PermissionDialog` moved from `src/core` to `src/ui`; `core/network.ts`
  and `core/permissions.ts` are logic only. `SetupPermission` is in `setup/types.ts`.
- `npm start` opens in Expo Go; `npm run start:dev` for a development build.

**Deviations**

- `FleetHomeScreen` is in `home`, not `fleet`: `auth` imports `fleet` (driver load,
  `fleetLogout`), so a fleet screen importing `auth` for logout made a require cycle.
- `finishOnboarding` stays in `auth/hooks.tsx` (private to `useOnboarding`), not in
  `routing.tsx`, so `hooks.tsx` and `routing.tsx` don't import each other.

**Verified**: `tsc --noEmit`, `expo lint`, `jest` (37 suites, 224 tests, including new boot
error and onboarding tests); Android and iOS bundles build in Expo Go mode; onboarding and
Login render in Expo Go on the iOS simulator with no require-cycle warning.

## Phase 2b: First-run setup (in progress, branch `feat/setup`)

Scope: BLUEPRINT A5-A8. Flow after OTP for a first-time user: `/(setup)/profile` ->
`/(setup)/vehicle` (Skip) -> `/(setup)/permissions` -> home, with "Step n of 3" across setup.

**Built**

- `setup` feature: Profile Setup (`PUT /profile { first_name }`, name >= 2, terms checkbox with
  a full-row touch target), Vehicle Setup (wraps the shared wizard, Skip), one Permissions
  screen (Location + Notifications rows: Allow / Allowed / Open Settings; re-checks on return
  from Settings; Android GPS prompt after location; push token sent after notifications).
- `vehicles` feature: `getBrands`, `getModels`, `getCapacities`, `addVehicle` (calls return
  models; `toAddVehicleBody` sends numeric ids, upper-cased regNo and MAC ID, optional fields
  only when filled); shared `useVehicleWizard` + `VehicleForm` (brand -> model -> capacity +
  Custom 10-500 kWh sheet -> details) for Add / Edit Vehicle later.
- Fixes from screen-audit 2.5-2.8: MAC ID max 17; loading skeleton, error + Retry and empty
  states on every grid; one back button; custom capacity limits enforced in the sheet.
- auth: `registerPushToken` (`PUT /auth/fcm`), per-user `setup_done_for` flag respected by
  `resolveStartRoute`, `openLegal` exported for the setup Terms links.
- Brand schema: `regNoPlaceholder` (default `KA01AB1234`); amount label uses `brand.currency`.
- Tests: form rules, request mapper, name rule; render tests for profile submit, wizard brand
  -> model, empty brands, Skip. `tests/helpers/render.tsx` now includes the bottom-sheet
  provider like the root layout.

**Verified**: `tsc --noEmit`, `expo lint`, `jest` (34 suites, 213 tests). Not run on a device:
setup is behind login, which needs a staging test number (OPEN_QUESTIONS #10).

**Deviations**

- Location and Notification permission screens (A7, A8) are one screen (owner decision).
- `updateProfile` lives in `setup/api.ts` instead of a separate `profile` feature: one call
  today; move it when Edit Profile arrives.
- New copy not in screen-audit: permissions title/subtitle ("Allow access", ...), grid empty
  states ("No brands available", ...), the custom capacity sheet ("Battery capacity (kWh)",
  "Save", limits line), "Allow" / "Allowed" / "Open Settings" row actions.

**Left**

- A4 "returning user without location permission -> LocationPermission" is not wired; the
  permissions screen is only part of first-run setup.
- Device check of the whole setup flow (needs #10).

**Open questions**: #13 (push token type), #14 (does `PUT /profile` clear `isFirstLogin`).

## Phase 2: Client config and consumer auth (merged to `main` 2026-11-25; device check open)

Scope: `/client/info` with cache, route groups and guards, boot/splash (A1), onboarding (A2),
login (A3), OTP (A4), boot error screen (A9 style), logout.

**Built**

- Brand schema: `apiAppName` (default: `appName` without spaces), `phoneCountryCode`,
  `phonePlaceholder`.
- `client-config` feature: `GET /client/info` -> `ClientConfig` mapper, MMKV cache, brand
  fallbacks, `primeClientConfig` at boot (waits up to 8 s only when there is no cache, never
  blocks), runtime `AppLogo`.
- `auth` feature: api, mappers, zod schemas, OTP helpers, `OtpInput` (one hidden TextInput for
  iOS/Android autofill), hooks (`useMe`, `useRequestOtp`, `useVerifyOtp`, `useLogout`,
  `useBoot`), `resolveStartRoute`, screens (Onboarding, Login, Otp, BootError, StartRedirect,
  TempHome). Public surface in `src/features/auth/index.ts`.
- `fleet` feature skeleton: `fleetMeQuery` and mapper (used by the boot session check).
- Route groups in `src/app` (thin files):
  - `index.tsx` -> StartRedirect (Phase 1 placeholder home removed).
  - `(auth)`: onboarding, login, otp; a signed-in session is sent to `/`.
  - `(setup)`: consumer session only; `profile` placeholder with Log out.
  - `(app)`: consumer session only; `(tabs)` with Home (TempHome + Log out) and a Wallet stub.
  - `(fleet)`: fleet session only; ends the session if `features.fleet` is off; `fleet/index`
    placeholder with Log out.
  - Logged-out deep links into `(app)` (e.g. `cruzeev-dev://wallet`) land on `/` -> login.
- Root layout runs `useBoot` while the splash is held: legacy migration, session hydrate,
  client config, session check (25 s timeout). Expired session -> signed out -> login;
  network/5xx/timeout -> BootErrorScreen with Try Again (tokens kept).
- `/dev/ui` and `/dev/cookie-check` still work and still redirect to `/` in production.
- Fixes after review (2026-11-24):
  - Logout uses `GET /fleet/logout` for a fleet session (was always `POST /auth/logout`).
  - `clearUserDataOnSessionChange`: user queries are dropped on every session mode change, so
    a new login never routes on the previous user's cached `/auth/user-by-token`.
  - Route guards are one pure function (`guardRoute`, table-tested) used by `GuardedStack`.
  - `/otp` without a contact (bare deep link) redirects to login.
  - `brand.links` (terms, privacy, support) as build-time fallbacks; runtime link and logo
    URLs must be http(s).

- Restructure (2026-11-24, requested): features are `screens/ components/ api.ts hooks.ts
types.ts utils.ts index.ts` (mappers merged into api.ts; queries, boot and the old
  `core/bootstrap.ts` merged into hooks.ts as `restoreSession`; otp, routes and schemas merged
  into utils.ts). `src/core` sub-folders became flat files. All tests moved to `tests/`.
  AI-style doc comments removed. AGENTS.md "Folder layout" and "Code style" record the rules.

- UI refresh of splash, onboarding and auth (2026-11-24, requested): animated `SplashOverlay`
  takes over from the native splash and zooms away; `AmbientBackground` (two slow-drifting
  accent orbs) and `AuthScaffold` (floating footer, round back button) on onboarding, login,
  OTP and boot error; staggered `Reveal` entrances; Input, Button and OtpInput animate their
  state changes; pill primary buttons; radius 14/20; auth stack slides, group changes fade.
- Second pass (2026-11-24, requested "modern, no shadows"): fully flat. Dot-grid backdrop
  replaces the orbs, curtain splash with a slow-boot loader, `hero` type, large inputs, flat
  OTP cells, input focus ring removed, onboarding with step counter, orbit art and progress
  segments.

- Expo Go preview (2026-11-24, requested): `src/core/storage.ts` loads MMKV lazily and, in
  Expo Go, uses an in-memory cache persisted to AsyncStorage under `app.kv.*` (kept apart
  from the legacy keys the migration removes). `hydrateStorage()` runs first in
  `restoreSession`. Push notifications stay dev-build only. Firebase messaging and Razorpay
  (later phases) will need the same guard.

- Logout fix (2026-11-24): `signOutEverywhere` clears the session first, so the guard shows
  Login at once, then sends the server logout in the background with the token captured
  before clearing (`authToken` request option: sent as-is, 8 s timeout, never refreshes on
  401). Before, the UI waited on the server (up to 20 s, or 40 s when a 401 triggered a token
  refresh first) and could save refreshed tokens just before deleting them. `clearUserData`
  now cancels in-flight user queries before removing them.

- TanStack Query removed (2026-11-24, requested): `AuthProvider` (user, requestOtp,
  verifyOtp, logout), `FleetProvider` (driver, logout) and `ClientConfigProvider` (cached config,
  boot prime, background refresh) over plain axios. Each provider resets on a session mode
  change and drops responses from the previous session (generation counter). The Zustand
  token store stays underneath for the axios interceptor. `useRequest` / `useAction` in
  `src/core/request.ts` for screens. `useBoot` takes the context loaders. Removed:
  `@tanstack/react-query`, `src/core/query.ts`, focus/online refetch, query retries.
  Deviation: no shared cache; data reloads per screen visit and does not refetch on app focus
  or reconnect. Provider/hook render tests need `@testing-library/react-native` (not added).

**Verified**: `tsc --noEmit`, `expo lint`, `jest` (25 suites, 187 tests); cold boot to Login on
the Android emulator, `brand:check` all pass.
Not yet verified on a device against staging (needs a test number, see open questions).

**Deviations**

- Root layout now uses `useBoot` (was `bootstrap()` only) so the A1 session check and boot
  error screen run.
- The "Fleet Login" link on Login was hidden until `(auth)/fleet-login` existed. Superseded:
  built on `fix/setup-flow` (see below).
- `(app)/(tabs)` has only Home and Wallet for now; Home is a temporary signed-in screen.
- A stored fleet session with `features.fleet` off is signed out (it has no valid screens).
- OTP screen drops the logo in favour of a round back button; onboarding text is left-aligned
  (DESIGN.md: no centred paragraphs).

**Left in Phase 2**

- Real-device run of onboarding -> login -> OTP -> home against staging (OPEN_QUESTIONS #9
  Part B, #10).
- Decide the `/auth/app/verify` `appName` value (OPEN_QUESTIONS #11).
- Remove the temporary `/dev/cookie-check` route once #9 Part B passes.
- Route guards are unit-tested through `guardRoute`; rendering tests of the layouts need
  `@testing-library/react-native` (not added; ask before adding).
- Cruze EV values for `brand.links` (OPEN_QUESTIONS #12).

**Open questions still open**: #9 Part B (staging cookie), #10 (test OTP / number), #11
(`appName`), #12 (Cruze EV legal/support URLs). See `docs/OPEN_QUESTIONS.md`.

## Refactor: reference code style (2026-11-25, branch refactor/code-style)

Requested: adopt the Nexin EV (RN CLI) code style without its stack. Expo, expo-router,
MMKV, sonner-native, apiError/useAction/useRequest, log.ts and the domain mappers stay.

**Done**

- AGENTS.md rewritten first so every later commit follows it.
- Prettier `arrowParens: avoid`; ESLint `import/order` enforces the 7 import groups.
- src/ui -> src/shared/components (App* kit, one default-exported component per file, barrel),
  src/theme -> src/shared/theme, toast/haptics/keyboard -> src/shared/utils, new
  src/shared/utils/money.ts and src/shared/assets/images.ts.
- src/core/endpoints.ts holds every API path; REFRESH_PATH and FLEET_REFRESH_PATH removed.
- Every feature uses api/, hooks/ (one hook per file), types/, constants/, utils/, screens/,
  components/. API files export one object (`authApi`, `fleetApi`, ...) plus mappers.
- auth/session.ts split into utils/contact.ts and utils/authFlow.ts; openLegal in utils/legal.ts.
- HomeScreen logic moved to useHome; src/dev moved to features/dev.
- Providers follow one pattern (undefined default, useMemo value, throwing useX).
- Login, OTP resend, profile save and add-vehicle ignore a second tap while pending.

**Deviations**

- Import groups are 7, not 6: @/core and @/shared/utils are separated from relative imports
  by ESLint's group rules.
- Pure helpers in core, theme and utils may stay `function` declarations.
- FleetHomeScreen stays in home (auth -> fleet require cycle).

**Verified**: tsc, expo lint, jest (39 suites, 228 tests) after every commit; Android and iOS
bundles build in Expo Go mode; Login renders on the iOS simulator.

## Fix: setup resume, fleet login, back button (2026-11-25, branch `fix/setup-flow`)

Requested after a review of every flow. One commit per part; not pushed.

**Done**

- `AppBackButton` (shared kit): one back button for AuthScaffold, SetupLayout, AppHeader and
  AppLargeTitleScroll. `hardwareBack` makes Android's back button run the same handler while
  the screen is focused; SetupLayout turns it on, so back in the vehicle wizard goes to the
  previous step instead of leaving the app.
- Checked against the old app (tests added): `API_URL` is `${apiHost}/v1` for every APP_ENV
  (development and staging `https://testapi.evechos.com/v1`, production
  `https://api.nexinev.com/v1`); fleet logout is `GET /fleet/logout`; `/client/info` sends
  `details`, `login`, `logo` and `clientDetails` (the old app added `clientDetails` as a param
  on top of the three in its endpoint string). No app code changed.
- Login driven by `/client/info`: `userLoginType` is lowercased ('Email' and 'email' both
  work). Email: email field only, no switch link. Phone: "Use email instead". "Fleet Login"
  shows on the right of the same row only when `features.fleet` is on.
- Fleet login (BLUEPRINT F1, F2), pulled forward from Phase 8:
  - Fleet Login: Fleet ID + mobile -> `POST /fleet/login { fleetId, contact }` ->
    `data.driverId`, toast, Fleet OTP.
  - Fleet OTP: 4 digits -> `POST /fleet/verify-otp { otp }`, tokens saved as a fleet session,
    the guard opens fleet home and `/` loads the driver. Resend:
    `POST /fleet/resend-otp { driverId }`, 30 s cooldown.
  - Routes in `(auth)/(fleet-auth)`, guarded: they open only when signed out and the fleet
    flag is on; otherwise they redirect to `/`.
  - The consumer and fleet OTP screens share `useOtpCode` (code entry, verify, resend) and
    `OtpView` (layout). `TermsLine` is shared by both login screens.
- Setup resume: `setup_progress` (KV) maps user id -> `profile | vehicle | permissions | done`.
  - Profile saved -> `vehicle`. Vehicle added or skipped -> `permissions`, so the vehicle step
    never shows again and no second vehicle can be added. Continue on Permissions -> `done`.
  - `/` resumes at the saved step. Reopened on Permissions: location and notifications both on
    -> `done`, Home; either off -> Permissions again.
  - A saved step wins over the server's `isFirstLogin` (OPEN_QUESTIONS #14). The old
    `setup_done_for` key is still read, so existing installs don't redo setup.
  - Guards: `(app)` opens only when setup is done; `(setup)` opens only the current step.

**Deviations**

- Fleet phone validation reuses the brand phone rules and messages ("Enter a valid mobile
  number"), not the old fleet copy "Enter a valid 10-digit mobile number" (the length is a
  brand value).
- Fleet OTP timer says "Resend in {n}s" like the consumer OTP (screen-audit 7.2: the old
  "Code expires in" was the resend cooldown). The Fleet ID chip is hidden when the param is
  missing instead of showing a fake "FLT-001".
- The fleet badge says "Fleet Operator" as in the old app, although the profile calls the
  user a driver (screen-audit 7.1).
- Every back button now reads "Back" to screen readers (the OTP one said "Go back").
- Tests that open `(app)` directly now wait for `/`: the guard needs the user, which boot
  loads before the stack renders in the app.

**Verified**: tsc, expo lint, jest after every commit (46 suites, 297 tests). Not run on a
device or simulator.

**Left**

- Device check on the iOS simulator and an Android emulator: onboarding -> login -> OTP ->
  setup (including a restart on each step and Android back in the wizard) -> home -> logout,
  and the fleet login flow with the flag on (needs a fleet test account).
- Fleet home is still a placeholder (rest of Phase 8).

## Phase 3a: Tab bar and Map home (branch `feat/tabs-map`, 2026-11-25)

**Done**

- Tab bar (B0): Map, Stations, Scan, Wallet, Profile, with labels and screen-reader names. Scan
  is a raised round button that pushes `/scan`, so the camera never mounts in the tab bar. The
  bar hides when the keyboard is open. Tabs live in `MainTabs` (home feature); the route file
  only renders it.
- `/home` is the Map. The old Home content (signed-in card, dev tools, log out) moved to the
  new Profile tab (`src/features/profile`). Stations, Scan and Station Details are placeholders.
- New `src/features/stations`:
  - `stationsApi.getLocations(filters)` (`GET /station/locations`) and
    `getNearby(center, filters, 5)` (`GET /station`). Both return models: money in paise,
    missing numbers as `null`, rows without coordinates dropped.
  - Pins are clustered with supercluster. The index is rebuilt only when the pins change, and
    clusters are recomputed 250 ms after the map stops moving. Tapping a cluster zooms into it.
  - Custom markers stop `tracksViewChanges` 500 ms after they paint (and again after a colour
    or selected change).
  - Pin colours follow the brand's connector colours by station status.
  - Pin tap highlights the pin. If the station is in the nearby list, the carousel scrolls to
    its card; otherwise a single peek card shows. Card or peek tap opens Station Details.
    Swiping the carousel highlights the matching pin and pans the map to it.
  - Location is never asked for on open: the map starts at `brand.defaultRegion` and silently
    moves to the user only if permission is already on. The my-location button asks; a denial
    shows the existing "Location Access Required" dialog with Open Settings.
  - Filters sheet (min power, Public/Private, connectors) with an active count on the filter
    button. Nothing is filtered by default.
  - States: skeleton cards while loading; error toast (at most once per 3 s) plus a Retry card;
    empty card with "Clear filters" or "View all stations"; offline uses the global banner.
- Google Maps keys go through the `react-native-maps` config plugin from env only. Without
  `GOOGLE_MAPS_IOS_KEY` iOS uses Apple Maps (no custom style). README explains the dev build.
- Tests: mappers, status, availability, filters, geo and clustering; station paths in
  `endpoint-urls`; a map flow test with react-native-maps mocked in `jest.setup.ts`.

- Crash fix: an Android dev build made before react-native-maps was added crashed with
  "RNMapsAirModule could not be found". `src/core/maps.ts` now checks the native module and,
  on Android, the Google Maps key; the map component loads only when both are there, otherwise
  a notice shows and the station cards still work. Fix for the device itself: rebuild the dev
  build (`npx expo prebuild --clean` + `npx expo run:android`).
- 2027 refresh: floating glass tab bar (`FloatingTabBar`, `AppGlass`), one glass capsule for
  search + filters, glass my-location button, larger station cards with a stats strip, map
  padded around the overlays, no shadows (DESIGN.md updated). The map centres on the user only
  after `onMapReady`, and only a user swipe selects a card.
- Checked on the iOS simulator (Apple Maps, liquid glass) and the Android emulator (no key, so
  the notice shows).

**Deviations**

- Min power uses preset chips instead of a slider (OPEN_QUESTIONS #16).
- All stations load at once; the API has no bounds yet (OPEN_QUESTIONS #15).
- Search pill and "View all stations" open the Stations tab placeholder; the active-charging
  button waits for the charging phase.
- The my-location denial reuses the shared permission dialog instead of new copy.

**Verified**: tsc, expo lint, jest (49 suites, 330 tests); iOS simulator and Android emulator.
The Android map itself still needs `GOOGLE_MAPS_ANDROID_KEY`.

**Left**

- Device check on Android and the iOS simulator: marker performance with many pins, carousel
  and pin sync, my-location allow/deny, filters.
- Stations list (B2) and Station Details (B3).

## Phase 3b: Station Details (branch `feat/station-details`, 2026-11-25)

**Done**

- `GET /station/:id`, `GET /station/favourites/all?page=1&limit=100` and
  `POST /station/favourites/:id { isFavourite }` in `stationsApi`, mapped to models (paise,
  plain connector states instead of raw OCPP codes, nulls for missing numbers).
- Screen (`StationDetailsScreen`, route `station/[stationId]`): hero with glass back / share /
  heart, status, name, address, stats (distance and drive only with location), amenities,
  chargers with free ones first, connector rows, sticky Get Directions + Call.
- Connector tap: Available or Preparing opens `/charging-summary` (placeholder until the
  charging phase) with stationId, chargerId and connectorId; others toast
  "Connector is currently {status}".
- Directions: iOS asks Apple Maps or Google Maps, Android opens Google Maps, both fall back to
  the web link.
- States: skeleton, error with Retry, empty chargers, pull to refresh.
- Tests: mappers, connector rules, share text, maps URLs, endpoint paths, a screen flow test.

**Old-app bugs fixed**

- The heart always sent `isFavourite: false`; it now sends the new state, flips at once and
  rolls back with a toast if the server refuses.
- Share text used another brand's links (`lekha://`, lekha.com); it now uses this build's
  scheme (`expo-linking`) and `brand.deepLinkDomains[0]`.
- Call is hidden without a phone number; a charger without a tariff no longer crashes the
  mapper; the hard-coded rating, reviews, network and hours are gone.
- Header buttons have screen-reader labels and 44 pt targets.

**Verified**: tsc, expo lint, jest (51 suites, 354 tests); Android emulator with the real
staging station (layout, amenities, busy-connector toast). Not checked on iOS yet.

**Left**

- Charging Summary (Phase 4) behind the connector tap; Stations list (B2) still a placeholder.

### Station Details redesign (2026-11-26, branch `feat/station-details`)

**Done**

- Hero (40% of the screen, fixed): a paging photo slider (expo-image, memory-disk cache) with
  a "1/4" pill when there are several photos; broken URLs are skipped. With no usable photo, a
  brand-coloured station scene (`StationScene`: two chargers, cables, two cars) fills the hero.
  Status pill shows the station status exactly as the API sends it, then name, address and
  stats (distance, drive, kW, price per kWh).
- Header: glass back / share / heart float over the hero (light glass so they stay visible on
  dark photos); past the hero a solid bar with the station name fades in.
- Connector statuses: one mapper (`toConnectorStatus`) with the CruzeEV labels for every OCPP
  code, colours from `brand.connectorStatusColors` (theme `status.connector[state]`, main +
  tint). Offline codes use the old app's fallback ("Unavailable", red).
- Chargers grouped: "Charger 1 · DC · 60 kW" with "1/2 free", connectors always in a
  sideways swipe row (one connector fills the width), compact cards with the status gradient,
  battery % and time to full while charging.
- About card: address, 3 amenities + "+N", "View all details" opens a 60%/90% sheet with
  Copy address, help line (only with a phone), access, connector types and all amenities with
  icons. Rows without data are hidden.
- Floating bottom bar: dark "Get Directions · ETA" plus Call only with a phone number.
- Type: new `title3` (20) for section headings; labels and values at 14 bold; tighter gaps.
- Sheets fix (also the map Filters and Maps chooser): `dismiss()` on a never-opened
  BottomSheetModal fires `onDismiss`, which closed sheets as they opened. `AppSheet` and
  `StationInfoSheet` now only dismiss and report back after they were presented.
- Dev build hides the tools gear (`expo-dev-client` `toolsButton: false`); expo-clipboard
  added.

**Verified**: tsc, expo lint, jest (51 suites, 369 tests); iOS simulator and Android
emulator (hero variants, scrolled header, sheet open/close/reopen, Filters sheet, statuses).

**Notes**

- The repeated Reanimated "Dependencies should only be used on the web" warning comes from
  `@gorhom/bottom-sheet`, not app code.
- iOS drive time needs a simulator location near the station (more than 300 km shows none).

**Left**

- App-wide pass with the compact type sizes (plan proposed, waiting for approval).
- Charging Summary (Phase 4); Stations list (B2).

## Phase 3c: Stations tab (branch `feat/stations-list`, 2026-11-26)

**Done**

- Stations tab (B2): large "Stations" title, a search field ("Search stations...", clear button)
  and the nearest stations, 10 a page (`GET /station`, `stationsApi.searchStations`).
- Search runs 500 ms after typing stops (`useDebouncedValue`); answers for an older search are
  dropped. Infinite scroll at 40% from the end, pull to refresh, the list drag closes the
  keyboard.
- `StationListCard`: the map card at list size: white availability and kW pills with a heart,
  the name, then distance · drive · ₹/kWh beside a dark Go pill (opens directions). Header has
  a brand wash, subtitle and the map's glass search capsule. Previously: name, address, heart, then
  "2/4 Free" or red "Unavailable", kW, price per kWh and distance. The tint follows the pill.
- Hearts flip at once, toast "Added to favourites" / "Removed from favourites", roll back on
  error, and re-sync from the server every time the tab is focused.
- States: 3 skeleton cards; "Location is off" + Enable location; "Couldn't load stations" +
  Retry; "No stations found" + Clear Search; "No stations available"; a footer skeleton while
  loading more. If location is allowed but has no fix, the list uses the brand's default region.
- The map's search pill opens the tab with the field focused; "View all stations" opens it plain.
- Tests: availability label rules, paging merge, a screen flow test (debounce, paging, every
  state, heart rollback, card tap, focus param) and the map search pill.

**Deviations**

- 10 per page instead of the old app's 5 (OPEN_QUESTIONS #17).
- No profile button in the header (it duplicated the Profile tab) and no filters yet.

**Verified**: tsc, expo lint, jest (53 suites, 386 tests); Android emulator with staging
(list, search with no results, Clear Search, map search pill focus).

## Phase 4a: Wallet (branch `feat/stations-list`, 2026-11-26)

**Done**

- Wallet tab (D1): title, a dark balance card with an animated wallet (`WalletArt`: card
  sliding out, coins bobbing), the balance counting up to its value, an eye to hide it and Add
  Money; "Transactions" with See All and the latest 10 on one card. Quiet reload on focus (no
  skeleton flash), pull to refresh, skeleton / empty / error + Retry.
- Wallet History (D2, `/(app)/wallet/history`): All / Credit / Debit, sticky month headers,
  10 a page with infinite scroll; pull to refresh keeps the list on screen.
- Add Money (D3, `/(app)/wallet/add?amount=`): a large amount field, the brand's quick amounts
  (`brand.quickTopUpRupees`) and the minimum (`brand.minTopUpRupees`) shown up front, coupons
  as tickets (only ACTIVE, only with `features.coupons`), Price Breakdown with cashback.
  Create order → Razorpay → verify → refresh the user. Result sheets with a drawn mark
  (`ResultArt`): success (credits, order id), failure with Try Again on the same order, and
  "Payment Not Confirmed" with no retry when verification fails after paying.
- `src/core/payments.ts` wraps react-native-razorpay: loads it only when a payment starts and
  reports `unavailable` on builds without the native module (toast, no crash).
- `AppFade` moved to the shared kit (used by Stations, the station hero and Wallet).
- Tests: wallet endpoint paths, mappers, amount and coupon rules, transaction display, and
  flows for the three screens (balance, hide, retry, history filter paging, minimum, quick
  amount, success, failure → retry, unverified, missing native module).

**Deviations**

- Credit / Debit filtering is client-side over paged data (OPEN_QUESTIONS #18).
- react-native-razorpay was added: rebuild the dev build (`npx expo run:ios` /
  `npx expo run:android`) before testing a real payment.

**Verified**: tsc, expo lint, jest (55 suites, 411 tests); Android emulator (Wallet tab,
Add Money with quick amounts). A real payment was not run.

## Phase 7a + 7b: Profile tab and Edit Profile (branch `feat/profile`, 2026-11-26)

Stacked on `feat/stations-list` (PR #6, itself stacked on #5).

**Done**

- Profile tab (E1), in the Wallet tab's style: brand wash, "Account" title with the user ID, a
  bell (no badge: the API sends no unread count, OPEN_QUESTIONS #22), and the account card
  (initials, name, email or "No email provided", phone, edit). Counts from `GET /profile`
  (`data.stats`): skeletons while loading, friendly zero ("No vehicles yet") and singular /
  plural ("1 vehicle"). Coming back to the tab refreshes them quietly behind what is shown;
  pull to refresh; an error strip with Retry when they can't load.
- Rows for screens not built yet (My Vehicles, Charging History, Favourite Spots,
  Notifications) open a "Coming soon" screen at their final route
  (`/(app)/vehicles`, `/(app)/charging/history`, `/(app)/favorites`, `/(app)/notifications`).
- Help & Support opens the support URL in the in-app browser, hidden when there is none.
  Log out keeps its confirm. Delete Account is a separate red row (see Deviations).
- Version line "{brandName} v{version} ({build})" from expo-application, with the config
  version as a fallback on dev builds made before the module was added.
- Edit Profile (E2, `/(app)/profile/edit`): first and last name kept apart (fixes the
  duplicated surname), email optional, phone with the brand's country code as a fixed prefix,
  GSTIN validated (15-character format) and uppercased. Inline errors on blur. Save stays off
  until something changed and everything is valid. A new phone number needs OTP first: a
  4-digit sheet that focuses on open, verifies on the last digit (paste and SMS autofill come
  from the shared OtpInput), resends after 30 s, and says so on a wrong or expired code.
  `PUT /profile` sends only changed fields; on success the user is reloaded (Profile shows
  the new name at once), a toast, then back. Server field errors go under their field; other
  errors show with Retry above Save. Leaving with edits (back button, Android back, swipe)
  asks "Discard changes?".
- An account that signed up by email has no phone: phone is optional for it (required only
  when the account already has one, so it can't be cleared).
- `AppBackButton` takes a `fallbackHref`; `OtpInput` is exported from auth.
- Tests: validation (email, phone, GSTIN), changed fields, counts, the deletion path, the
  error mapper, the stats mapper and endpoints; flows through the real router (loaded,
  loading, error + Retry, bell, Delete Account with the brand's URL, edit → OTP → save →
  Profile shows the new name, wrong code, server field error, GSTIN, email-only account,
  discard); Delete Account per brand (own URL; no URL → support, never cruzeev.in).

**Deviations**

- Delete Account: no in-app deletion yet (OPEN_QUESTIONS #19). It opens the brand's own page
  after a confirm, or "Contact support" when the brand has none. `brand.deleteAccountUrl` is
  now optional so no brand inherits another's page.
- Email changes save without OTP until `/profile/send-otp` is tested with an email
  (OPEN_QUESTIONS #20). The `PUT /profile` error shape is unconfirmed (#21).
- "Error with Retry" on save is an inline strip above Save, not a toast action: adding an
  action to the toast helper was left out because that file has uncommitted local edits.
- expo-application was added: rebuild the dev build to show the native version and build.

**Verified**: tsc, expo lint, jest (58 suites, 445 tests); iOS simulator (Profile loaded,
zero counts); Android emulator (Profile, Delete Account confirm, Edit Profile validation,
Discard on Android back). Not seen on a device: the Profile error strip (needs `/profile` to
fail while boot succeeds; covered by a flow test) and the OTP sheet (needs a test contact so no
code goes to a real person).

## Phase 4: My Vehicles, Add Vehicle, Edit Vehicle (branch `feat/vehicles`, 2026-11-27)

**Done**

- My Vehicles (E3, `/(app)/vehicles`), in the Profile screens' style: brand wash, back, title
  and count. The primary vehicle first, then newest. Each card: duotone car tile, "{brand}
  {model}", the plate once, Primary / battery / range chips, and an auto-charge switch that
  needs a MAC ID (disabled with "Add a MAC ID to use auto-charge" otherwise, decided with the
  client). Tapping a card opens Edit; ⋯ opens Edit / Make primary / Delete (no swipe-only
  actions). Auto-charge and Make primary are optimistic with rollback; only one vehicle is
  primary. Delete asks first and warns about the primary or only vehicle, then reloads.
  Add Vehicle pinned at the bottom. Skeletons, empty, error + Retry, pull to refresh, quiet
  refresh on focus.
- Add Vehicle (E4, `/(app)/vehicles/add`): the setup wizard without Skip, with "Step n of 4",
  back stepping through the wizard (Android back too), success → toast and back. The details
  step subtitle no longer claims the reg no is only for auto-charge.
- Edit Vehicle (E5, `/(app)/vehicles/[vehicleId]/edit`): a form instead of the wizard. Loads
  by id (from the list, OPEN_QUESTIONS #25), a vehicle card with "Change" that runs the
  wizard's brand / model / battery pickers (`useVehicleWizard({ onPicked })`) and comes back,
  reg no / MAC ID / max amount in place. Save only after a change; `PUT /vehicle/:id`; asks
  before leaving with edits; "Couldn't find this vehicle" for a stale id.
- Tests: vehicle mapper (capacity as a number or `{ capacity }`), sort / primary / MAC rules,
  edit draft and change detection, endpoints; flows for the list (order, chips, auto-charge
  with rollback, Make primary with rollback, delete with the primary warning, empty, error,
  open Edit), Add (wizard → add → back) and Edit (save, Change pickers, unknown id).

**Open**: clearing MAC ID / max amount on edit (#23), primary after delete (#24), a
single-vehicle endpoint (#25), what auto-charge does (#26).

**Verified**: tsc, expo lint, jest (60 suites, 463 tests); Android emulator against the dev
backend (My Vehicles empty state, Add Vehicle step 1 with the live brand list). Cards, the
actions sheet and Edit were not seen on a device: the test account has no vehicles and none
was added, to avoid writing to the shared dev data.

## Phase 7c: Charging History and Invoice (branch `feat/vehicles`, 2026-11-27)

**Done**

- Charging History (E6, `/(app)/charging/history`): All / Completed / Active tabs with counts
  (the shared segmented control), newest first under month labels. Cards in the Stations card
  style: station and address with the cost, tokens for energy, time, connector and power, and a
  footer with the glowing status and the date. Every card opens its invoice (completed and
  active, as asked). Skeletons, empty (per tab), error + Retry, pull to refresh, quiet refresh on
  focus.
- Invoice (C5, `/(app)/invoice/[id]`): a receipt card (status, station, date, total paid,
  session id) then Session, Location and Billing cards; lines without data are hidden. Billing
  follows the old maths: energy charge = `amount`, price per unit = amount / kWh, `gst` split
  equally into SGST and CGST (each at half of `calcTaxPercent`), total = `price`. Error state with
  Retry instead of the old auto back. An active session shows a note instead of Download.
- Download Invoice: `GET /invoice/:id` (PDF) with the signed-in token and client token, saved
  into the app's documents, then the share sheet (Save to Files / Downloads, Drive, mail…).
  expo-file-system and expo-sharing added; sharing is loaded on demand so an older dev build
  shows "Update the app to download invoices" instead of crashing.
- `AppPageHeader` (back, eyebrow, title, caption on the wash) moved to the shared kit; vehicles
  and history use it.
- Tests: session and invoice mappers (including the billing maths), status codes, duration /
  energy / tax formatting, sort / filter / month groups, file names; flows for the list (order,
  tokens, cost, status, tabs, open invoice, empty, error) and the invoice (receipt, SGST / CGST,
  download → share, failed download, active note, error + Retry).

**Open**: status codes (#27), `charginDuration` units (#28).

**Verified**: tsc, expo lint, jest (62 suites, 478 tests); Android emulator: the live history
call (empty for the test account), and the list and invoice with local sample data (reverted).
The PDF download needs a real completed session and a dev build rebuilt for expo-sharing.

## Phase 7d: Favourite Spots (branch `feat/vehicles`, 2026-11-27)

**Done**

- Favourite Spots (E7, `/(app)/favorites`): the brand wash, `AppPageHeader` with the count, the
  white `AppSearchBar` (debounced, sent to the server as `search`), and saved stations from
  `GET /station/favourites/all?page&limit=10`, a page at a time with infinite scroll. Each card:
  a pin tile, name and address, a filled red heart that removes it (optimistic, rolled back if
  the server refuses; `POST /station/favourites/:id { isFavourite: false }`), a dark Directions
  pill when the station has a location, and a tap to Station Details.
- A station hearted anywhere (Stations tab, map card, Station Details) appears with a filled
  heart: the screen reloads its first page every time it comes back into focus.
- Empty: "No favourites yet" with Find stations (to the Map tab); search with no match: "No
  favourites found" with Clear Search; error + Retry; pull to refresh.
- Tests: the favourite mapper (station inside each favourite, place, location) and flows (list
  with filled hearts, directions only with a location, open details, a newly hearted station
  after refocus, remove with rollback, server search, paging, empty, error).

**Verified**: tsc, expo lint, jest (63 suites, 485 tests); Android emulator against the dev
backend: hearted Demo Charging Station on the Stations tab, it appeared in Favourite Spots with a
filled heart and Directions, then removed it with the heart (dev data left as it was).

## Phase 7e: Notifications (branch `feat/vehicles`, 2026-11-27)

**Done**

- Notifications (E8, `/(app)/notifications`): the brand wash, `AppPageHeader` with the unread
  count ("2 unread" / "You're all caught up"), and category pills that scroll sideways (All,
  Offers, New Station, Maintenance, Customer Support, Information), each with its count.
- `GET /notification?page=` a page at a time with infinite scroll and pull to refresh, grouped
  by day (Today, Yesterday, then the date). Each card: a tile in its category's colour (offers
  green, maintenance amber, new station and support in the accent, information grey), the
  category and a relative time ("5 min ago"), the title and the message, 2 lines.
- Fixes from the audit: unread cards are tinted with a glowing dot and a bold title; tapping
  one opens the full message and marks it read (on the device only, #29); a category with
  nothing in the loaded pages keeps fetching until something shows up.
- Unknown `type` values show as Information; a blank title falls back to the category.
- Empty: "No Notifications" (audit copy); an empty category offers Show all; error + Retry.
- Tests: `toKind`, the mapper, filters, day groups, relative times, and flows (pills, unread
  count, open marks read, empty category, empty, error + Retry, paging, auto-fetch).

**Open**: mark as read, type filter and unread count on the server (#29).
