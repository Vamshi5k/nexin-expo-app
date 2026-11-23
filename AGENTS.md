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

Expo SDK (latest stable) + expo-dev-client (Expo Go is NOT supported), Expo Router (typed routes),
TypeScript strict, TanStack Query, Zustand, react-hook-form + zod, axios, socket.io-client,
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
2. src/features/<f>/api.ts: typed functions, the only place endpoint strings appear.
3. mappers.ts: DTO -> domain model. Components never see raw API shapes.
4. hooks.ts: TanStack Query wrappers. Screens use only hooks.
5. Zustand = client state only (session, filters). Server data lives in the query cache.
6. Pure logic (pricing, QR parsing, status maps, formatters) in plain .ts files with Jest tests.
7. Features import each other only via index.ts. src/ui and src/core never import src/features.
8. Money is computed in paise (integers). Format only at render time.
9. No `any` in api/hooks. No console.\* in committed code (use src/core/log.ts).
10. Every list/detail screen has loading (skeleton), error (+Retry), empty and offline states.

## Working style

- Before writing code for a phase, reply with a short plan: files to create, libraries to add,
  open questions. Wait for approval.
- Work in small commits. After each feature, run `npx tsc --noEmit`, `npx expo lint`, `npx jest`.
- When the blueprint marks something "confirm with backend", implement behind a clearly named
  constant and list it in docs/OPEN_QUESTIONS.md instead of guessing silently.
- At the end of a phase, update docs/PROGRESS.md: done, deviations, open questions.
