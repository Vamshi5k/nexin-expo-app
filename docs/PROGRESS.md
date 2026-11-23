# Progress

Phase numbers follow the project prompts, not BLUEPRINT.md section 7:

| Phase | Scope                                                                          | Blueprint section 7 | Status                   |
| ----- | ------------------------------------------------------------------------------ | ------------------- | ------------------------ |
| 0     | Template and white-label brand layer                                           | part of Phase 0     | Done                     |
| 1     | Foundation (theme, UI kit, core api/session/storage, root layout) + UI refresh | Phase 0             | Done, tag `phase-1-done` |
| 2     | Client config and consumer auth (A1-A4, A9)                                    | Phase 1             | Next, branch `feat/auth` |

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

## Phase 2: Client config and consumer auth (next)

Branch `feat/auth`. Scope: `/client/info` with cache, route groups and guards, boot/splash
(A1), onboarding (A2), login (A3), OTP (A4), boot error screen (A9 style), logout. Plan
pending approval.
