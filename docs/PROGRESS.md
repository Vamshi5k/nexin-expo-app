# Progress

## Phase 0: Template and brand layer (done)

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

**Verified**: `brand:check`, `typecheck`, `lint`, `test` (9 tests), `expo prebuild --clean`, and
`eas.json` profiles parsed with `@expo/eas-json`.

**Deviations**

- `docs/BLUEPRINT.md` was not available; the old app lives at `../Cruzev_nexin_whitelable_app`
  (AGENTS.md updated).
- Routes live in `src/app/` (create-expo-app default), not `app/`.
- `app.config.ts` imports `tsx/cjs` so Expo can load `brand/*.ts`. `tsx` is a dev dependency
  (EAS installs dev dependencies).
- Money fields in `brand.config.ts` are whole rupees and say so in their names (`minTopUpRupees`, `quickTopUpRupees`, `quickChargeRupees`); convert to paise in `src/`.
- `easProjectId` / `owner` are optional, so `brand:check` passes with a warning until `eas init`.
- `development` points at the staging backend.
- Added a `development-simulator` EAS profile for iOS simulator builds.
- `eas config` itself was not run (needs an Expo login).

**Open questions**: see `docs/OPEN_QUESTIONS.md`.
