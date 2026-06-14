# Design Guidelines

For designers and anyone touching the UI. Tripti has one coherent visual system —
please extend it, don't fork it. The canonical source of truth in code is
[`src/lib/tokens.ts`](../src/lib/tokens.ts); this document explains the intent.

## 1. Brand essence

**Tripti** (तृप्ति) means *the deep satisfaction of being well-fed and cared for.*
Design like a **trusted family friend who knows the house** — warm, calm, reassuring.

- **Care, not optimization.** No calorie rings, no streaks, no gamification, no
  pressure. The emotional target is *"Ah okay, manageable."*
- **Honest, never alarming.** Cost and confidence are shown plainly; uncertainty is
  admitted calmly with a backup, never with red warnings.
- **Kitchen-real.** Mobile-first, one-handed, often tired-after-work, readable at
  arm's length, sometimes a beginner cook.

## 2. Color

Warm sage-green primary + gentle clay accent on fed-cream neutrals. **No
spice-market orange.** Confidence uses sage → honey → clay (never red).

| Role | Token(s) | Hex |
|---|---|---|
| App background | `screen` / `screenAlt` | `#F6F0E6` / `#EFE8DA` |
| Card / surface | `card` | `#FFFDF8` |
| **Sage** (primary) | `sage` / `sageDeep` | `#5F7D5A` / `#45603E` |
| Sage soft fills | `sageBgSoft` / `sageBgSofter` | `#E7EDE2` / `#EAF0E4` |
| **Clay** (accent / "to buy") | `clay` / `clayText` / `clayBg` | `#C2876A` / `#9A5B3E` / `#F4E5DB` |
| **Honey** (gentle caution / experimental) | `honey` / `honeyText` / `honeyBg` | `#C7A24E` / `#8A6D2E` / `#F3E9D2` |
| Ink / headings | `ink` / `inkSerif` | `#322E28` / `#2C2820` |
| Body / muted text | `muted` / `muted2` / `faint` | `#736B5E` / `#8A8073` / `#A89E88` |
| Hairlines | `line` / `line2` / `line3` | `#EDE6D8` / `#EAE2D4` / `#E7DFD0` |

**Rules**
- Confidence: **high → sage, medium → honey, low → clay.** Never red, never a ring.
- Whites/blacks are subtly warm — don't introduce pure `#FFFFFF` / `#000000`.
- Use new colors only if a token doesn't exist; if you must, add it to `tokens.ts`
  with the same warmth and low saturation, and document it here.

## 3. Typography

Three self-hosted families (via `@fontsource` — **never** add a Google Fonts link):

| Family | Use | Notes |
|---|---|---|
| **Newsreader** (serif) | Dish names, the wordmark, warm "moments" | 400–600; italic for soft emphasis |
| **Hanken Grotesk** | All UI text | 400/500/600/700; the workhorse |
| **Noto Serif Devanagari** | देवनागरी script | 500/600 |

- Generous sizes and line-height; legible at arm's length.
- Headings in Hanken 700 or Newsreader 500 (dish names). Body 14–16px, ≥1.4 line-height.

## 4. Shape, spacing & touch

- **Radii:** chips `13`, buttons `16–17`, cards `16–26`, pills `20`, phone-screen
  container is full-width up to `480px`.
- **Touch targets ≥ 44×44px.** Steppers, chips, segments must be comfortably tappable
  one-handed.
- Generous padding (cards ~18px, screens ~22px). Whitespace is part of the calm.

## 5. Components

Reuse the primitives in [`src/components/ui.tsx`](../src/components/ui.tsx):
`Screen`, `Chip`, `Segmented`, `PrimaryButton`, `LangToggle`, `ConfidenceChip`,
`Card`, `TopBar`, `Eyebrow`, `DishPlaceholder`. Styling helpers (`chip`, `seg`, `fb`,
`providerRow`, `langRow`, `radioDot`, `primaryBtn`) live in `tokens.ts`.

- Selected state = sage border + sage-soft fill.
- Primary action = solid sage button with a soft shadow.
- Eyebrows = uppercase, letter-spaced, `faint` color.

## 6. Motion

Motion reassures, never performs. (Technical rules in `globals.css`.)

- **Fast & gentle:** ~150–250ms, ease-out.
- **GPU-friendly only:** animate `transform` / `opacity`. No layout-animating props.
- **Earns its place:** route/screen transitions, the thinking skeleton, the hero/card
  easing in, tap micro-confirmations, "Almost" expanding, live-total tick, on-device
  download progress.
- **Stays out:** anything celebratory or gamified (no confetti, no streaks); never
  animate the health/cost/confidence numbers; never block reaching the suggestion.
- **Always provide a `prefers-reduced-motion` fallback** (the global stylesheet
  neutralizes animations; don't override it).

## 7. Microcopy & tone

- Warm, direct, practical. Speak like someone who already likes this household.
- **Never preachy about health; never imply the family eats "wrong."**
- **Defer medical numbers to the doctor** ("your doctor sets the numbers; this just
  sources around them").
- **Honest privacy:** "no servers," "a key here is only as safe as your phone." Don't
  overclaim safety.
- All user-facing strings live in [`src/lib/i18n.ts`](../src/lib/i18n.ts) /
  [`provI18n.ts`](../src/lib/provI18n.ts) with **EN / Hinglish / हिंदी** — add copy in
  all three (English fallback is acceptable for a first pass, but flag it).

## 8. Imagery & icons

- Dish/photo areas use **striped placeholders** today (`DishPlaceholder`). Real warm,
  "fed and content" food photography is the single highest-impact contribution —
  must be license-clear and self-hosted.
- The logo mark (sage cradle-arc + clay dot) is in `public/brand/` and as the inline
  `TriptiMark` component. Don't redraw it; reuse it.
- Avoid complex hand-drawn SVGs; simple shapes only.

## 9. Accessibility & localization

- Maintain legible contrast on warm backgrounds; test at arm's length and in
  sunlight-ish brightness.
- Large targets, one-handed reach, clear focus states.
- Devanagari is LTR; keep layouts language-agnostic. The language toggle is persistent.

## 10. Proposing a design

1. Stay inside this system (palette, type, motion, tone). If you need a new token,
   propose it here with rationale.
2. Mock it up (Figma, [Claude Design](https://claude.ai/design), or HTML) — provide
   exact colors, sizes, spacing, and copy in all three languages.
3. Open a PR or issue with **screenshots** and a short note on the user need.
4. Confirm reduced-motion behavior and touch-target sizes before review.
