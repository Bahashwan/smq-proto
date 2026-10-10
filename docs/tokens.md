# Token names · `styles/tokens.css`

Tokens.html names only the colours, the cuts and the two hexagons. Everything else on the sheet (type, space, container, borders, motion) gets the names below so that every session uses the same ones. Values are exact copies of the sheet. Desktop first; the phone value applies under `@media (max-width: 767px)` (breakpoints 390 · 768 · 1024 · 1440).

## Colours (from Tokens.html, verbatim)

| Token | Value | Use |
|---|---|---|
| `--smq-ink` | #141311 | primary text, header, footer, secondary buttons, price band |
| `--smq-gold` | #B48F2E | WhatsApp, «متاح», budget block, numbers on ink. Ink text on it only |
| `--smq-gold-text` | #8A6C1E | gold as text on white: links, eyebrows, «متاح» in tables, error text |
| `--smq-paper` | #FFFFFF | page |
| `--smq-cream` | #F8F7F4 | table heads, quiet field backgrounds, admin page background |
| `--smq-sand` | #F3F1EB | alternate sections, corner cells, active chips |
| `--smq-slot` | #E9E5DB | image slots before load, skeletons |
| `--smq-line` | #D4CFC4 | 1px dividers, non-interactive frames |
| `--smq-muted` | #5E5A52 | secondary text on white (min 11px) |
| `--smq-ink-2` | #3A3630 | dividers on ink, reserved price band |
| `--smq-on-ink-muted` | #C9C2B3 | secondary text on ink |
| `--smq-on-gold-muted` | #3D3010 | secondary text on gold |

Three more colours appear across the component sheets and get names of their own:

| Token | Value | Use |
|---|---|---|
| `--smq-gold-hover` | #9C7A22 | primary button hover |
| `--smq-disabled` | #8A8478 | disabled text |
| `--smq-cream-focus` | #FFFDF6 | field focus and error background, «يحتاج تأكيداً» chip background |

## Geometry

| Token | Value |
|---|---|
| `--cut-s` | 8 × 14 (`polygon(0 0, calc(100% - 8px) 0, 100% 14px, 100% 100%, 0 100%)`) · chips, small buttons |
| `--cut-m` | 12 × 21 · primary buttons |
| `--cut-l` | 16 × 28 · answer and price blocks |
| `--cut-xl` | 36 × 62 · images and hero blocks, bottom-left corner (`polygon(0 0, 100% 0, 100% 100%, 36px 100%, 0 calc(100% - 62px))`) |
| `--cut-img` · `--cut-img-l` | 24 × 42 and 42 × 72 · image slots, bottom-left corner |
| `--cut-xl-start` · `--cut-img-start` · `--cut-img-l-start` | the same block cuts on the bottom line-start corner (bottom-right in RTL), where a board draws them there (Home hero, About images, founder tile); utilities `cut-xl-start`, `cut-img-start`, `cut-img-l-start` |
| `--hex-flat` | `polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)` · badges, numbered steps, icon buttons 40 to 64px |
| `--hex-point` | `polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)` · markers, bullets, slider knobs, pins 10 to 32px |

Rule: dy = dx × 1.732 (60°). Cuts sit on the top-left corner of interactive elements (line end in RTL) and the bottom-left of large blocks. In LTR (`/en`) every cut mirrors to the other corner. Border radius is 0 everywhere. No gradients, no shadows.

## Type (Noto Kufi Arabic; Noto Sans for Latin on `/en`, Arabic inside `/en` keeps Noto Kufi)

| Token | Desktop size / line-height / weight | Phone |
|---|---|---|
| `--smq-text-display` | 56 / 1.1 / 800 | not used on phone (hero h1 is 30 to 32) |
| `--smq-text-h1` | 40 / 1.15 / 800 | 32 |
| `--smq-text-h2` | 28 / 1.2 / 800 | 20 |
| `--smq-text-h3` | 18 / 1.3 / 800 | 18 |
| `--smq-text-body` | 15 / 1.8 / 400 | 14 / 1.7 |
| `--smq-text-label` | 13 / 1.5 / 700 | 13 |
| `--smq-text-caption` | 11 / 1.6 / 600 | 11 (minimum; never 10px for readable text) |
| `--smq-text-price` | 36 to 56 / 1 / 800, letter-spacing -0.02em | 28 to 36 |
| `--smq-text-ppm` | 14 to 20 / 800 | |

Root: `font-feature-settings: 'tnum' 1`, Western digits everywhere (`unicode-bidi` left alone; numbers are plain Latin digits in the source). Thousands separator comma; decimals only in areas (82.60). The Riyal sign is the inline SVG `<RiyalSign />`: viewBox `0 0 20 24`, path `M5 2v15l-3 2.5M11 5v10M2 13.5l15-5M2 19.5l15-5`, stroke currentColor 2.4 round, height 0.75em, 0.25em gap before the number. This is the sheet's placeholder; replace the path with the official SAMA SVG when it is dropped at `design/brand/riyal.svg`. Never print «ر.س» or «ريال» next to the sign (the word «ريال» appears only where the copy spells it out).

## Space, container, borders, motion

| Token | Value |
|---|---|
| `--smq-space-1` … `--smq-space-11` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96 |
| `--smq-container` | 1280px |
| `--smq-gutter` | 32px desktop · 16px phone (20px on wide phone blocks) |
| `--smq-section-gap` | 96px desktop · 36px phone |
| `--smq-card-gap` | 16px · grid `auto-fill minmax(280px, 1fr)` |
| `--smq-tap-min` / `--smq-tap-primary` / `--smq-tap-chip` | 44px · 52 to 60px · 32 to 38px |
| `--smq-border-interactive` | 1.5px solid ink |
| `--smq-border-line` | 1px solid line |
| `--smq-border-active` | 3px solid gold (active tab) |
| `--smq-border-error` | 2px solid gold, background `--smq-cream-focus`. The Tokens sheet sentence says 1.5px; the Components sheet and the Contact-Error-M board draw 2px + #FFFDF6, and the built state follows those two |
| `--smq-motion-hover` | 120ms |
| `--smq-motion-sheet` | 200ms |
| `--smq-motion-skeleton` | 1400ms pulse |
| `--smq-ease` | ease-out |

`@media (prefers-reduced-motion: reduce)`: transitions and the skeleton pulse go to 0ms; the honeycomb fill and count tick render their end state.

## Tailwind

Tailwind v4 `@theme` maps these to utilities: `bg-ink`, `text-gold-text`, `border-line`, `text-h2`, `gap-5` (space scale), `cut-s/m/l/xl`, `hex-flat`, `hex-point`. Components never hardcode a hex value or a pixel size that exists as a token.
