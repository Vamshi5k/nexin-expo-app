# How this app works

Read this on your first day. It tells you where things live and where new code goes.
For the full rules see `AGENTS.md`. For the API and the screen list see `docs/BLUEPRINT.md`.

Run it: `npm start`, then scan the QR code with Expo Go (Android) or the Camera app (iPhone).

## Folder map

```
brand/                    everything that changes per client: name, colours, logo, fonts
src/
  app/                    routes only. Each file imports a screen and exports it
  core/                   app-wide code with no UI
    api.ts                the one axios client: adds the token, refreshes it on a 401
    endpoints.ts          every API path, e.g. ENDPOINTS.AUTH.LOGIN
    config.ts             brand and env values (read these, never hard-code them)
    session.ts            the signed-in tokens (a small Zustand store)
    storage.ts            secure storage for tokens, MMKV for everything else
    request.ts            useRequest (load data) and useAction (send data)
    log.ts  network.ts  permissions.ts
  shared/                 code that any feature can use
    components/           the App* kit: AppText, AppButton, AppInput, AppBackButton, AppDialog...
    theme/                colours, spacing, fonts as tokens. Read them with useTheme()
    utils/                toast, haptics, keyboard, money
    assets/images.ts      every image the app uses (logo, splash)
  features/
    auth/                 onboarding, login, OTP (consumer and fleet), logout, startup, route guards
    home/                 the screen you land on after sign-in (consumer and fleet)
    setup/                first-run setup: name, vehicle, permissions
    vehicles/             the add-vehicle wizard, shared by setup and (later) My Vehicles
    fleet/                fleet driver data and the fleet API
    client-config/        runtime settings from GET /client/info (logo, flags, legal links)
    dev/                  dev-only screens (UI kit, cookie check), hidden in production
tests/                    all tests, one folder per area
```

## The shape of a feature

Every feature uses the same folders. It only creates the ones it needs.

```
features/<name>/
  api/<name>.api.ts           network calls, as one object: authApi = { requestOtp, ... }
  hooks/useXxx.ts             one hook per file: state, logic, effects
  types/<name>.types.ts       types for API data (DTOs) and for the app (models)
  constants/<name>.constants.ts   copy, timeouts, lengths, route hrefs
  utils/<topic>.ts            pure rules with no React, e.g. auth/utils/contact.ts
  screens/XScreen.tsx         UI only. Calls a hook, renders
  components/X.tsx            UI pieces used only by this feature
  index.ts                    the only file other folders may import from
```

Look at `src/features/setup/` for a small, complete example.

A screen and its hook have matching names: `LoginScreen` uses `useLoginForm`, `OtpScreen`
uses `useOtpForm`, `HomeScreen` uses `useHome`. Find the screen and you will know which hook
holds its logic.

`FleetHomeScreen` lives in `home`, not `fleet`: `auth` already imports `fleet`, so a fleet
screen that imports `auth` would create a require cycle.

## How a file looks

Components and screens:

```tsx
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

type WalletCardProps = {
  balance: string;
};

const WalletCard = ({ balance }: WalletCardProps) => {
  const t = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: t.colors.surface }]}>
      <AppText variant="title2">{balance}</AppText>
    </View>
  );
};

export default WalletCard;

const styles = StyleSheet.create({
  card: { padding: 16 },
});
```

- The order is always: imports, then the props type, then the component, then
  `export default`, then the styles.
- Components and screens use `export default`. Hooks, api objects, utils and types use
  named exports.
- Components and hooks are arrow functions (`const X = () => {}`).
- Prettier formats the code and ESLint checks the import order. Run
  `npx expo lint --fix` and both are fixed for you.

## Where do I put…?

| I need to add…         | Put it in                                                         |
| ---------------------- | ----------------------------------------------------------------- |
| A new screen           | `features/<name>/screens/XScreen.tsx`, export it from `index.ts`  |
| A new route            | a `src/app/...` file that only does `export default XScreen`      |
| An API path            | `src/core/endpoints.ts`. Nowhere else                             |
| An API call            | the feature's `api/<name>.api.ts` object, with a `toX` mapper     |
| Form logic, state      | `features/<name>/hooks/useXxx.ts` (react-hook-form + zod)         |
| A reusable component   | `src/shared/components/AppX.tsx`, export it from `index.ts` there |
| An image               | `src/shared/assets/images.ts`, then use `images.name`             |
| A brand colour or name | `brand/brand.config.ts` (add the field to `brand/schema.ts`)      |
| A pure rule (no React) | `features/<name>/utils/<topic>.ts`                                |

## One flow, end to end: Login → OTP

1. **Route.** `src/app/(auth)/login.tsx` exports `LoginScreen`. Nothing else.
2. **Screen.** `features/auth/screens/LoginScreen.tsx` calls `useLoginForm()` and renders the
   input and the Continue button. Continue calls `login.submit`.
