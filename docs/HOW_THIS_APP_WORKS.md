# How this app works

Read this on your first day. It tells you where things live and where new code goes.
For the full rules see `AGENTS.md`; for the API and screen list see `docs/BLUEPRINT.md`.

Run it: `npm start`, then scan the QR code with Expo Go (Android) or the Camera app (iPhone).

## Folder map

```
brand/                  everything that changes per client: name, colours, logo, fonts
src/
  app/                  routes only. Each file imports a screen and exports it
  core/                 app-wide logic with no UI: axios client, config, storage, session tokens
  ui/                   reusable components (Button, Input, Dialog, OfflineBanner...)
  theme/                colours, spacing, fonts as tokens. Read them with useTheme()
  dev/                  dev-only screens (UI kit, cookie check); hidden in production
  features/
    auth/               onboarding, login, OTP, logout, startup and route guards
    home/               the screen you land on after sign-in (consumer and fleet)
    setup/              first-run setup: name, vehicle, permissions
    vehicles/           the add-vehicle wizard, shared by setup and (later) My Vehicles
    fleet/              fleet driver data and fleet API
    client-config/      runtime settings from GET /client/info (logo, flags, legal links)
tests/                  all tests, one folder per feature
```

Every feature has the same shape:

```
features/<name>/
  screens/      UI only. Calls one hook, renders.
  components/   UI pieces used only by this feature
  hooks.tsx     state, logic, effects. One hook per screen
  api.ts        network calls. Returns clean models, never raw API JSON
  types.ts      types
  constants.ts  copy, timeouts, route hrefs
  index.ts      the only file other folders may import from
```

A screen and its hook share a name: `LoginScreen` uses `useLoginForm`, `OtpScreen` uses
`useOtpForm`, `OnboardingScreen` uses `useOnboarding`. Find a screen, and you know which hook
holds its logic.

## Where do I put…?

| I need to add…         | Put it in                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| A new screen           | `features/<name>/screens/XScreen.tsx`, export it from `index.ts` |
| A new route            | `src/app/...` file that only does `export default XScreen`       |
| An API call            | `features/<name>/api.ts`. The only place endpoint strings go     |
| Form logic, state      | `features/<name>/hooks.tsx` (react-hook-form + zod)              |
| A reusable component   | `src/ui/`, export it from `src/ui/index.ts`                      |
| A brand colour / name  | `brand/brand.config.ts` (add the field to `brand/schema.ts`)     |
| A pure rule (no React) | `features/<name>/<topic>.ts`, e.g. `auth/session.ts`             |

## One flow, end to end: Login → OTP

1. **Route.** `src/app/(auth)/login.tsx` exports `LoginScreen`. Nothing else.
2. **Screen.** `src/features/auth/screens/LoginScreen.tsx` calls `useLoginForm()` and renders
   the input and the Continue button. Continue calls `login.submit`.
3. **Hook.** `useLoginForm` in `src/features/auth/hooks.tsx` validates the number with zod,
   calls `requestOtp`, then opens the OTP screen with
   `router.push({ pathname: '/(auth)/otp', params: { type, value } })`. On error it shows a toast.
4. **API.** `requestOtp` in `src/features/auth/api.ts` does `POST /auth/app/login`.
   The shared axios client (`src/core/api.ts`) adds the auth token and refreshes it on a 401.
5. **OTP route.** `src/app/(auth)/otp.tsx` reads `type` and `value` from the URL and renders
   `OtpScreen`.
6. **OTP hook.** `useOtpForm` calls `verifyOtp` (`POST /auth/app/verify`) and saves the tokens
   with `sessionStore.signIn` (`src/core/session.ts`).
7. **Where next.** The session changed, so the route guard (`auth/routing.tsx`) sends the user
   to `/`. `useStartRoute` loads the user and picks setup or home (`resolveStartRoute` in
   `auth/session.ts`).

Every feature works this way: **route → screen → hook → api**.

## Adding a new feature

- [ ] Copy the shape of `src/features/setup/`: `screens/`, `hooks.tsx`, `api.ts`, `types.ts`,
      `constants.ts`, `index.ts`.
- [ ] Write `api.ts` first: one function per endpoint, returning a model (with a `toX` mapper).
- [ ] Put logic in `hooks.tsx`. Load data with `useRequest`, run writes with `useAction`
      (`src/core/request.ts`).
- [ ] Build the screen from `src/ui` components and `useTheme()` tokens. No raw colours.
- [ ] Export the screen from `index.ts`, then add a route file in `src/app/`.
- [ ] Write a test in `tests/<feature>/`. Mock the feature's `api.ts`, never its hooks.
- [ ] Run `npm run typecheck && npm run lint && npm test`.

## 5 rules never to break

1. **No hard-coded brand values.** No brand name, colour, URL, currency or phone format in
   `src/`. Read them from `src/core/config` or `useClientConfig()`. Each client gets the same code
   and only `brand/` changes.
2. **No API calls or logic in screens or routes.** Screens render; hooks think; `api.ts` talks
   to the server.
3. **Import other features only through their `index.ts`.** `src/core` and `src/ui` never import
   from `src/features`.
4. **Money is integer paise.** Do the maths in paise and format only when rendering.
5. **Every list or detail screen has four states:** loading (skeleton), error (with Retry),
   empty, and offline.
