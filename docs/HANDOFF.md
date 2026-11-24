# Handoff: feature-folder refactor (in progress)

Branch `wip/auth-refactor`, cut from `feat/auth` at `78424d9`. Snapshot date 2026-11-24.
This commit is intentionally unfinished: lint is red (see Status).

## Goal

Make each feature readable in a few minutes: fewer files and layers, no one-call wrappers,
no dead code, same behaviour. Target layout for every feature (auth first, then fleet, then
client-config):

```
src/features/<feature>/
  screens/       UI only: layout, styling, wiring to hooks. No API calls, no logic.
  components/    UI pieces used only by this feature.
  api.ts         every network call (axios). Each call returns a domain model; the DTO
                 mappers (toUser, toTokens, ...) live next to the call and are exported
                 only for tests.
  hooks.tsx      all logic and state: context provider, actions, validation, side
                 effects, screen hooks (useLoginForm, useOtpForm, ...).
  constants.ts   static data: copy, timeouts, lengths, route hrefs, lookup data.
                 No UI imports (icons stay in screens).
  types.ts       types for the feature (DTOs, models, unions).
  index.ts       public exports. Other features and src/app import only from here.
```

Conventions kept from AGENTS.md: route files in `src/app` stay one-line; `src/core` and
`src/ui` never import features; no hard-coded brand values; comments only for a non-obvious
"why"; tests live in `tests/<area>/`.

## Done (auth only)

Added
- `src/features/auth/hooks.tsx`: merged `AuthContext.tsx`, `hooks.ts` and `utils.ts`, plus
  logic moved out of screens: `useLoginForm`, `useOtpForm`, `useStartRoute`,
  `useRouteGuard`, `finishOnboarding`. `runBoot` folded into `useBoot`.
- `src/features/auth/constants.ts`: OTP length, resend seconds, session-check and logout
  timeouts, onboarding flag value, `START_HREF`, `LOGIN_COPY`, `ONBOARDING_SLIDES`.

Deleted
- `src/features/auth/AuthContext.tsx`, `hooks.ts`, `utils.ts` (contents moved as above).
- Dead code: `registerFcm()` (never called), `otpSchema` (unused), `signOutEverywhere()`
  (one-line wrapper; `logout` now calls core `signOutThen(serverLogout)` directly),
  re-export of `Tokens` from `types.ts`, exported-but-internal `OtpCellState`,
  `BootLoaders`, `runBoot`, `withTimeout`, `UserStatus` from the index.

Changed
- `api.ts`: calls renamed and return models: `requestOtp(contact)`, `verifyOtp(otp) ->
  Tokens`, `getUser() -> User`, `logout(token)`. `LOGOUT_TIMEOUT_MS` moved to constants.
- `types.ts`: added `ContactForm`, `UserStatus`, `StartRoute`, `RouteGroup`,
  `GuardDecision`, `BootStatus`, `OnboardingSlide` (slide `key` is a union).
- Screens now UI only: `LoginScreen` (uses `useLoginForm`), `OtpScreen` (`useOtpForm`),
  `OnboardingScreen` (slides from constants; icons mapped by key in the screen),
  `StartRedirect` (`useStartRoute`), `TempHomeScreen`, `SignedInPlaceholderScreen`.
- `components/GuardedStack.tsx` uses `useRouteGuard`; `components/OtpInput.tsx` imports
  helpers from `../hooks`.
- `index.ts` trimmed to what `src/app` and the root layout use.
- Tests: import paths updated (`otp`, `schemas`, `routes`, `logout`); the logout test now
  exercises `signOutThen(serverLogout, store)`. No test logic removed.

Diff vs `78424d9`: 19 files changed, 109 insertions, 612 deletions, plus 2 new files
(`hooks.tsx`, `constants.ts`) and this doc.

## Not done

1. **Lint: 11 errors in `src/features/auth/screens/OtpScreen.tsx`** (rule
   `react-hooks/refs`, lines 81-100). `useOtpForm` returns `inputRef` inside its result
   object, so the React Compiler treats every `otp.*` read in render as a ref read.
   Planned fix: the screen owns the `TextInput` ref and passes
   `useOtpForm(type, value, { onWrongCode: () => ref.current?.focus() })`; the hook stops
   returning the ref.
2. **fleet**: `FleetContext.tsx` -> `hooks.tsx`; `FLEET_LOGOUT_TIMEOUT_MS` (in `api.ts`)
   -> `constants.ts`.
3. **client-config**: `ClientConfigContext.tsx` -> `hooks.tsx`; cache helpers
   (`fromCache`, `toCache`, `fallbackClientConfig`, `CACHE_VERSION`) out of `api.ts` into
   `hooks.tsx` / `constants.ts`; boot timeout -> `constants.ts`.
