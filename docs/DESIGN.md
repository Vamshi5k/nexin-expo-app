# Design direction: modern, clean, professional (2026)

## Feel
Calm and confident, like a good banking or mobility app. Content first, generous whitespace,
one accent colour used sparingly, big readable numbers. Nothing decorative that doesn't help
the driver find, start, watch or pay for a charge.

## Colour
- Components use semantic tokens only: bg, surface, surfaceRaised, surfaceSunken, border,
  textPrimary, textSecondary, textTertiary, accent, accentSoft, accentText, onAccent,
  success, warning, danger, plus connector status colours. No raw hex outside src/theme
  and brand/.
- accent = the brand colour as a FILL (buttons, active tab, selected chips, progress ring,
  map pins). accentText = the brand colour as TEXT or ICONS on light surfaces (links,
  "See all", selected tab label, icons in accentSoft circles). Never use accent itself as
  text on a light background.
- onAccent is computed (dark or white, whichever passes 4.5:1). For Cruze teal that is dark
  text (#0E2E31).
- Derive a neutral grey scale (50-950) slightly tinted towards the brand hue; most of the UI
  is neutrals. The brand colour never fills large backgrounds.
- Contrast: WCAG AA (4.5:1 body text, 3:1 large text and icons) in light and dark.
  brand:check warns on any failing pair.
- Light and dark palettes come from semantic tokens; the dark palette is derived from the
  brand, not inverted. In dark mode, accent works as text directly when it passes.
  brand.appearance: 'system' | 'light' | 'dark'.

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
- Radius: controls 12, cards 16, sheets 28, pills full.
- Depth comes from layering and hairline borders (StyleSheet.hairlineWidth), plus one very
  soft shadow level for floating items (FAB, map search, sheets). No heavy drop shadows.
- Primary button height 52, full width, in a sticky footer above the safe area on forms.
  Minimum touch target 44x44.
- Main screens use large-title headers that collapse to a compact title on scroll.

## Components and patterns
- Bottom sheets for choices, filters and confirmations; Dialog only for destructive or
  blocking actions.
- Segmented controls for tabs inside a screen. Settings-style screens (Profile, Edit
  Profile) use inset grouped lists.
- Skeletons match the final layout, with a subtle shimmer. A full-screen spinner only
  during payment and charger start.
- Empty and error states: simple line icon in an accentSoft circle, one-line title, one
  sentence, one action.
- Floating map controls (search pill, filter, my-location) sit on a blurred translucent
  surface (expo-blur, or the native glass effect where the SDK supports it), with a solid
  fallback on Android if blur is slow.
- Tab bar: labels always visible, raised circular Scan button in accent with onAccent icon,
  hairline top border, translucent background.
- Icons: lucide only, stroke 1.75, size 20 inline and 24 in navigation.
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
- Station details: hero image with a gradient fade at the bottom, and a sticky bottom bar
  with Directions and the primary action.

## Motion and feedback
- react-native-reanimated springs of about 200-300 ms, layout animations when list items
  are added or removed, animated progress on the charging ring. Respect Reduce Motion.
- expo-haptics: light on selections and toggles, success on payment and charge start,
  warning on stop or delete confirmation.
- Everything tappable has a pressed state (opacity, or scale 0.98). No dead taps.

## Avoid
Gradient backgrounds, more than one accent colour, heavy shadows, centred paragraphs,
cramped cards, emoji in the UI, mixed icon sets, grey text below AA, stock illustrations,
and any brand value hard-coded in a component.
