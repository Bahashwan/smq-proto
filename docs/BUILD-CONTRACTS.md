# Build contracts · rules every build agent follows

Read first: `CLAUDE.md`, `docs/route-map.md` (your rows), `docs/tokens.md`, `docs/data-model.md`, then the board outlines you own in `docs/boards/*.txt`. Open `design/preview/*.html` only for an exact SVG path or a pixel question.

## Ownership (no two agents edit the same file)

| Area | Owner writes only here |
|---|---|
| Fixtures | `data/*.ts` (types in `data/types.ts` exist; extend a type only by adding optional fields) |
| Public components | `components/ui/*` + `components/ui/index.ts` + `components/ui/README.md` + `components/ui/_styleguide.tsx` |
| Admin components | `components/admin/*` (same files pattern) |
| Alliance components | `components/alliance/*` (same files pattern) |
| Maps | `components/map/*` (schematic SVG map, pin picker, keyless embed container) |
| Page groups | `app/<routes>/…` for their routes, page-local components under `components/pages/<group>/*`, their screens file `lib/screens/<group>.ts` |
| Presenter | `components/presenter/*`, `app/demo/*`, `lib/screens/presenter.ts` |
| Foundation (do not edit) | `app/layout.tsx`, `app/globals.css`, `styles/tokens.css`, `lib/location.ts`, `lib/presenter.tsx`, `lib/store.ts`, `lib/format.ts`, `lib/url.ts`, `lib/screens/index.ts`, `lib/screens/types.ts`, `next.config.ts`, `package.json`, `docs/PROGRESS.md` |

Need something outside your area? Build it inside your area (e.g. a page-local component) and note it in your final report; do not edit another owner's files. Never run git commands that change state (no add, commit, stash, checkout, reset). Never install packages.

## Stack facts

- Next.js 16 App Router, static export (`output: 'export'`). Every dynamic segment needs `generateStaticParams()` over the fixtures and `export const dynamicParams = false`. Pages can be server components that render client components; anything reading the URL query or the stores is a client component (`"use client"`).
- Read the URL query with `useQuery()` from `lib/location.ts` (never `useSearchParams`); write it with `setQuery({ key: value | null }, "push" | "replace")`. On the server the query is empty: render the default state first.
- Presenter switches: `usePresenter().state` (`tier`, `ustatus`, `app`, `mreq`, `wa`, `members`, `skeleton`, `marks`, `proof`, `offline`, `empty`, `error`, `tour`, `step`, `demo`). `useMarks()` says whether `[للتأكيد]` chips show. Parameters and meanings: `docs/route-map.md` «Presenter parameters».
- In-memory mutations: `useStore` from `lib/store.ts` (unit status, approvals, leads, applications, marketers, requests + offers, referral stages, created referrals/requests, free-form `patch(entity, id, data)`, `toast(text)`). Effective status = store override ?? fixture value. Write that merge in a selector, not in JSX. Read the unit overrides with `useUnitOverrides()` from `lib/store.ts` (never `useStore(s => ({ … }))` with an inline object: that snapshot is a new object every call and React loops with «getServerSnapshot should be cached»); select other slices one at a time (`useStore(s => s.approvals)`).
- Fixtures: import from `data/*` and compute with `data/selectors.ts`. Never type a number from a board into JSX. The ten units are real; everything else is illustrative and must stay consistent with `docs/data-model.md`.
- Formatting: `fmtNum`, `fmtArea`, `ppm`, `fmtDate`, `fmtDateLong`, `bedsLabel`, `bathsLabel`, `waLink`, `visitorCode`, `cx` from `lib/format.ts`. Money renders with `<Price value={n} />` (`components/ui/Price.tsx`), never «ريال» next to the sign unless the copy spells it.
- Tailwind v4 utilities from the theme: colours `ink gold gold-text gold-hover paper cream cream-focus sand slot line muted ink-2 on-ink-muted on-gold-muted disabled`; type `text-display text-h1 text-h2 text-h3 text-body text-label text-caption text-price text-price-s text-ppm`; shapes `cut-s cut-m cut-l cut-xl cut-img cut-img-l cut-tag hex-flat hex-point`; borders `border-interactive border-hairline border-error`; `tnum container-smq motion-hover motion-sheet skeleton img-sold img-desaturated`; breakpoints `sm 390 md 768 lg 1024 xl 1440` (desktop boards = `xl:`/`md:` prefixes; phone first). Spacing uses the default 4px scale (`p-4` = 16px). No arbitrary hex values, no shadows, no radius.
- Copy: verbatim from the board outline (`"…"` strings), annotations excluded (the grey designer notes at the top of some boards, «ملاحظات», provider notes). `[للتأكيد]` / `[مسودة إجابة]` render through `<Mark />` (`components/ui`), never as literal brackets.
- Images: `<ImageSlot slotId tier … />` from `components/ui` renders the three tiers (generated = neutral placeholder art + «صورة تعبيرية» label until Phase 8 drops files into `public/images/<slot>/`; real = `public/real/<slot>.jpg` or the neutral frame; typographic = the numbers tile). Never embed a raster image yourself.
- Maps: never a map library. `components/map`: `SchematicMap` (results map), `PinPicker` (draggable hexagon pin + paste-a-link preview), `MapEmbed` (keyless Google Maps iframe, lazy, schematic placeholder, frame on the container, iframe never clipped, logo and controls visible).
- `/en` pages: wrap in `<div dir="ltr" lang="en" className="font-latin">` and include `<EnHtmlAttrs />` (`components/ui`) so the html attributes flip; the EN switch shows only on `/`, `/units`, `/units/[code]`.
- 390-only boards (member, marketer page, phone-only states): render in a centred phone-width column on desktop (`max-w-[390px] mx-auto`).
- Accessibility: every control has a visible label or `aria-label`; tap targets ≥ 44px; focus ring is the theme's gold outline.

## Register your screens and verify

1. Fill `lib/screens/<group>.ts`: one `Screen` per board row you own (board name, exact route with state params, width 390 or 1440, section heading as written in `docs/route-map.md`, `prepare` steps when a state needs a click or scroll).
2. Typecheck: `npx tsc --noEmit` (must be clean for your files; report other owners' errors instead of fixing them).
3. A shared dev server runs at `http://localhost:3000`, kept alive by a watchdog. Never start another dev server (extra servers rewrite `tsconfig.json` and exhaust memory). If it does not answer, wait 30 s and retry; after a restart the first request to a route compiles for a few seconds. Never run `next build` (the orchestrator does); `npx tsc --noEmit` is the check.
4. Board renders: `npx tsx scripts/shots/boards.ts <Board> …` → `docs/shots/boards/<Board>.png`. Page shots: `npx tsx scripts/shots/shots.ts --group=<group>` → `docs/shots/<Board>.png`, or one URL with `npx tsx scripts/shots/shot.ts <url> <width> <out.png>`. Look at both PNGs (Read tool) and fix the differences in layout, copy, order, shape, colour and state. Two to three rounds per board is the budget; note what still differs in your report.
5. Final report (your return value): routes built, screens registered, shots written, known gaps, anything you needed from another owner.
