# Design direction: modern, clean, professional (2027)

## Feel
Calm and confident, like a good banking or mobility app. Content first, generous whitespace,
one accent colour used sparingly, big readable numbers. Nothing decorative that doesn't help
the driver find, start, watch or pay for a charge.

## Colour
- **Neutrals by default.** Most of the UI is neutral: a near-white grey page (bg), white cards
  (surface), neutral hairline borders and a sunken grey for inputs and segmented controls. They
  are derived from a grey scale (50-950) only slightly tinted towards the brand hue. A brand may
  override `colors.background`, `colors.surface` and `colors.border` (light mode only), but the
  template ships without them and Cruze EV uses the defaults.
- **Accent only for the primary action, selections and icons.** The brand colour fills the one
  primary button on a screen, the active tab, selected chips, the progress ring and map pins,
  and tints icons. It never fills large backgrounds, cards or secondary actions.
- **Secondary buttons are never brand-filled.** Secondary = white surface, 1 pt neutral
  (borderStrong) border, dark text. Ghost = brand-coloured text only. Dialog and sheet cancel
  actions are secondary.
- Components use semantic tokens only: bg, surface, surfaceRaised, surfaceSunken, border,
  borderStrong, textPrimary, textSecondary, textTertiary, accent, accentSoft, accentText,
  onAccent, success, warning, danger (each with Soft and Text), plus connector status colours.
  No raw hex outside src/shared/theme and brand/.
- accent = the brand colour as a FILL. It comes from `colors.accentFill`, which defaults to
  `colors.primary`. accentText = the brand colour as TEXT or ICONS on light surfaces (links,
  "See all", selected tab label, icons in accentSoft circles). Never use accent itself as text
  on a light background.