4. **AGENTS.md and BLUEPRINT.md**: still describe `utils.ts` and `<Name>Context.tsx`.
   Update "Architecture rules", "Folder layout" and BLUEPRINT section 4 to the layout above.
5. Not verified on a device after this refactor (only typecheck and tests).

## Decisions and deviations

- `hooks.tsx`, not `hooks.ts`: providers return JSX. Owner approved.
- DTO mappers stay in `api.ts` so hooks and screens never see raw shapes. Owner approved.
- `jest.setup.ts` now stubs the `@/ui` index (`toast`, `haptics` only). Reason: `hooks.tsx`
  imports `@/ui` and the client-config index (which exports `AppLogo`), which loads
  Reanimated; Reanimated 4's own Jest mock fails here (`setCSSEventHandler` /
  `loadUnpackersWithCode`). Tests needing real UI code import the file directly
  (`@/ui/connectors/types`). Consider instead keeping pure rules in a file without UI
  imports (see open question 1).
- Onboarding slide icons moved from constants into the screen (`SLIDE_ICONS`), because
  Lucide is ESM-only and breaks Jest when imported from a non-UI module; icons are UI anyway.
- Deviation from AGENTS.md "Folder layout": `utils.ts` and `<Name>Context.tsx` no longer
  exist in auth; docs not yet updated (Not done 4).
- Earlier in this branch's history (already committed on `feat/auth`, not part of this
  refactor): TanStack Query was replaced by Auth/Fleet/ClientConfig contexts + `useRequest`
  / `useAction` (`src/core/request.ts`); Zustand kept only as the token store. Recorded in
  PROGRESS.md as a deviation (no shared cache, no refetch on focus or reconnect).
- No DESIGN.md deviations in this refactor; UI and copy are unchanged.

## Open questions for the owner

1. `auth/hooks.tsx` is 497 lines. Keep one file per the target layout, or allow splitting by
   topic (for example `session.ts` for pure rules and boot, `hooks.tsx` for context and
   screen hooks) so pure logic has no UI imports and the `@/ui` Jest stub can go?
2. `AuthProvider` and `FleetProvider` repeat the same "status + generation counter + reset
   on session change" state. Share one small helper, or keep the duplication for locality?
3. Add `@testing-library/react-native` for render tests of providers, `useRequest` and the
   login / OTP / logout flows?

## Status at this commit

| Check | Result |
|---|---|
| `npm run lint` | **fail**: 11 errors, 0 warnings (all `react-hooks/refs` in `OtpScreen.tsx`, lines 81-100) |
| `npx tsc --noEmit` | pass: 0 errors |
| `npm test` | pass: 25 suites, 187 tests |

## App flow and owning files

1. **Boot**: `src/app/_layout.tsx` mounts providers (`ClientConfigProvider` >
   `FleetProvider` > `AuthProvider` > theme) and `AppShell`, which runs `useBoot`
   (`auth/hooks.tsx`): `restoreSession` (storage hydrate, legacy migration, token hydrate
   via `src/core/storage.ts` and `src/core/session.ts`), then client config, then
   `checkSession`. `src/ui/SplashOverlay.tsx` covers this and docks the logo when ready.
   Failure shows `auth/screens/BootErrorScreen.tsx`.
2. **Client config**: `client-config/ClientConfigContext.tsx` `prime()`: cached config at
   once plus background refresh, else wait up to 8 s for `GET /client/info`
   (`client-config/api.ts`), else brand fallbacks.
3. **Start route**: `src/app/index.tsx` -> `auth/screens/StartRedirect.tsx` ->
   `useStartRoute` / `resolveStartRoute` (`auth/hooks.tsx`): fleet, setup, home, login or
   onboarding.
4. **Auth**: `src/app/(auth)/*` -> `OnboardingScreen` (`finishOnboarding`), `LoginScreen`
   (`useLoginForm` -> `POST /auth/app/login`), `OtpScreen` (`useOtpForm` ->
   `POST /auth/app/verify`, then `sessionStore.signIn`). Layout: `components/AuthScaffold.tsx`.
5. **Route guard**: every group layout renders `components/GuardedStack.tsx` ->
   `useRouteGuard` / `guardRoute`. Signing in or out flips the session mode, the guard
   redirects to `/`, and step 3 picks the next screen.
6. **Home**: `src/app/(app)/(tabs)/index.tsx` -> `auth/screens/TempHomeScreen.tsx`
   (placeholder; logout via `useAuth().logout` -> `signOutThen` in `src/core/session.ts`).
   API auth and the 401 refresh queue: `src/core/api.ts`.
