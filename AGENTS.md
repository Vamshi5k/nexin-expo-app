# EV Charging App Template (Expo)

This repo is a WHITE-LABEL TEMPLATE for an EV charging app (consumer + fleet driver modes).
It is a rebuild of the bare RN app "Cruze EV". Each client gets its own repo created from this
template; the ONLY per-client differences live in `brand/` and EAS secrets.

## Source of truth

- docs/BLUEPRINT.md: API contract, screens, navigation, bugs to fix, architecture. Follow it.
- docs/screen-audit.md: exact UI copy per screen. Use it verbatim.
- All UI follows docs/DESIGN.md. Never style a screen ad hoc; use the App\* kit in
  src/shared/components and the tokens in src/shared/theme.
- ../Cruzev_nexin_whitelable_app: old app, read-only reference. Never copy its bugs (BLUEPRINT section 1 list).

## Stack (do not swap without asking)

Expo SDK (latest stable) + expo-dev-client (the dev build is the real target; Expo Go is a
limited preview: `kv` falls back to AsyncStorage via `isExpoGo` in src/core/storage.ts, and any
new native-only library must be guarded the same way or listed as Expo Go-incompatible),
Expo Router (typed routes),
TypeScript strict, React Context (AuthContext, FleetContext, ClientConfigContext) + plain axios,
Zustand (token store only), react-hook-form + zod, socket.io-client,
expo-secure-store, react-native-mmkv, react-native-maps + supercluster, expo-location,
expo-camera, @react-native-firebase/messaging + expo-notifications, react-native-razorpay,
@gorhom/bottom-sheet, expo-file-system + expo-sharing, lucide-react-native, sonner-native (toasts,
only via src/shared/utils/toast.ts), @sentry/react-native.
Install native deps with `npx expo install`, never plain npm, so versions match the SDK.

## White-label rules (most important)

- NEVER hard-code a brand name, colour, URL, host, token, bundle id, scheme, phone regex,
  currency, locale, map region or amount limit in app/ or src/. Read it from `src/core/config`
  (build-time, from brand/) or `useClientConfig()` (runtime, from GET /client/info).
- Runtime values from /client/info win over build-time fallbacks for brand name, logo, legal
  and support URLs, login type and feature flags.
- Feature flags (fleetFeature, couponFeature) must fully hide their UI and routes when off.
- If you need a new brand-specific value, add it to the brand schema (brand/schema.ts) with a
  default, never inline it.

## Architecture rules

1. src/app/\*\* are thin route files: read params, render a screen from a feature's index.ts.
   No fetching. They stay default exports because expo-router needs them.
2. Endpoint paths live only in src/core/endpoints.ts (`ENDPOINTS.DOMAIN.ACTION`, functions for
   paths with params). Never write a URL string anywhere else.
3. `api/<feature>.api.ts`: every network call of the feature, and nothing else. It exports one
   object, `<feature>Api = { getUser, ... }`. Each call returns a domain model, never raw
   `response.data`; its DTO mapper (`toUser`, `toFleetUser`, ...) is a separate named export in
   the same file, used by the api object and by tests. Components never see raw API shapes.
4. `hooks/`: all feature logic and state, one hook per file (`useLoginForm.ts`). A context
   provider sits in the file of its hook (`useAuth.tsx` holds `AuthProvider` + `useAuth`).
   Screens call hooks and stay UI only. Load data with `useRequest`, run writes with
   `useAction`, keep per-account data (user, driver) in `useSessionData` (src/core/request.ts).
5. `utils/`: pure helpers and rules with no React or UI imports, so tests load them directly.
   A file that also reads storage or calls the API says so in its first comment.
6. Zustand = client state only (the token store in src/core/session.ts, filters). Server data
   lives in the contexts (user, driver, client config) or in a screen's `useRequest`. Contexts
   reset on every session change and drop responses for the previous session.
7. Errors: `apiError` + `isX` guards from src/core/api.ts, shown with `getErrorMessage` and
   `toast` from src/shared/utils/toast.ts. Never call sonner-native directly.
8. Features import each other only via their index.ts. src/shared and src/core never import
   src/features.
9. Money is computed in paise (integers), converted with src/shared/utils/money.ts. Format only
   at render time.
10. No `any` in api/hooks. No console.\* in committed code (use src/core/log.ts).
11. Every list/detail screen has loading (skeleton), error (+Retry), empty and offline states.
12. Tests: pure logic (mappers, utils, rules) is tested directly. Flow tests render screens
    with @testing-library/react-native inside `AppProviders` (tests/helpers/render.tsx), or
    through the real router with `renderRouter`; they mock the feature's api file
    (`jest.mock('@/features/auth/api/auth.api')`), never hooks.

## Folder layout

