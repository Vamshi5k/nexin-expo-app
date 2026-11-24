# Progress

Phase numbers follow the project prompts, not BLUEPRINT.md section 7:

| Phase | Scope                                                                          | Blueprint section 7 | Status                          |
| ----- | ------------------------------------------------------------------------------ | ------------------- | ------------------------------- |
| 0     | Template and white-label brand layer                                           | part of Phase 0     | Done                            |
| 1     | Foundation (theme, UI kit, core api/session/storage, root layout) + UI refresh | Phase 0             | Done, tag `phase-1-done`        |
| 2     | Client config and consumer auth (A1-A4, A9)                                    | Phase 1             | In progress, branch `feat/auth` |

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

## Phase 2: Client config and consumer auth (in progress, branch `feat/auth`)

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
- The "Fleet Login" link on Login is hidden until `(auth)/fleet-login` exists (fleet phase).
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
