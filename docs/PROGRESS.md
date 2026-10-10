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

Legend: `[ ]` not started · `[~]` in progress or partial · `[x]` done and pushed · `[v]` shown to the client and accepted · `[!]` blocked

Snapshot on 2026-10-10: every board is built. `npm run build` exports 266 pages to `out/`; `npm run coverage` finds every one of the 117 page boards registered and every registered route in the export; the smoke QA (`npm run qa`) passes on all 129 screens of the export; `npm run qa:tours` loads all 17 tour steps with the overlay; `npm run qa:flows` passes the buyer, alliance and owner journeys end to end. `npx tsc --noEmit` is clean; `npm run lint` has 0 errors and 7 React Compiler warnings (deliberate, see working notes). Nothing has been shown to the client yet.

Phase 0 · Planning
- [x] Boards read, outlines in `docs/boards/`, route table and plan in `docs/route-map.md`, token names and data model written
- [x] Client OK: on 2026-10-10 the owner wrote «develop the full prototype do all phases», taken as the OK on the route table and the six decisions

Phase 1 · Tokens, shell, shared components
- [x] Next 16 static-export scaffold, `styles/tokens.css` + Tailwind v4 `@theme`, self-hosted Noto Kufi Arabic and Noto Sans, noindex everywhere
- [x] `data/` fixtures and 96 selectors (`data/README.md`); `lib/` location, presenter, store, formatting, URL helpers
- [x] `components/ui`, `components/admin` (with `AdminShell`), `components/alliance`, `components/map` (schematic map, pin picker, keyless embed); each has a README and a section on `/demo/components`

Phase 2 · Public explorer
- [x] `/` home (Claude), `/units` + filters sheet + skeletons + empty state with the alliance bridge, `/alliance/request/sent`, `/units/map`, `/en/units` (G2)
- [x] `/units/[code]` in every state and tier, `/gallery`, `/plan`, `/compare` three / one / empty, `/en/units/[code]` (G3)
- [x] `/guide`, `/projects`, `/projects/[slug]` with the project embed, `/contact` + error + `?offline=1`, `/contact/sent` (G4)

Phase 3 · Remaining public pages
- [x] `/services`, `/about` + `?proof=1`, `/privacy`, 404, `/en` (G1)
- [x] `/add`, `/add/details` (apartment and building), `/add/contact`, `/add/sent` (G5)

Phase 4 · تعاون معنا, alliance, forms
- [x] `/collaborate`, `/marketers`, `/marketers/sent` (G5)
- [x] `/alliance` (+ `?members=0`), `/alliance/apply` three steps, `/sent`, `/status/[id]` (+ `?app=`) (G6)

Phase 5 · Member and marketer pages
- [x] `/member/[token]` ledger, `/requests/[id]` (+ `?mreq=`), `/referrals/[id]`, `/report`; `/m/[token]`; `/r/[name]` (G6)

Phase 6 · Admin
- [x] Login, overview (desktop and phone), approvals with the role checklist, units + Excel import + editor + delete dialog, projects + editor with the pin picker, leads, analytics, visitors (G7)
- [x] Content hub, page editor with live preview, FAQ, partners, testimonials, lists, site settings, SEO, media, needs-confirmation, users (G8)
- [x] Marketers board + detail; alliance room overview, applications, members + member file, radar, requests (creates REF-2026-0117), referrals, report, settings (G9)