3. **Hook.** `features/auth/hooks/useLoginForm.ts` checks the number with zod (the schema is in
   `utils/contact.ts`), calls `requestOtp`, then opens the OTP screen with
   `router.push({ pathname: '/(auth)/otp', params: { type, value } })`. On an error it shows a
   toast.
4. **API.** `authApi.requestOtp` in `features/auth/api/auth.api.ts` posts to
   `ENDPOINTS.AUTH.LOGIN`. The shared axios client (`src/core/api.ts`) adds the token and
   refreshes it on a 401.
5. **OTP route.** `src/app/(auth)/otp.tsx` reads `type` and `value` from the URL and renders
   `OtpScreen`.
6. **OTP hook.** `useOtpForm` calls `verifyOtp`, and `AuthProvider` (`hooks/useAuth.tsx`) saves
   the tokens with `sessionStore.signIn` (`src/core/session.ts`).
7. **Where next.** The session changed, so the route guard (`hooks/useRouteGuard.ts`) sends the
   user to `/`. `useStartRoute` loads the user and picks the setup step or home with
   `resolveStartRoute` (`utils/authFlow.ts`). See "Startup and first-run setup" below.

Every feature works this way: **route → screen → hook → api**.

## Startup and first-run setup

Every sign-in, sign-out and restart goes through `/` (`StartRedirect`). It never decides
alone: the session mode and the saved setup step decide.

| Situation                                     | `/` opens                   |
| --------------------------------------------- | --------------------------- |
| Signed out, onboarding not seen               | Onboarding                  |
| Signed out                                    | Login                       |
| Fleet session                                 | Fleet home                  |
| Consumer, setup step `profile`                | Profile                     |
| Consumer, setup step `vehicle`                | Vehicle                     |
| Consumer, step `permissions`, both allowed    | Home (setup is marked done) |
| Consumer, step `permissions`, any not allowed | Permissions                 |
| Consumer, setup done                          | Home                        |

- The step is saved per user id in MMKV (`setup_progress`) by the setup hooks: Profile saved
  -> `vehicle`; vehicle added or skipped -> `permissions`; Continue on Permissions -> `done`.
  With no saved step, `isFirstLogin` decides (`profile` or `done`).
- The guards back this up: `(app)` only opens when setup is done, `(setup)` only opens the
  current step, so a finished step (like Vehicle) can't be opened again.
- Rules: `setupStepFor`, `saveSetupStep`, `resolveStartRoute` and `guardRoute` in
  `features/auth/utils/authFlow.ts`. Tests: `tests/auth/routes.test.ts` and
  `tests/setup/setup-resume.test.tsx`.

## Fleet login

Shown only when `/client/info` says `features.fleetFeature` is true.

1. Login shows a "Fleet Login" link (right side, next to "Use email instead").
2. `(auth)/(fleet-auth)/fleet-login`: Fleet ID + mobile -> `fleetApi.login` -> driver id.
3. `(auth)/(fleet-auth)/fleet-otp`: `fleetApi.verifyOtp` saves a fleet session; resend uses
   the driver id. The `(fleet-auth)` guard keeps both routes closed when the flag is off.
4. The session changed, so `/` opens fleet home and loads the driver.

Both OTP screens share `hooks/useOtpCode.ts` (code, verify, resend timer) and
`components/OtpView.tsx` (layout).

## Back buttons

Use `AppBackButton` from the kit. By default it calls `router.back()`. Pass `onPress` for a
custom action, and `hardwareBack` when Android's back button should do the same thing (for
example, steps inside one screen, like the vehicle wizard).

## Adding a new feature

- [ ] Add the API paths to `src/core/endpoints.ts`.
- [ ] Create `features/<name>/` with only the folders you need.
- [ ] Write `api/<name>.api.ts` first: one object, one function per endpoint, each returning a
      model through a `toX` mapper.
- [ ] Put the logic in `hooks/`, one hook per file. Load data with `useRequest`, send data with
      `useAction` (`src/core/request.ts`).
- [ ] Build the screen from `App*` components and `useTheme()` tokens. No raw colours.
- [ ] Export the screen from `index.ts`, then add a route file in `src/app/`.
- [ ] Write a test in `tests/<name>/`. Mock the api file, never the hooks:
      `jest.mock('@/features/<name>/api/<name>.api', ...)`.
- [ ] Run `npm run typecheck && npm run lint && npm test`.

## 5 rules never to break

1. **No hard-coded brand values.** No brand name, colour, URL, currency or phone format in
   `src/`. Read them from `src/core/config` or `useClientConfig()`. Every client gets the same
   code, and only `brand/` changes.
2. **No API calls or logic in screens or routes.** Screens render, hooks think, and the api
   file talks to the server.
3. **Import other features only through their `index.ts`.** `src/core` and `src/shared` never
   import from `src/features`.
4. **Money is integer paise.** Do the maths in paise (`shared/utils/money.ts`) and format only
   when rendering.
5. **Every list or detail screen has four states:** loading (skeleton), error (with Retry),
   empty, and offline.