- **onAccent is always computed from contrast**: dark text or white, whichever reads better on
  the fill. It is never set by hand. For Cruze teal (#00C8D0) that is dark text #0E2E31 at
  7.0:1. brand:check warns if the computed onAccent misses 4.5:1 on accentFill in either
  scheme. (Example: #0AA5AE passes with dark text at 4.8:1; white on it would be only 3.0:1.)
- Contrast: WCAG AA (4.5:1 body text, 3:1 large text and icons) in light and dark.
  brand:check checks the palettes the app actually renders.
- Light and dark palettes come from semantic tokens; the dark palette is derived from the
  brand, not inverted, and ignores the light overrides. In dark mode, accent works as text
  directly when it passes. brand.appearance: 'system' | 'light' | 'dark'. Every token and
  component must work in both schemes (the dev gallery at /dev/ui shows them side by side),
  even while a brand ships light only. Cruze EV stays on 'light' until the core screens exist.

## Typography (font from brand, Inter by default)
- Scale: display 34/40 semibold, title1 28/34 semibold, title2 22/28 semibold,
  headline 17/24 semibold, body 16/24 regular, callout 15/20, subhead 14/20 medium,
  caption 12/16 medium. Slight negative letter-spacing on 22 and above.
- Numbers (currency, kWh, %, kW, timers) use tabular figures (fontVariant tabular-nums) so
  live values don't jitter.
- Layouts survive font scaling up to 1.3x.
- Sentence case everywhere. No ALL CAPS except tiny labels.

## Layout and shape
- 4 pt grid. Screen padding 20. Section gap 24-32. Card padding 16.
- Radius: controls 14, cards 20, sheets 28, pills full. Large buttons are pills.
- **No shadows anywhere** (there is no shadow token). Depth comes only from layering (grey
  page, white cards, sunken fills) and hairline borders (StyleSheet.hairlineWidth). Floating
  items (toasts, dialogs, the offline banner, later the FAB and map search) and hero cards
  (Card elevation="elevated") use surfaceRaised with a hairline border (borderStrong for
  elevated cards).
- Buttons: large = 52 high, full width (primary actions, sticky footer above the safe area on
  forms); medium = 44 high, content width (inline actions in cards, banners, empty states).
  Put two related actions side by side rather than stacking full-width buttons. Minimum touch
  target 44x44.
- Main screens use large-title headers (LargeTitleScroll) that collapse to a compact title on
  scroll. The compact bar floats over content and gains a translucent blur (expo-blur) once the
  large title has scrolled away; Android uses a solid bar.

## Components and patterns
- Bottom sheets for choices, filters and confirmations; Dialog only for destructive or
  blocking actions.
- Segmented controls for tabs inside a screen. Settings-style screens (Profile, Edit
  Profile) use inset grouped lists (ListGroup + ListRow: optional icon in a soft tinted
  circle, title, subtitle, value or trailing element, chevron when tappable; separators inset
  past the icon; group label above, helper text below).
- Inputs: sunken neutral fill, no border at rest. On focus a 1.5 pt accent border fades in
  (no ring, no lift). Errors swap accent for danger and shake once.
- Skeletons match the final layout, with a subtle shimmer. A full-screen spinner only
  during payment and charger start.
- Empty and error states: simple line icon in an accentSoft circle, one-line title, one
  sentence, one centred action.
- Floating surfaces use `AppGlass`: native liquid glass on iOS 26+, expo-blur on older iOS,
  solid surfaceRaised with a hairline borderStrong edge on Android. Still no shadows.
- Map: full bleed under the status bar and the tab bar. One glass capsule at the top holds
  search and a filter button (accentSoft + count badge when filters are on). A glass
  my-location circle sits above the cards.
- Station status colours come from `brand.connectorColors` (per client): Available green,
  Unavailable red, Under maintenance yellow, Upcoming amber, unknown grey. The same colour is
  used by the status badge on the card (`AppStatusChip` with `connector`) and by the map pin,
  and a pin in the nearby list takes the card's status so the two always match.
- Map pins: a rounded-square tile (corner 30% of its size) in the station's status colour with a
  soft surface-to-clear diagonal gradient, a surface ring, a filled bolt and a short pointer,
  all drawn in one SVG so Android's marker snapshot always includes the icon. 25 pt at rest,
  33 pt when selected. Bolt ink uses `onConnector`, picked by contrast.
- Nearby station cards on the map: one surface with a soft vertical gradient of the station's
  status colour fading to white (`CardGradient`, an exception to the no-gradient rule chosen
  for this card), dark text, a white status pill and a "⚡ 60 kW" pill, the name (up to two
  lines) and address, `ChargerArt` (a flat charger in theme colours with a status-colour glow),
  and a footer that blends in: "59 km · 1h 58m", the rate per kWh and a dark "Go" pill.
- Tab bar: a floating glass capsule inset 16 from the screen edges, above the home indicator.
  Labels always visible; the active tab sits in an accentSoft pill with accentText icon and
  label. Scan is an accent circle with an onAccent icon in the middle of the capsule. Tab
  screens pad their content by the tab bar height (`BottomTabBarHeightContext`).
- Icons: lucide only, sizes and stroke from `t.icon` (meta 16 beside captions, control 20,
  nav 24, stroke 1.75). A selected card or choice uses `t.layout.selectedBorder` (1.5 pt) at
  all times and only changes its colour, so nothing shifts on select.
- Status chips: soft tinted background + coloured dot + text label. Colour is never the
  only signal.

## Key screens
- Live charging: one hero ring (thick stroke, rounded caps, accent with a soft gradient),
  big tabular % or kWh in the centre, elapsed time under it, a 2x3 grid of quiet stat
  tiles, Stop as a full-width danger-outline button.
- Charging summary: the total to pay is the most prominent number on screen; amount
  inputs are large chips; the price breakdown is collapsed by default.
- Wallet: the balance card is the hero (large tabular number); transactions are grouped
  by date.
- Station details (Uber-style, brand palette): a still map of the station with its pin (brand
  charger art on the status gradient when maps are missing) and floating glass back, share and
  heart buttons. A white sheet with a grabber overlaps the map: title1 name, a status dot with
  status and address, 2x2 sunken info tiles (distance, drive, max power, lowest rate), then
  "Chargers" as plain list rows (connector icon in a grey circle, bold "CCS2 · 60 kW DC",
  "Connector n" or charging progress, rate and a status dot on the right, chevron only when it
  can start) and amenity chips. A sticky accent "Get Directions · 1h 58m" button, with Call
  only when there is a phone number.

## Splash, onboarding, auth and first-run setup (flat)
- Completely flat: no shadows, glows or blurs. Shape comes from flat fills (accent,
  accentSoft, surfaceSunken) and 1 pt lines.
- `SplashOverlay` pixel-matches the native splash. If boot takes over 700 ms a thin accent
  line sweeps near the bottom. When ready the logo docks into the auth top bar's logo slot
  (`layout.topBarHeight` / `layout.logoHeight`) while the backdrop fades, so login appears to
  grow out of the splash.
- Auth layout (`AuthScaffold`): top bar with the logo (or a back button), a brand area over the
  contour lines with the heading anchored to its bottom, and a flat surface panel anchored to
  the screen bottom (sheet radius, hairline border, no shadow) holding the form and actions.
  The panel rises with the keyboard (`useAnimatedKeyboard`; edge-to-edge Android never resizes).
- Login and OTP brand areas show `ChargingIllustration`: a flat SVG of an EV plugged into a
  charger, drawn only from theme tokens: a DC fast-charger cabinet (accent top band, dark
  screen with a charge ring, LED strip, holster) and a realistic side-profile car facing it,
  plugged in at the front fender. The car's rear half runs off the right edge on purpose: the
  viewBox crops it and the screens let the art bleed into the right page margin. A floating
  battery chip sits above the car. Pulses run down the cable while the ring, LED strip and
  chip fill together; static under Reduce Motion. It
  takes the free space and is hidden while the keyboard is up (switching phone/email never
  flashes it); it fades back in 300 ms after the keyboard closes. OTP shows the contact in a
  hairline pill under the heading.
- Onboarding backdrop is `AmbientBackground`: a faint dot grid (borderStrong) that fades out
  by mid screen and drifts down one cell at a time.
- Login, OTP and boot error use `ContourBackground`: 1 pt topographic contour lines in accent (30% fading to 8%)
  radiating from the top-right corner, slowly turning (120 s per turn) and breathing, faded to
  bg by 60% of the height so the form sits on plain bg. Both are static under Reduce Motion.
- Headings use `hero` (30/36 semibold, -0.8 tracking), left aligned; subtitles use callout. Content enters with a short
  staggered fade-up (`Reveal`).
- Inputs on these screens use `size="large"` (56 high, 17 pt semibold value). OTP cells are
  flat 56 pt sunken squares; the active cell gets an accent border and a blinking caret.
- Onboarding: "01 / 03" step counter, flat orbit art (accent tile, accentSoft disc, hairline
  ring, two orbiting dots), story-style progress segments, parallax between art and text.

- First-run setup (profile, vehicle, permissions) is content first (`SetupLayout`): a top bar
  (back on wizard steps, Skip on the vehicle step), a named stepper "1 Profile · 2 Vehicle ·
  3 Permissions" (done steps show a check, the current one is accent), the title right under
  it on plain bg, then the body, and one full-width button pinned at the bottom that rises
  with the keyboard. No empty brand area. Profile shows an 80 pt accentSoft avatar that fills
  with the typed initials. The vehicle wizard shows picks so far as accentSoft chips
  ("MG > Windsor EV > 40 kWh") that jump back to that step, a search field on brand and model
  lists longer than 6, and "Custom" capacity as an inline kWh field under the grid.
- Choice grids (vehicle brand, model, capacity): 2 columns of flat cards, surfaceSunken at
  rest; selected = accentSoft fill, 1.5 pt accent border and an accent check badge. Brand and
  model cards carry a letter monogram tile (surface, accent when selected).
- Permission cards: surfaceSunken card with an icon tile, title, description and a
  secondary-style "Allow" (or "Open Settings" when blocked); once allowed the card tints to
  accentSoft with an accent icon tile and "Allowed" check. Continue is the screen's only
  primary button.

## Motion and feedback
- react-native-reanimated springs of about 200-300 ms, layout animations when list items
  are added or removed, animated progress on the charging ring. Respect Reduce Motion.
- State changes never snap: input focus and error colours, button disabled/enabled colours,
  loading spinners and OTP cells transition in about 200 ms. Errors shake once.
- Animate only transform, opacity and colour on the UI thread, never layout, so motion stays
  at the display refresh rate.
- expo-haptics: light on selections and toggles, success on payment and charge start,
  warning on stop or delete confirmation.
- Everything tappable has a pressed state (opacity, or scale 0.98). No dead taps.

## Avoid
Gradient backgrounds (except the backdrop fades above and the map station card), more than one accent colour, shadows of any kind, centred paragraphs,
cramped cards, emoji in the UI, mixed icon sets, grey text below AA, stock illustrations,
and any brand value hard-coded in a component.
