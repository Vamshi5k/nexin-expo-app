# Open questions

| #   | Area    | Question                                                                                                                                                      | Current behaviour                                             |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | Docs    | `docs/BLUEPRINT.md` is missing. Phase 0 was built from the task brief and the old app.                                                                        | Closed: BLUEPRINT.md added.                                   |
| 2   | EAS     | EAS project id and owner for Cruze EV.                                                                                                                        | Left unset; `brand:check` warns. Run `eas init` and add them. |
| 3   | Backend | Is there a stable development API host? The old app's dev host was a devtunnel URL.                                                                           | `development` uses staging (`testapi.evechos.com`).           |
| 4   | Domains | The web domain is `cruzeev.com` but the delete-account page is on `cruzeev.in`. Is that intended? Is an AASA / assetlinks file served on `cruzeev.com`?       | Deep links: `cruzeev.com` only.                               |
| 5   | Assets  | The adaptive-icon foreground is the old 432px launcher layer upscaled ~3x, so it is slightly soft. Splash image is the logo.                                  | Replace with vector-sourced 1024px artwork when available.    |
| 6   | Design  | Teal accent `#00C8D0` on white is 2.06:1 (AA needs 4.5:1). `primaryDark` is only 3.87:1. Dark text on teal passes; accent-coloured text needs a darker token. | Closed: accentText token added.                               |
| 7   | Brand   | Confirm phone regex `^[6-9]\d{9}$`, tax model `GST_SPLIT`, map deltas 0.05, and `quickChargeRupees` = `quickTopUpRupees` (100/200/500/1000).                  | As listed.                                                    |
