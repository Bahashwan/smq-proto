# PROGRESS · SMQ prototype tracking file

Single source of truth for where the build stands, so that work can continue from any Claude Code session (cloud or local) without the original conversation. Update it in the same commit as the work it describes.

"The client" below means the project owner: the author of `docs/BRIEF.md`, who talks to Claude Code in chat. Their OKs arrive in chat, not on GitHub.

## How to resume (local Claude Code)

1. `git clone https://github.com/Brave-WebServices/smq-realestate && cd smq-realestate && git checkout prototype`
2. Read in this order: `CLAUDE.md` → `docs/BRIEF.md` (the spec, verbatim, plus amendments) → `docs/route-map.md` (every board → route + state, presenter parameters, plan) → this file (status, decisions, next action) → `design/README.md` → `docs/tokens.md` and `docs/data-model.md` when building.
3. Boards: do not re-read the 130 HTML files. `docs/boards/*.txt` holds a text outline of every board (tag, inline style, copy); open the HTML only for an exact pixel question. Regenerate the outlines with `python3 scripts/design/board-outline.py design/preview docs/boards`.
4. `cp .env.example .env.local` and ask the client for `AI_GATEWAY_API_KEY`. Only `scripts/images` needs it; the app never reads it. The key is never committed, and it should be rotated by the client once the image phase is done.
5. Once the app exists (Phase 1): `npm install`, `npx playwright install chromium` (only needed outside the cloud container, which has Chromium at `/opt/pw-browsers`), `npm run dev`.
6. Continue from **Next action** below. Commit and push every change to `prototype` (PR #1 is the long-lived build PR; it is not retitled or closed per phase). Update this file in the same commit.

### Intended scaffold (Phase 1 creates it; keep to this layout)

- Versions: `next` 16.x (16.4.0 at the time of writing), `react` 19.3, `typescript` ^5, `tailwindcss` ^4 (CSS `@theme`), `@playwright/test` latest, `sharp` latest, `ai` ^7 (bundles the gateway provider).
- `next.config.ts`: `output: 'export'`, `images: { unoptimized: true }`, trailing slashes off. Every dynamic segment has `generateStaticParams` over the fixtures and `export const dynamicParams = false`.
- Folders: `app/` (routes, `app/en/*`, `app/og/*`, `app/demo/*`, `app/admin/*`, `app/member/[token]/*`), `components/` (shared UI by the Components sheets), `data/` (typed fixtures, `data/selectors.ts`), `lib/` (presenter state, store, formatting, url params), `styles/` (`tokens.css`, `globals.css`), `scripts/images/` (manifest, generate, convert), `scripts/design/` (board tooling), `scripts/shots/` (Playwright screenshots), `public/` (`images/`, `real/`, `og/`, icons), `docs/shots/` (page screenshots next to board screenshots).
- npm scripts: `dev`, `build` (static export to `out/`), `lint`, `typecheck`, `shots` (390 + 1440 screenshots of every route in `docs/route-map.md`), `og` (renders `/og/*` to `public/og/*.png`), `images` (generation; `--force`, `--only=<slot>`, `--dry-run`).
- `vercel.json`: `X-Robots-Tag: noindex, nofollow` on every path. `public/robots.txt`: disallow all.

### Showing a section to the client

- `npm run shots` writes `docs/shots/<Board>-390.png` and `docs/shots/<Board>-1440.png` for the routes of that section (file name = board name from `docs/route-map.md`). The matching board screenshots live beside them as `docs/shots/boards/<Board>.png`. Both are committed.
- "Shown" means the page/board pairs were posted in chat and the differences fixed; there is no Vercel deployment yet. When the client wants a link, deploy `out/` to Vercel (noindex headers already in `vercel.json`).

## Status

Legend: `[ ]` not started · `[~]` in progress · `[x]` done and pushed · `[v]` shown to the client and accepted · `[!]` blocked

Phase 0 · Planning
- [x] Read all 130 boards and the README (2026-10-09); outlines in `docs/boards/`
- [x] Route table and plan: `docs/route-map.md` (pushed, PR #1)
- [!] **Client OK on the route table and the six decisions** at the end of `docs/route-map.md` (the seventh item there is a note, not a decision). Nothing is built until this arrives in chat.
- [x] Research: AI Gateway flux-3-image API → `docs/notes/ai-gateway.md`
- [x] Maps decision received 2026-10-10 (keyless embeds + schematic SVGs, no map library) → folded into `docs/BRIEF.md` and `docs/route-map.md`
- [x] Token names (`docs/tokens.md`) and data model (`docs/data-model.md`) written

Phase 1 · Tokens, shell, shared components
- [ ] Next.js app scaffold as above (static export, noindex meta + `vercel.json` header + `robots.txt`, `npm run shots` harness)
- [ ] `styles/tokens.css` with every `--smq-*` token from Tokens.html, names per `docs/tokens.md`; cuts and hexagons as utilities; motion tokens; reduced-motion rule
- [ ] Fonts: Noto Kufi Arabic (400/600/700/800) as the default; Noto Sans only on `/en*`. Western digits everywhere (`lang` + no Arabic-Indic shaping), `font-variant-numeric: tabular-nums` on every number
- [ ] Riyal sign component (inline SVG, 0.75em, currentColor, 0.25em gap; placeholder path in `docs/tokens.md`)
- [ ] CSS treatments: `.is-sold` / `.is-desaturated` image rules (grayscale + ink veil) live in CSS, never baked into the image files
- [ ] Shared components from Components.html / Components2.html / Components3.html (buttons, chips, segmented, tabs, fields with gold error, stepper, badges, price band, rows, accordion, breadcrumb, image slots with the three tiers, toast, compare bar, data table row, field group, switch, drag handle, status pills, file upload, AR/EN tab, save bar, drawer, dialog, door card, district multi-select, hex district cell, FAL badge, ledger bar, stage line, request card, referral receipt, board column)
- [ ] Header (72 → 56 scrolled, mobile menu sheet), footer, `[للتأكيد]` chip, «صورة تعبيرية» label, keyless map embed container (frame on the container, iframe never clipped, logo and controls visible, lazy with schematic placeholder)
- [ ] `/data` fixtures per `docs/data-model.md`: units (the ten real rows), projects, districts, offices, applications, requests, referrals, marketers, leads, visitors, analytics, content, media, settings; `data/selectors.ts` for every computed number
- [ ] In-memory client store (`smq.store`) + presenter state (`smq.presenter`, URL parameters override)
- [ ] `/demo/components` styleguide for QA

Phase 2 · Public explorer
- [ ] `/` home (finder with live count, project card, price guide, services, founder typographic card, FAQ, contact block with keyless embed)
- [ ] `/units` results (URL filters, sort, compare, sold strip, load-more), filters sheet, `?skeleton=1`, empty state with computed loosen suggestions and the alliance bridge, `/alliance/request/sent`
- [ ] `/units/map` interactive schematic SVG map (pins with computed counts, sheet / side card, zoom buttons)
- [ ] `/guide`
- [ ] `/projects`, `/projects/garden-rawdah` (keyless embed at الروضة centre + «الموقع تقريبي [للتأكيد]»)
- [ ] `/units/[code]` (available / `?ustatus=reserved` / sold / roof), `/gallery`, `/plan` (schematic SVG plan), three image tiers (`?tier=`)
- [ ] `/compare` (3 / one / empty)
- [ ] Screenshots at 390 and 1440 against the boards, fixes, shown to the client

Phase 3 · Remaining public pages
- [ ] `/services`, `/add` (three steps, building variant, `/add/sent`), `/about` (+ `?proof=1`), `/contact` (+ sent, error, `?offline=1`; keyless office embed at street level), `/privacy`, 404, `/en`, `/en/units`, `/en/units/[code]`
- [ ] Screenshots, fixes, shown

Phase 4 · تعاون معنا, alliance, forms
- [ ] `/collaborate`, `/alliance` (12 members; `?members=0`; honeycomb fill animation), `/alliance/apply` (3 steps, sent, status via `?app=`), `/marketers` (+ sent)
- [ ] Screenshots, fixes, shown

Phase 5 · Member and marketer pages (390 only, phone column on desktop)
- [ ] `/member/[token]` ledger, `/requests/[id]` (`?mreq=`), `/referrals/[id]`, `/report`; `/m/[token]`; `/r/[name]` client redirect with attribution (`smq.ref`, 30 days)
- [ ] Screenshots, fixes, shown

Phase 6 · Admin
- [ ] Shell (sidebar, phone tabs, bell dropdown, toasts), `/admin/login` (+ `?error=1`)
- [ ] Overview, approvals (role checklist, approve in memory), units + Excel import panel (`?import=1`), unit editor (delete dialog), projects + project editor (SVG pin picker), leads (drawer / sheet, manual status), analytics, visitors (drawer), `?empty=1` states
- [ ] Content hub, page editor with live preview, FAQ, partners, testimonials, lists, site settings (SVG pin picker), SEO, media (generated = تعبيرية), needs-confirmation list, users (`?wa=manual`)
- [ ] Marketers + detail; alliance room: overview (+ phone), applications, members + member, radar with district drawer, requests (pick offer → create REF in memory), referrals (dispute, stage update), report, settings
- [ ] Screenshots, fixes, shown

Phase 7 · Presenter and tours
- [ ] `/demo` screen map by README section with every state deep-linked; presenter bar (`Shift+P`, `?demo=1`) with all switches of the parameter table in `docs/route-map.md`; `[للتأكيد]` chip toggle (`marks`)
- [ ] Tours: buyer, owner (`/add/sent?no=2026-1042` → `/admin/approvals/2026-1042`), alliance request (overlay with next / previous over real routes)

Phase 8 · Images (script only, never at request time)
- [ ] `scripts/images/manifest.ts` from Shots.html (31 slots: id, aspect ratio, group exterior / interior / editorial / brand, prompt in English prefixed by the shared look «ضوء جدة الصباحي» rendered in English, the palette, and the exclusions)
- [ ] `scripts/images/generate.ts` (AI SDK 7, `bfl/flux-3-image`, `resolution: '2k'`, reference images via `prompt.images`, running cost printed from the catalog price, hard stop at $15, skips slots in `picks.json` unless `--force`)
- [ ] Anchors first: IMG-PRJ-ROWDAH-EXT, IMG-UNIT-APT-3BR-LIVING, IMG-ED-BALAD-RAWASHEEN, IMG-ED-CORNICHE-DAWN, two candidates each on `/demo/contact-sheet`; the client picks in chat; the picks go into the decision log
- [ ] Rest of the slots with the approved exterior + interior as references, two candidates each at 2048 class; reject people, text, signage, plates, non-Jeddah skylines, warped architecture (noted in `scripts/images/rejections.md`)
- [ ] Outputs: `public/images/<slot>/<slot>-{640,1280,2048}.{avif,webp}` + a blur placeholder; the chosen file's model, prompt and seed recorded in `scripts/images/picks.json` (seed is read from `providerMetadata` when the provider returns one; otherwise the request id is stored)
- [ ] IMG-HERO-BRAND with the logo reference `design/brand/logo-mark-gold.png`; composite the real mark in CSS/SVG if the generated mark is distorted
- [ ] Fallback `google/gemini-nano-banana-2.1` via `generateText` + `result.files` when flux fails for a slot

Phase 9 · Link previews and icons
- [ ] `/og/*` routes screenshotted to `/public/og/*.png` with Playwright (`npm run og`); metadata wired
- [ ] favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png, icon-512-maskable.png

## Decision log

| Date | Decision | Source |
|---|---|---|
| 2026-10-09 | Route table and plan written; six decisions proposed (hub `/collaborate`, `/r/[name]` redirect + `/m/[token]`, `/member/office-NN` tokens with مكتب ط in the tour, generated tier as public default, marketer success on the Add-Success pattern, add steps `/add`, `/add/details`, `/add/contact`, `/add/sent`) | `docs/route-map.md`, awaiting client OK |
| 2026-10-10 | Maps: no map library, no Maps key. Office/project = keyless Google Maps embed iframes (hl=ar / hl=en), lazy, schematic placeholder + fallback, frame on the container and the iframe never clipped. Results map and pin pickers = interactive schematic SVG. Coverage grid and radar stay hexagon grids | Client, final |
| 2026-10-10 | Push every change as it lands; PR #1 tracks `prototype` | Client |
| 2026-10-10 | REQ-2026-0412 / REF-2026-0117 use مكتب ط throughout (fixes the board inconsistency) | Brief |
| 2026-10-10 | AI Gateway: `generateImage` with `bfl/flux-3-image`, `providerOptions.blackForestLabs.resolution: '2k'`, references in `prompt.images`; fallback `google/gemini-nano-banana-2.1` via `generateText` + `result.files` | `docs/notes/ai-gateway.md` |
| 2026-10-10 | Static export: every dynamic route pre-rendered from the fixtures (`generateStaticParams`, `dynamicParams = false`); `/r/[name]` redirects on the client; noindex via meta + `vercel.json` + `robots.txt` | Claude, from the brief's "static export to Vercel" |
| 2026-10-10 | Owner tour request number is 2026-1042 (the building request the Admin-Approvals-D board opens); the apartment success screen uses 2026-1043 | Claude, resolves the board mismatch |
| 2026-10-10 | Presenter switches are one URL parameter each (`members`, `tier`, `ustatus`, `app`, `mreq`, `wa`, `skeleton`, `marks`, `proof`, `offline`, `empty`, `error`, `tour`+`step`); storage keys `smq.presenter`, `smq.compare`, `smq.ref`, `smq.store` | Claude, table in `docs/route-map.md` |

## Open questions for the client

1. OK on the route table and the six decisions in `docs/route-map.md`? (blocking, answered in chat)
2. Google's own "Embed a map" code for the office (to replace the coordinate-built embed URL) — later.
3. Real photos for `/public/real`, if any — later.
4. Anchor image approval, then candidate picks — at Phase 8.
5. Rotate `AI_GATEWAY_API_KEY` after the image phase (it was pasted in chat).

## Working notes

- Real data = only the ten units in `design/README.md`. Every count / range / per-m² / yield / ranking is computed from `/data`; never type a number from a board.
- The `[للتأكيد]` and `[مسودة إجابة]` markers render as a gold-outlined chip; the presenter can hide them.
- Office names stay placeholders (مكتب أ … مكتب ل). All admin, alliance, analytics numbers are illustrative; keep the «الأرقام توضيحية» notes.
- WhatsApp: `https://wa.me/966559997929?text=…` with the designed prefilled messages and a visitor reference code `SMQ-XXXXX`.
- The results-map provider note on the boards is dropped; everything else on the boards is copied verbatim, annotations excluded.
- Board outlines: `docs/boards/*.txt`, generated by `scripts/design/board-outline.py` (tag, inline style summary, copy). Enough for layout and copy; open the HTML for exact SVG paths.

## Next action

Wait for the client's OK on `docs/route-map.md` (table + six decisions). Then start Phase 1 (scaffold per "Intended scaffold", tokens per `docs/tokens.md`, shared components, fixtures per `docs/data-model.md`), push, and continue with Phase 2.
