# PROGRESS · SMQ prototype tracking file

Single source of truth for where the build stands, so that work can continue from any Claude Code session (cloud or local) without the original conversation. Update it in the same commit as the work it describes.

## How to resume (local Claude Code)

1. `git clone https://github.com/Brave-WebServices/smq-realestate && cd smq-realestate && git checkout prototype`
2. Read in this order: `CLAUDE.md` → `docs/BRIEF.md` (the spec, verbatim, plus amendments) → `docs/route-map.md` (every board → route + state, and the plan) → this file (status, decisions, next action) → `design/README.md`.
3. `cp .env.example .env.local` and set `AI_GATEWAY_API_KEY` (the client has it; it was pasted in the original brief and is never committed). Only `scripts/images` needs it.
4. `npm install && npm run dev` (once the app exists; see Status). Screenshots: Playwright with the Chromium it installs.
5. Continue from **Next action** below. Commit and push every change to `prototype` (PR #1). Update this file in the same commit.

## Status

Legend: `[ ]` not started · `[~]` in progress · `[x]` done and shown to the client · `[!]` blocked

Phase 0 · Planning
- [x] Read all 130 boards and the README (2026-10-09)
- [x] Route table and plan: `docs/route-map.md` (pushed, PR #1)
- [!] **Client OK on the route table and the six decisions** listed at the end of `docs/route-map.md`. Nothing is built until this arrives.
- [x] Research: AI Gateway flux-3-image API → `docs/notes/ai-gateway.md`
- [x] Maps decision received 2026-10-10 (keyless embeds + schematic SVGs, no map library) → folded into `docs/BRIEF.md` and `docs/route-map.md`

Phase 1 · Tokens, shell, shared components
- [ ] Next.js app scaffold (App Router, TypeScript, Tailwind, static export, noindex header + robots)
- [ ] `styles/tokens.css` with every `--smq-*` token from Tokens.html; cuts and hexagons as utilities; motion tokens; reduced-motion
- [ ] Fonts: Noto Kufi Arabic (400/600/700/800), Noto Sans for `/en`
- [ ] Riyal sign component (inline SVG, 0.75em, currentColor, 0.25em gap)
- [ ] Shared components from Components.html / Components2.html / Components3.html (buttons, chips, segmented, tabs, fields with gold error, stepper, badges, price band, rows, accordion, breadcrumb, image slots with the three tiers, toast, compare bar, data table row, field group, switch, drag handle, status pills, file upload, AR/EN tab, save bar, drawer, dialog, door card, district multi-select, hex district cell, FAL badge, ledger bar, stage line, request card, referral receipt, board column)
- [ ] Header (72 → 56 scrolled, mobile menu sheet), footer, `[للتأكيد]` chip, «صورة تعبيرية» label
- [ ] `/data` fixtures: units (the ten real rows), projects, districts, offices, applications, requests, referrals, marketers, leads, visitors, analytics, content, media, settings; selectors for every computed number
- [ ] In-memory client store (status changes, approvals, created referrals, toasts) + presenter state (localStorage, URL override)
- [ ] `/demo/components` styleguide for QA

Phase 2 · Public explorer
- [ ] `/` home (finder with live count, project card, price guide, services, founder typographic card, FAQ, contact block with keyless embed)
- [ ] `/units` results (URL filters, sort, compare, sold strip, load-more), filters sheet, loading skeletons, empty state with computed loosen suggestions and the alliance bridge, `/alliance/request/sent`
- [ ] `/units/map` interactive schematic SVG map (pins with computed counts, sheet / side card, zoom buttons)
- [ ] `/guide`
- [ ] `/projects`, `/projects/garden-rawdah` (keyless embed at الروضة centre + «الموقع تقريبي [للتأكيد]»)
- [ ] `/units/[code]` (available / reserved via presenter / sold / roof), `/gallery`, `/plan` (schematic SVG plan), three image tiers
- [ ] `/compare` (3 / one / empty)
- [ ] Screenshots at 390 and 1440 against the boards, fixes, shown to the client

Phase 3 · Remaining public pages
- [ ] `/services`, `/add` (three steps, building variant, success), `/about` (+ proof via presenter), `/contact` (+ sent, error, offline banner; keyless office embed at street level), `/privacy`, 404, `/en`, `/en/units`, `/en/units/[code]`
- [ ] Screenshots, fixes, shown

Phase 4 · تعاون معنا, alliance, forms
- [ ] `/collaborate`, `/alliance` (12 members; launch day via presenter; honeycomb fill animation), `/alliance/apply` (3 steps, sent, status × 3), `/marketers` (+ sent)
- [ ] Screenshots, fixes, shown

Phase 5 · Member and marketer pages (390 only, phone column on desktop)
- [ ] `/member/[token]` ledger, `/requests/[id]` (open / answered / expired), `/referrals/[id]`, `/report`; `/m/[token]`; `/r/[name]` redirect with attribution
- [ ] Screenshots, fixes, shown

Phase 6 · Admin
- [ ] Shell (sidebar, phone tabs, bell dropdown, toasts), `/admin/login`
- [ ] Overview, approvals (role checklist, approve in memory), units + Excel import panel, unit editor (delete dialog), projects + project editor (SVG pin picker), leads (drawer / sheet, manual status), analytics, visitors (drawer)
- [ ] Content hub, page editor with live preview, FAQ, partners, testimonials, lists, site settings (SVG pin picker), SEO, media (generated = تعبيرية), needs-confirmation list, users (WhatsApp connected / manual via presenter)
- [ ] Marketers + detail; alliance room: overview (+ phone), applications, members + member, radar with district drawer, requests (pick offer → create REF in memory), referrals (dispute, stage update), report, settings
- [ ] Screenshots, fixes, shown

Phase 7 · Presenter and tours
- [ ] `/demo` screen map by README section with every state deep-linked; presenter bar (`Shift+P`, `?demo=1`) with all switches; `[للتأكيد]` chip toggle
- [ ] Tours: buyer, owner, alliance request (overlay with next / previous over real routes)

Phase 8 · Images
- [ ] `scripts/images/manifest.ts` from Shots.html (31 slots) + shared look / palette / exclusions
- [ ] `scripts/images/generate.ts` (AI SDK 7, `bfl/flux-3-image`, `resolution: '2k'`, reference images via `prompt.images`, running cost from catalog prices, stop at $15, `--force`, rejection notes, contact sheet page)
- [ ] Four anchors shown and approved → rest of groups with references → two candidates per slot → picks recorded (model, prompt, seed) → AVIF/WebP + blur placeholders
- [ ] IMG-HERO-BRAND with the logo reference; composite the real mark if distorted

Phase 9 · Link previews and icons
- [ ] `/og/*` routes screenshotted to `/public/og/*.png` with Playwright; metadata wired
- [ ] favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png, icon-512-maskable.png

## Decision log

| Date | Decision | Source |
|---|---|---|
| 2026-10-09 | Route table and plan written; six decisions proposed (hub `/collaborate`, `/r/[name]` redirect + `/m/[token]`, `/member/office-NN` tokens with مكتب ط in the tour, generated tier as public default, marketer success on the Add-Success pattern, add steps `/add`, `/add/details`, `/add/contact`, `/add/sent`) | `docs/route-map.md`, awaiting client OK |
| 2026-10-10 | Maps: no map library, no Maps key. Office/project = keyless Google Maps embed iframes (hl=ar / hl=en), lazy, schematic placeholder + fallback. Results map and pin pickers = interactive schematic SVG. Coverage grid and radar stay hexagon grids | Client, final |
| 2026-10-10 | Push every change as it lands; PR #1 tracks `prototype` | Client |
| 2026-10-10 | REQ-2026-0412 / REF-2026-0117 use مكتب ط throughout (fixes the board inconsistency) | Brief |
| 2026-10-10 | AI Gateway: `generateImage` with `bfl/flux-3-image`, `providerOptions.blackForestLabs.resolution: '2k'`, references in `prompt.images`; fallback `google/gemini-nano-banana-2.1` via `generateText` + `result.files` | `docs/notes/ai-gateway.md` |

## Open questions for the client

1. OK on the route table and the six decisions in `docs/route-map.md`? (blocking)
2. Google's own "Embed a map" code for the office (to replace the coordinate-built embed URL) — later.
3. Real photos for `/public/real`, if any — later.
4. Anchor image approval, then candidate picks — at Phase 8.

## Working notes

- Real data = only the ten units in `design/README.md`. Every count / range / per-m² / yield / ranking is computed from `/data`; never type a number from a board.
- The `[للتأكيد]` and `[مسودة إجابة]` markers render as a gold-outlined chip; the presenter can hide them.
- Office names stay placeholders (مكتب أ … مكتب ل). All admin, alliance, analytics numbers are illustrative; keep the «الأرقام توضيحية» notes.
- WhatsApp: `https://wa.me/966559997929?text=…` with the designed prefilled messages and a visitor reference code `SMQ-XXXXX`.
- The results-map provider note on the boards is dropped; everything else on the boards is copied verbatim, annotations excluded.
- Scratch tooling used so far: `design/preview/*.html` were converted to outline text for reading (not committed).

## Next action

Wait for the client's OK on `docs/route-map.md`. Then start Phase 1 (scaffold, tokens, shared components, fixtures), push, and continue with Phase 2.
