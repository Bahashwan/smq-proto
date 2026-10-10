# PROGRESS · SMQ prototype tracking file

Single source of truth for where the build stands, so that work can continue from any Claude Code session (cloud or local) without the original conversation. Update it in the same commit as the work it describes.

"The client" below means the project owner: the author of `docs/BRIEF.md`, who talks to Claude Code in chat. Their OKs arrive in chat, not on GitHub.

## How to resume (local Claude Code)

1. `git clone https://github.com/Brave-WebServices/smq-realestate && cd smq-realestate && git checkout prototype`
2. Read in this order: `CLAUDE.md` → `docs/BRIEF.md` (the spec, verbatim, plus amendments) → `docs/route-map.md` (every board → route + state, presenter parameters, plan) → this file (status, decisions, next action) → `design/README.md` → `docs/tokens.md` and `docs/data-model.md` when building.
3. Boards: do not re-read the 130 HTML files. `docs/boards/*.txt` holds a text outline of every board (tag, inline style, copy); open the HTML only for an exact pixel question. Regenerate the outlines with `python3 scripts/design/board-outline.py design/preview docs/boards`.
4. `cp .env.example .env.local` and ask the client for `AI_GATEWAY_API_KEY`. Only `scripts/images` needs it; the app never reads it. The key is never committed, and it should be rotated by the client once the image phase is done.
5. Once the app exists (Phase 1): `npm install`, then `npx playwright install chromium` on a local machine. In the cloud container skip that install (it sets `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and ships chromium-1194 under `/opt/pw-browsers`), which is why `@playwright/test` is pinned to 1.56.x below; if the pin ever moves, launch with `executablePath: '/opt/pw-browsers/chromium'` there. Then `npm run dev`.
6. Continue from **Next action** below. Commit and push every change to `prototype` (PR #1 is the long-lived build PR; it is not retitled or closed per phase). Update this file in the same commit.

### Intended scaffold (Phase 1 creates it; keep to this layout)

- Versions: `next` 16.x (16.4.0 at the time of writing), `react` 19.3, `typescript` ^5, `tailwindcss` ^4 (CSS `@theme`, no `tailwind.config`), `@playwright/test` ~1.56.1 (matches the cloud container's browser build), `sharp` latest, `ai` ^7 (bundles the gateway provider).
- `next.config.ts`: `output: 'export'`, `images: { unoptimized: true }`, trailing slashes off. Every dynamic segment has `generateStaticParams` over the fixtures and `export const dynamicParams = false`.
- Folders: `app/` (routes, `app/en/*`, `app/og/*`, `app/demo/*`, `app/admin/*`, `app/member/[token]/*`), `components/` (shared UI by the Components sheets), `data/` (typed fixtures per the file list in `docs/data-model.md`, plus `data/types.ts` and `data/selectors.ts`), `lib/` (presenter state, store, formatting, url params), `styles/` (`tokens.css`, `globals.css`), `scripts/images/` (manifest, generate, convert), `scripts/design/` (board tooling), `scripts/shots/` (Playwright screenshots), `public/` (`images/`, `real/`, `og/`, icons), `docs/shots/` (page screenshots next to board screenshots).
- npm scripts: `dev`, `build` (static export to `out/`), `lint`, `typecheck`, `shots` (one page screenshot per board row of `docs/route-map.md`, see below), `shots:boards` (renders `design/preview/<Board>.html` with Playwright to `docs/shots/boards/<Board>.png` at the board's own width), `og` (renders `/og/*` to `public/og/*.png`), `images` (generation; `--force`, `--only=<slot>`, `--dry-run`).
- `vercel.json`: `X-Robots-Tag: noindex, nofollow` on every path. `public/robots.txt`: disallow all.

### Showing a section to the client

- `npm run shots` writes one page screenshot per board row of `docs/route-map.md`, named `docs/shots/<Board>.png`, at that board's width (`-M` = 390, `-D` = 1440, boards without a suffix at 1440) and with that row's route and state. `npm run shots:boards` writes the matching board renders to `docs/shots/boards/<Board>.png` at the same width. Both sets are committed, so a reviewer can open the two files side by side.
- "Shown" means the page/board pairs were posted in chat and the differences fixed; there is no Vercel deployment yet. When the client wants a link, deploy `out/` to Vercel (noindex headers already in `vercel.json`).

## Status

Legend: `[ ]` not started · `[~]` in progress · `[x]` done and pushed · `[v]` shown to the client and accepted · `[!]` blocked

Phase 0 · Planning
- [x] Read all 130 boards and the README (2026-10-09); outlines in `docs/boards/`
- [x] Route table and plan: `docs/route-map.md` (pushed, PR #1)
- [x] Client OK: on 2026-10-10 the owner wrote «develop the full prototype do all phases», taken as the OK on the route table and the six decisions
- [x] Research: AI Gateway flux-3-image API → `docs/notes/ai-gateway.md`
- [x] Maps decision received 2026-10-10 (keyless embeds + schematic SVGs, no map library) → folded into `docs/BRIEF.md` and `docs/route-map.md`
- [x] Token names (`docs/tokens.md`) and data model (`docs/data-model.md`) written

Phase 1 · Tokens, shell, shared components
- [x] Next.js app scaffold as above (static export, noindex meta + `vercel.json` header + `robots.txt`, `npm run shots` harness) · `npm run build` exports cleanly
- [x] `styles/tokens.css` with every `--smq-*` token from Tokens.html, names per `docs/tokens.md`; cuts and hexagons as utilities (`app/globals.css` `@theme` + `@utility`); motion tokens; reduced-motion rule
- [x] Fonts: Noto Kufi Arabic variable (self-hosted from `@fontsource-variable`) as the default; Noto Sans on `[dir=ltr]`. Western digits, `tabular-nums` from the root
- [x] Riyal sign component (`components/ui/RiyalSign.tsx`, `Price.tsx`)
- [x] CSS treatments: `img-sold` / `img-desaturated` utilities in `app/globals.css`
- [x] Shared components from Components.html / Components2.html / Components3.html → `components/ui` (31 files), `components/admin` (32, with `AdminShell`), `components/alliance` (26), each with a README listing exports and a styleguide section at `/demo/components`. Built from the sheets (buttons, chips, segmented, tabs, fields with gold error, stepper, badges, price band, rows, accordion, breadcrumb, image slots with the three tiers, toast, compare bar, data table row, field group, switch, drag handle, status pills, file upload, AR/EN tab, save bar, drawer, dialog, door card, district multi-select, hex district cell, FAL badge, ledger bar, stage line, request card, referral receipt, board column)
- [x] Header (72 → 56 scrolled, mobile menu sheet `?menu=1`), footer, `Mark` chip, «صورة تعبيرية» label in `ImageSlot`; `components/map`: `SchematicMap`, `PinPicker`, `MapEmbed` (keyless embed, lazy, schematic placeholder, frame on the container, iframe never clipped)
- [x] `/data` fixtures, exactly the file list in `docs/data-model.md` (`units`, `projects`, `districts`, `offices`, `applications`, `requests`, `referrals`, `marketers`, `approvals`, `leads`, `visitors`, `analytics`, `content`, `settings`, `media` (32 slots), plus `types.ts` and `selectors.ts`); `data/selectors.ts` for every computed number
- [x] In-memory client store (`lib/store.ts`, `smq.store`) + presenter state (`lib/presenter.tsx`, `smq.presenter`, URL parameters override) + client location store (`lib/location.ts`)
- [x] `/demo/components` styleguide for QA (four sections: ui, map, admin, alliance)

Phase 2 · Public explorer
- [ ] `/` home (finder with live count, project card, price guide, services, founder typographic card, FAQ, contact block with keyless embed)
- [ ] `/units` results (URL filters, sort, compare, sold strip, load-more), filters sheet, `?skeleton=1`, empty state with computed loosen suggestions and the alliance bridge, `/alliance/request/sent?req=REQ-2026-0412`
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
- [ ] `/demo` screen map grouped by the `docs/route-map.md` sections (the `design/preview/index.html` numbering) with every state deep-linked; presenter bar (`Shift+P`, `?demo=1`) with all switches of the parameter table in `docs/route-map.md`; `[للتأكيد]` chip toggle (`marks`)
- [ ] Tours: buyer, owner (`/add/sent?no=2026-1042` → `/admin/approvals/2026-1042`), alliance request (overlay with next / previous over real routes)

Phase 8 · Images (script only, never at request time)
- [ ] `scripts/images/manifest.ts` from Shots.html (31 slots: id, aspect ratio, group exterior / interior / editorial / brand, prompt in English prefixed by the shared look «ضوء جدة الصباحي» rendered in English, the palette, and the exclusions)
- [ ] `scripts/images/generate.ts` (AI SDK 7, `bfl/flux-3-image`, `resolution: '2k'`, reference images via `prompt.images`, running cost printed from the catalog price, hard stop at $15, skips slots in `picks.json` unless `--force`)
- [ ] Anchors first: IMG-PRJ-ROWDAH-EXT, IMG-UNIT-APT-3BR-LIVING, IMG-ED-BALAD-RAWASHEEN, IMG-ED-CORNICHE-DAWN, two candidates each on `/demo/contact-sheet`; the client picks in chat; the picks go into the decision log. Raw candidates and every intermediate render go to `scripts/images/out/` (git-ignored, read by the contact sheet in dev); only the picked, converted files are written to `public/images/`
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
| 2026-10-10 | Application ALL-2026-0038 is مكتب م للعقارات on every screen (apply prefill, success, status, admin applications): the boards write مكتب أ, which is already member `office-01`, and approving it would create a duplicate member | Claude, resolves the board collision |
| 2026-10-10 | `District.comingSoon` = the Admin-Lists-D set (أبحر الشمالية، الشاطئ، المحمدية); the Guide's «قريباً» chips are computed as every district without a live guide, so الفيصلية shows قريباً there as on Guide-D | Claude, resolves the board mismatch |
| 2026-10-10 | Foundation built by five parallel agents (fixtures, public UI, admin UI + shell, alliance UI, maps); their board-vs-build notes live in each library's README «Known differences» and in this file's working notes | Claude |
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
- Build agents follow `docs/BUILD-CONTRACTS.md` (ownership table, verification). Briefs for everything not yet built: `docs/briefs/page-groups.md`.
- Lint: the React Compiler rules `set-state-in-effect`, `refs`, `immutability` are warnings (hydration-time state init and pointer refs are deliberate). `npm run build` does not run eslint; run `npm run lint` separately.
- Known foundation gaps noted by the agents: hexagon borders are real clip-path rings (the boards fake them with box-shadow); 10px board captions render at the 11px token minimum; `StageBoard` has no drag-and-drop between columns; the honeycomb fill animation was verified only under reduced motion; `AdminButton`/`AdminField` are admin-sized local equivalents of `Button`/`TextField`; the schematic map's lat/lng fit is approximate (pins by district slug never depend on it).
- Sessions and limits: the cloud session's subagents hit the account usage limit at 02:00 UTC on 2026-10-10 (resets 04:10 UTC); the data agent had finished writing before it stopped.

## Next action

Phase 1 is complete and pushed (`npm run build` exports, `npx tsc --noEmit` and `npm run lint` are clean). Build the page groups from `docs/briefs/page-groups.md` (G1 shell → G2 results → G3 unit/compare → G4 places → G5 forms → G6 alliance/member → G7 admin core → G8 admin content → G9 marketers/alliance room → presenter and tours → images → OG), two to five groups in parallel as subagents, each registering its screens in `lib/screens/<group>.ts`, shooting pages beside the board renders, and reporting gaps. After each group: `npx tsc --noEmit`, `npm run lint`, `npm run build`, commit with the shots, update this file, push.