Phase 7 · Presenter and tours
- [x] Presenter bar with every switch, `/demo` screen map with all 129 screens and the tours, `/demo/components`, `/demo/contact-sheet`
- [x] Tours: buyer, owner (building variant through to the approval), alliance request (empty state through to the member's ledger); the tour card avoids the admin work area and collapses

Phase 8 · Images
- [x] Scripts: manifest (shared look, palette, exclusions, INLAND rule), generate (references, running cost, $15 stop, fallback), pick, convert (AVIF/WebP + blur), postbuild cleanup
- [~] 12 of 32 slots converted and live: eight editorial shots, the inland project exterior, balcony, smart-home detail, brand hero (real mark composited). **Blocked: the AI Gateway credit ran out at $2.85.** The other 20 slots show the designed placeholder with «صورة تعبيرية» until the account is topped up (commands under Next action)

Phase 9 · Link previews and icons
- [x] `/og/home`, `/og/project/[slug]`, `/og/unit/[code]` rendered to `public/og/*.png` and wired (OG-Home is the site default); favicon and app icons per the Icons board

Phase 10 · Board review round (no images)
- [x] Shared gaps from the build reports closed: header `waText` + `menu` (alliance flow boards: logo + WhatsApp «التحالف», no menu; marketer pages «مسوّق»), menu rows at the board's 67px, desktop skeleton card with the hexagon badge, the hub's large door with the CTA arrow, inline phone district picker + typed search, admin counters and bell shared by every admin page (`components/admin/live.ts`), PageHeader `inlineActions`, CompareToggle `label`, gold breadcrumb links, live home counts, data (`districtsCount` from the fixture, `reservationDays` in settings, SEO variables as on Admin-SEO-D, marketer `lastVisitAt`)
- [~] Independent board-vs-page review per group (`scripts/shots/pair.ts` sheets + `npm run qa:copy`), then fixes per group

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
| 2026-10-10 | Image prompts for project, unit and brand slots carry an INLAND rule: no sea through windows or behind the buildings (Unit-Tier-Gen-M «لا إطلالات حقيقية مزعومة»); editorial shots may show the sea | Claude, after reviewing the first run |
| 2026-10-10 | Provisional image picks by Claude (`scripts/images/picks.json`, reasons in `scripts/images/rejections.md`); the client confirms or swaps them | Claude |
| 2026-10-10 | The brand hero composites the real gold mark in the photo's quiet upper-left quarter (the generated facade carries no readable mark) | Shots board rule |
| 2026-10-10 | Alliance hero: four offices (ج، و، ط، ك) joined this month; launch day marks أبحر الشمالية، المحمدية، الصفا، النعيم «مطلوب» (fixtures follow the boards) | Claude, from Alliance-D and Alliance-Launch-M |
| 2026-10-10 | The owner tour opens the building variant at every step (`?type=building`) and ends on `/admin/approvals/2026-1042` | Claude |
| 2026-10-10 | Header between 1024 and 1439 px: phone icon instead of the number and a tighter nav so nothing overflows; 1440 matches the boards | Claude, from the G4 report |
| 2026-10-10 | Presenter switches are one URL parameter each (`members`, `tier`, `ustatus`, `app`, `mreq`, `wa`, `skeleton`, `marks`, `proof`, `offline`, `empty`, `error`, `tour`+`step`); storage keys `smq.presenter`, `smq.compare`, `smq.ref`, `smq.store` | Claude, table in `docs/route-map.md` |

## Open questions for the client

1. Review the prototype (start at `/demo`; the three tours walk the main journeys) and say what to change.
2. Top up the Vercel AI Gateway (about $3 covers the remaining 20 image slots), or say to keep the placeholders.
3. Confirm or swap the provisional image picks on `/demo/contact-sheet` (reasons in `scripts/images/rejections.md`).
4. Google's own «Embed a map» code for the office (the embed is built from the coordinates until then).
5. Real photos for `/public/real/<slot>.jpg`, if any (the real tier picks them up automatically).
6. Rotate `AI_GATEWAY_API_KEY` after the image phase (it was pasted in chat).

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

- Known differences from the boards, kept on purpose (each page group's full list is in its agent report, summarised here):
  - Numbers computed from the ten real units win over the boards' illustrative ones: the finder count at 700,000 is 6, the empty state for الفيصلية needs four loosenings (+2, +1), YS-A has 5 similar available units (board 4), RZ-A is the lowest per m² among apartments (board «ثاني أقل»), the map shows one project with 6 matches, budget chips 2/5/6/6/8.
  - Alliance and admin numbers follow the fixtures (ledgers, open approvals 4, mean reply 3 س 19 د, radar order by its formula, 33 districts not 30). مكتب ل is suspended, so the directory shows 11 cards.
  - Type sizes snap to the tokens (10px board captions render at 11px; card titles at text-h3), cuts snap to the 60° tokens (boards sometimes draw 52×30 or 40×23), hexagon outlines are real rings (the boards' box-shadow rings only show top and bottom lines).
  - The DistrictMultiSelect opens as a sheet on the phone, the stage boards have no drag between columns, the hub door cards have no arrow slot, alliance pages use the shared header (with the menu button).
  - Changes made in the admin live in the session store: results, unit, member and admin pages follow them; the statically rendered home and project pages keep the fixture counts.
  - There are no owner listings in the fixtures (the ten units are the only real inventory), so the map's owner pin is hidden and `/projects` computes its owner group from the radar fixture.
- QA tooling: `npm run qa` (smoke over every screen; `--base=` to test the export served with `npx serve out -l 3001`), `npm run qa:tours`, `npm run qa:flows`, `npx tsx scripts/qa/errors.ts <url>` (full console and hydration errors of one page), `npm run coverage`.

## Next action

1. Show the client: run `npm run dev` (or `npm run build && npx serve out`), open `/demo`, run the three tours, and collect feedback. Mark accepted sections `[v]` above.
2. Images: once the Vercel AI Gateway is topped up, run `set -a && . ./.env.local && set +a && npm run images -- --anchors` (regenerates the interior anchor IMG-UNIT-APT-3BR-LIVING), pick it with `npx tsx scripts/images/pick.ts --slot=IMG-UNIT-APT-3BR-LIVING --candidate=1`, then `npm run images -- --parallel=3`, pick each slot on `/demo/contact-sheet`, `npm run images:convert`, rebuild and re-shoot (`npm run shots`). Reject anything that shows the sea from a project or unit, people, text, plates or warped architecture.
3. Deploy when the client wants a link: `npm run build`, then deploy `out/` to Vercel (noindex headers are in `vercel.json`).
4. After any change: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run coverage`, `npm run qa -- --base=http://localhost:3001` against `npx serve out -l 3001`, commit with the shots, update this file, push.
