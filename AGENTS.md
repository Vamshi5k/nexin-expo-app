# EV Charging App Template (Expo)

This repo is a WHITE-LABEL TEMPLATE for an EV charging app (consumer + fleet driver modes).
It is a rebuild of the bare RN app "Cruze EV". Each client gets its own repo created from this
template; the ONLY per-client differences live in `brand/` and EAS secrets.

## Source of truth

- docs/BLUEPRINT.md: API contract, screens, navigation, bugs to fix, architecture. Follow it.
- docs/screen-audit.md: exact UI copy per screen. Use it verbatim.
- All UI follows docs/DESIGN.md. Never style a screen ad hoc; use src/ui and theme tokens.
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
only via src/ui/toast.ts), @sentry/react-native.
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

1. app/\*_ are thin route files: read params, render a screen from src/features/_/screens. No fetching.
2. api.ts: every network call, and nothing else. The only place endpoint strings appear.
   Each call returns a domain model; its DTO mapper (`toUser`, `toFleetUser`, ...) sits
   next to it and is exported only for tests. Components never see raw API shapes.
3. hooks.tsx: all feature logic and state: the context provider (if any), screen hooks
   (`useLoginForm`, `useOtpForm`), side effects. Screens call these hooks and stay UI only.
   Load data with `useRequest`, run writes with `useAction`, and keep per-account data
   (user, driver) in `useSessionData` (all in src/core/request.ts).
4. <topic>.ts (optional): pure rules that need no React, e.g. auth/session.ts (schemas,
   routing rules, boot steps). No React or src/ui imports, so tests load it directly.
5. Zustand = client state only (the token store in src/core/session.ts, filters). Server data
   lives in the contexts (user, driver, client config) or in a screen's `useRequest`. Contexts
   reset on every session change and drop responses for the previous session.
6. Pure logic (pricing, QR parsing, status maps, formatters, mappers) is tested in tests/.
   Logic tests import api.ts mappers and <topic>.ts files directly.
7. Features import each other only via index.ts. src/ui and src/core never import src/features.
8. Money is computed in paise (integers). Format only at render time.
9. No `any` in api/hooks. No console.\* in committed code (use src/core/log.ts).
10. Every list/detail screen has loading (skeleton), error (+Retry), empty and offline states.

## Folder layout

Keep it small and feature-based:

```
src/app/                 thin route files
src/core/*.ts            flat files: api, config, log, network, permissions, request, session, storage
src/features/<f>/
  screens/       UI only: layout, styling, wiring to hooks. No API calls, no logic.
  components/    UI pieces used only by this feature.
  api.ts         network calls (+ their DTO mappers)
  hooks.tsx      logic and state: context, screen hooks, side effects
  <topic>.ts     optional pure rules with no React/UI imports (auth/session.ts)
  constants.ts   static data: copy, timeouts, lengths, route hrefs. No UI imports.
  types.ts       DTOs, models, unions
  index.ts       public exports; src/app and other features import only from here
src/ui/  src/theme/      design system
tests/<area>/*.test.ts   all tests live here, importing via @/ aliases
```

Only add a file to a feature when it does not fit one of the above.

## Code style

- Write code that reads as hand-written. No JSDoc on every function, constant or prop.
- Comment only a non-obvious "why", in one short line. TODO(backend|phase-x) markers stay.
- Prefer fewer, larger feature-local files over many tiny layer files.

## Working style

- Before writing code for a phase, reply with a short plan: files to create, libraries to add,
  open questions. Wait for approval.
- Work in small commits. After each feature, run `npx tsc --noEmit`, `npx expo lint`, `npx jest`.
- When the blueprint marks something "confirm with backend", implement behind a clearly named
  constant and list it in docs/OPEN_QUESTIONS.md instead of guessing silently.
- At the end of a phase, update docs/PROGRESS.md: done, deviations, open questions.
