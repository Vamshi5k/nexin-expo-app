# White-label guide

This repo is a template. Each client gets its own repo created from it. **A client repo changes
only `brand/` and its EAS environment variables.** Anything else is a template change: make it
here and pull it into client repos.

## The `brand/` folder

| File                     | What it holds                                                                                                                                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand.config.ts`        | App name, slug, scheme, bundle id / package, domains, delete-account URL, colours, connector colours, font, locale, currency, phone rules, tax model, top-up and quick-charge amounts, default map region, fallback feature flags, EAS project id and owner |
| `env.ts`                 | API host, socket URL and client token for `development`, `staging` and `production`                                                                                                                                                                         |
| `map-style.json`         | Google Maps style array                                                                                                                                                                                                                                     |
| `assets/`                | `icon.png` (1024²), `adaptive-icon.png` (1024², Android foreground), `notification-icon.png` (96², white on transparent), `splash.png` and `logo.png` (≥ 512 px wide)                                                                                       |
| `firebase/` (gitignored) | Optional local copies of `google-services.json` / `GoogleService-Info.plist`                                                                                                                                                                                |
| `schema.ts`, `lib/`      | The contract and its helpers (e.g. contrast maths). **Template-owned: do not edit in a client repo.**                                                                                                                                                       |

After any change run `npm run brand:check`. It validates the config against the schema, checks
every asset exists at the right size, and fails if any value still contains `CHANGE_ME`.

## Build-time vs runtime values

**Build-time** values are baked into the binary from `brand/` by `app.config.ts`. Changing them
needs a new build. The native ones cannot be changed any other way:

- App name, slug, scheme, bundle id / package, deep-link domains, icons and splash
- Colours, font, locale, currency, phone rules, tax model, amounts, default map region
- API host, socket URL and client token (per `APP_ENV`)

**Runtime** values come from `GET /client/info` (via `useClientConfig()`) and **win over** the
build-time fallbacks:

- Brand name and logo shown in the UI
- Legal and support URLs
- Login type
- Feature flags: `fleetFeature`, `couponFeature`. When a flag is off, its UI and routes are
  fully hidden. `brand.features` is only used until `/client/info` has loaded.

## How app code reads brand values

- `src/` reads brand values **only** through `@/core/config` (`brand`, `env`, `APP_ENV`,
  `API_URL`, `SOCKET_URL`, `CLIENT_TOKEN`). Never import `brand/brand.config.ts` from `src/`.
- Nothing in `src/` may hard-code a brand name, colour, URL, host, token, bundle id, scheme, phone
  regex, currency, locale, map region or amount limit.
- Need a new brand-specific value? Add it to `brand/schema.ts` **with a default** (so existing
  client repos keep building), then read it from `brand`.

## Environments

`APP_ENV` (`development` | `staging` | `production`) is set by the `eas.json` profile and
defaults to `development` locally. Non-production builds get a suffix so all three can be
installed side by side:

| APP_ENV     | Bundle id / package | Scheme             | Name suffix |
| ----------- | ------------------- | ------------------ | ----------- |
| development | `<id>.dev`          | `<scheme>-dev`     | (Dev)       |
| staging     | `<id>.staging`      | `<scheme>-staging` | (Stg)       |
| production  | `<id>`              | `<scheme>`         | none        |

Firebase apps, Google Maps key restrictions and store listings must be registered for each id
you ship.

## EAS environment variables

See `.env.example` for the full list. In short:

- `GOOGLE_MAPS_ANDROID_KEY`, `GOOGLE_MAPS_IOS_KEY`: sensitive.
- `GOOGLE_SERVICES_JSON`, `GOOGLE_SERVICE_INFO_PLIST`: **file** variables.
- `API_HOST`, `SOCKET_URL`, `CLIENT_TOKEN`: optional overrides of `brand/env.ts`.

## New client checklist

1. Create the repo from this template.
2. Edit `brand/brand.config.ts`, `brand/env.ts`, `brand/map-style.json` and `brand/assets/`.
3. `eas init`, then put the project id and owner in `brand.config.ts`.
4. Create Firebase apps for each bundle id and upload the config files as EAS file variables.
5. Set the Google Maps keys as EAS variables.
6. `npm run brand:check && npm run typecheck && npm test`.
7. `eas build --profile development`.