```
src/app/                  expo-router route files (thin, default exports)
src/core/*.ts             infrastructure, flat files: api, config, endpoints, log, network,
                          permissions, request, session, storage
src/shared/
  components/             App* kit (AppText, AppButton, AppScreen...), index.ts barrel
  theme/                  tokens, palette, ThemeProvider, fonts
  utils/                  toast, haptics, keyboard, money
  assets/images.ts        every image the app require()s
src/features/<feature>/   only the subfolders it needs, never empty ones
  api/<feature>.api.ts    network calls + DTO mappers
  hooks/useXxx.ts         one hook (or provider + hook) per file; .tsx only if it has JSX
  types/<feature>.types.ts      DTOs, models, unions
  constants/<feature>.constants.ts   copy, timeouts, lengths, route hrefs; no UI imports
  utils/<topic>.ts        pure rules (contact.ts, authFlow.ts, form.ts)
  screens/                screen components (default exports)
  components/             UI used only by this feature (default exports)
  index.ts                public exports; src/app and other features import only from here
tests/<area>/*.test.ts(x) all tests, importing via @/ aliases
```

## File rules and naming

| Thing             | Rule                                        | Example                              |
| ----------------- | ------------------------------------------- | ------------------------------------ |
| Screens           | PascalCase, `Screen` suffix, default export | `LoginScreen.tsx`                    |
| Feature component | PascalCase, default export                  | `OtpInput.tsx`                       |
| Shared component  | `App` prefix, default export                | `AppButton.tsx`                      |
| API file          | `<feature>.api.ts`, exports `<feature>Api`  | `auth.api.ts` -> `authApi`           |
| Types file        | `<feature>.types.ts`                        | `vehicles.types.ts`                  |
| Constants file    | `<feature>.constants.ts`                    | `setup.constants.ts`                 |
| Hook file         | `useXxx.ts`, named export                   | `useOtpForm.ts`                      |
| Endpoints         | `ENDPOINTS.DOMAIN.ACTION`                   | `ENDPOINTS.VEHICLES.MODELS(brandId)` |

- Components and screens use `export default`. Hooks, api objects, mappers, utils, providers,
  constants and types use named exports.
- Barrels re-export defaults by name: `export { default as AppButton } from './AppButton';`,
  so callers write `import { AppButton } from '@/shared/components'`.
- Images are registered in src/shared/assets/images.ts and used as `images.logo`. Never
  `require()` an image inside a component.

## Code style

Prettier (.prettierrc): `singleQuote`, `trailingComma: all`, `printWidth: 100`,
`arrowParens: avoid`. ESLint enforces the import order below (`npx expo lint --fix` sorts it).

- Components, providers and hooks are arrow-function consts:
  `const AppCard = ({ title }: AppCardProps) => { ... }`. Pure helpers may stay `function`.
- Props use a `type` named `<Component>Props`, declared right above the component. Use `type`
  for all data shapes (`interface` only for module augmentation).
- Component file order: imports -> props type -> component -> `export default` ->
  `StyleSheet.create` at the bottom.
- Static styles go in `StyleSheet.create` with theme tokens; theme-dependent values (colours)
  go inline as the second array item: `style={[styles.card, { backgroundColor: t.colors.surface }]}`.
- Import order, with a blank line between groups:
  1. react, react-native
  2. third-party libraries
  3. @/shared/components
  4. other features (@/features/\*) and this feature's components
  5. @/shared/theme
  6. @/core, @/shared/utils, @/shared/assets, then this feature's hooks, api, constants,
     types and utils
- Early returns instead of nested if/else. A blank line between logical blocks in a function.
- Providers follow one pattern: `createContext<XContextType | undefined>(undefined)`, every
  action in `useCallback`, the value in `useMemo`, and a `useX` hook that throws when used
  outside the provider.
- Hooks return a flat object of state + handlers and guard against double submits
  (`if (pending) return;`).
- Write code that reads as hand-written. No JSDoc on every function, constant or prop.
- Comment only a non-obvious "why", in one short line. TODO(backend|phase-x) markers stay.
- No classes, not even for errors. Use functions, hooks and plain objects. A custom error is
  `Object.assign(new Error(msg), { name, ...fields })` plus an `isX` guard (see `apiError` in
  src/core/api.ts).

## Working style

- Before writing code for a phase, reply with a short plan: files to create, libraries to add,
  open questions. Wait for approval.
- Work in small commits. After each one, run `npx tsc --noEmit`, `npx expo lint`, `npx jest`.
- When the blueprint marks something "confirm with backend", implement behind a clearly named
  constant and list it in docs/OPEN_QUESTIONS.md instead of guessing silently.
- At the end of a phase, update docs/PROGRESS.md: done, deviations, open questions.
