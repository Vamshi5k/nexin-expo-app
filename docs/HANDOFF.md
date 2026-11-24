# Handoff: feature-folder refactor

Branch `wip/auth-refactor`, cut from `feat/auth` at `78424d9`. Updated 2026-11-24.

## Goal

Make each feature readable in a few minutes: fewer files and layers, no one-call wrappers, no
dead code, same behaviour. The target layout is now the standard in AGENTS.md ("Architecture
rules", "Folder layout") and BLUEPRINT.md section 6:

```
src/features/<feature>/
  screens/  components/  api.ts  hooks.tsx  [<topic>.ts]  constants.ts  types.ts  index.ts
```

## Done

| Step | Commit | What |
|---|---|---|
| 0 | `6ec2132` | auth: `AuthContext.tsx`, `hooks.ts`, `utils.ts` merged into `hooks.tsx` + `constants.ts`; logic moved out of screens; dead code removed (`registerFcm`, `otpSchema`, `signOutEverywhere`, unused exports) |
| 1 | `8bc8604` | OTP lint fix: `OtpScreen` owns the input ref; `useOtpForm` takes `onWrongCode` |
| 2 | `bbe5db2` | auth split: pure rules and boot steps in `session.ts` (no React/UI imports); `@/ui` Jest stub removed |
| 3 | `32a7e6e` | `useSessionData` in `src/core/request.ts` (status + generation counter + reset on session change), used by Auth and Fleet; fleet on the new layout (`hooks.tsx`, `constants.ts`, `getDriver()` returns a model) |
| 4 | `8386398` | client-config on the new layout: `hooks.tsx` (provider + cache helpers), `constants.ts`, `getClientConfig()` returns a model |
| 5 | (this commit) | AGENTS.md, BLUEPRINT.md section 6 and this file describe the layout as built |

Sizes now: auth `hooks.tsx` 309 lines, `session.ts` 159; fleet `hooks.tsx` 43; client-config
`hooks.tsx` 92.

## Not done

6. Add `@testing-library/react-native` and three render tests: login submit, OTP wrong code,
   logout redirect. Update AGENTS.md rule 6 to mention render tests.
7. Owner checks on the emulator: start-up, onboarding, login, OTP, logout.
8. Pull request from `wip/auth-refactor` into `feat/auth`.

## Decisions and deviations

- `hooks.tsx`, not `hooks.ts`: providers use JSX (owner approved).
- DTO mappers stay in `api.ts` next to their call; calls return models (owner approved).
- Optional `<topic>.ts` for pure rules (owner approved for auth as `session.ts`). Fleet and
  client-config don't need one: their pure logic is a mapper (api.ts) or the cache schema,
  which lives in client-config `hooks.tsx` (no UI imports, so tests load it directly).
- `useSessionData` lives in `src/core/request.ts` beside `useRequest` / `useAction`.
- Onboarding slide icons are mapped in the screen (`SLIDE_ICONS`): constants import no UI,
  and Lucide is ESM-only under Jest.
- Earlier on `feat/auth`: TanStack Query replaced by contexts + `useRequest` / `useAction`;
  Zustand kept only as the token store (see PROGRESS.md deviations).
- No DESIGN.md changes; UI and copy are unchanged.

## Open questions

None outstanding. All three questions from the first handoff were answered by the owner.

## Status at this commit

| Check | Result |
|---|---|
| `npm run lint` | pass: 0 errors, 0 warnings |
| `npx tsc --noEmit` | pass: 0 errors |
| `npm test` | pass: 25 suites, 187 tests |

Not re-verified on a device since the refactor (step 7).

## App flow and owning files

1. **Boot**: `src/app/_layout.tsx` mounts `ClientConfigProvider` > `FleetProvider` >
   `AuthProvider` > theme, then `AppShell` runs `useBoot` (`auth/hooks.tsx`):
   `restoreSession` (`auth/session.ts`: storage hydrate, legacy migration, token hydrate via
   `src/core/storage.ts` and `src/core/session.ts`), `primeClientConfig`, then `checkSession`
   (`auth/session.ts`). `src/ui/SplashOverlay.tsx` covers boot; failure shows
   `auth/screens/BootErrorScreen.tsx`.
2. **Client config**: `client-config/hooks.tsx` `prime()`: cached config at once plus a
   background refresh, else wait up to 8 s for `getClientConfig()` (`client-config/api.ts`),
   else brand fallbacks.
3. **Start route**: `src/app/index.tsx` -> `auth/screens/StartRedirect.tsx` ->
   `useStartRoute` (`auth/hooks.tsx`) -> `resolveStartRoute` (`auth/session.ts`).
4. **Auth**: `src/app/(auth)/*` -> `OnboardingScreen` (`finishOnboarding`), `LoginScreen`
   (`useLoginForm` -> `requestOtp`), `OtpScreen` (`useOtpForm` -> `verifyOtp`, then
   `sessionStore.signIn`). Shared frame: `auth/components/AuthScaffold.tsx`.
5. **Route guard**: each group layout renders `auth/components/GuardedStack.tsx` ->
   `useRouteGuard` (`auth/hooks.tsx`) -> `guardRoute` (`auth/session.ts`). A session mode
   change redirects to `/` and step 3 picks the next screen.
6. **Home**: `src/app/(app)/(tabs)/index.tsx` -> `auth/screens/TempHomeScreen.tsx`
   (placeholder). Logout: `useAuth().logout` -> `signOutThen(serverLogout)`
   (`src/core/session.ts`, `auth/session.ts`). API auth and 401 refresh: `src/core/api.ts`.
