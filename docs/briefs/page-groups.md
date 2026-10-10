# Build briefs · page groups, presenter, images, OG

> Executed on 2026-10-10: every group below is built (see `docs/PROGRESS.md`). Kept as the record of what each group was asked to do, and as the template for re-running a group after a large design change.

These are the briefs the cloud session was about to hand to parallel build agents when the owner asked to stop and continue locally. Run each one as a Claude Code subagent (Agent tool) or as a workflow stage, two to five at a time, or work through them yourself in order. Every brief starts with the preamble below and obeys `docs/BUILD-CONTRACTS.md` (ownership table, verification steps). The foundation they build on: `data/*` (fixtures + `data/selectors.ts`), `components/ui`, `components/admin`, `components/alliance`, `components/map` (each with a README listing its exports), `lib/*`, `lib/screens/<group>.ts` stubs, `scripts/shots/*`.

## Preamble (paste at the top of every brief)

> You are one of several build agents working in parallel in this repository (branch `prototype`). Read `docs/BUILD-CONTRACTS.md` first and obey its ownership table: write only inside your area, never run git commands that change state, never install packages, never edit the foundation files. A shared Next dev server runs at http://localhost:3000 (start it with `npm run dev` if it is not running; do not start a second one on that port). Typecheck with `npx tsc --noEmit` and fix every error in your own files. Read the board outlines in `docs/boards/*.txt`, not the HTML, unless you need an exact SVG path. Copy is verbatim from the boards; numbers are computed from `data/selectors.ts`; `[للتأكيد]` renders through `<Mark>`; money through `<Price>`; images through `<ImageSlot>`. Register one `Screen` per board row you own in `lib/screens/<group>.ts`, render the boards with `npx tsx scripts/shots/boards.ts <Board> …`, shoot your pages with `npx tsx scripts/shots/shots.ts --group=<group>`, compare the PNG pairs with the Read tool and fix the differences (two to three rounds per board). Your final message is a report: routes built, screens registered, known gaps, anything needed from another owner.

Routes, states and parameters for every group are the rows of `docs/route-map.md`; the briefs below only add what the rows do not say.

## G1 · shell pages (`lib/screens/g1-shell.ts`, `app/page.tsx`, `app/services`, `app/about`, `app/privacy`, `app/not-found.tsx`, `app/en/page.tsx`, `components/pages/g1/*`)

Boards: Home-M, Home-D, Header-Scrolled-D, Services-M/D, About-M/D, About-Proof-D, Privacy-M/D, NotFound-M/D, HeaderFooter, EN-Home-M, B-Hero.

- Home: hero + finder (budget stepper 700,000 default with ± steps, district select default الروضة, type الكل); the answer block (count, from-price, ranges) recomputes from `finderAnswer()` as the budget moves, with a live count tick (120 ms) and the «اعرض الوحدات الست» style button text computed by `plural`; project card from `projects` (rwd-01); price guide block from `guideTables()`; services (five hex-numbered doors); founder typographic card (never a photo); FAQ accordion from `content.faq` (drafts carry `[مسودة إجابة]` through `<Mark>`); contact block with `<MapEmbed placeholder="office" lat lng zoom={17} lang="ar">` from `settings.office` and the «افتح الاتجاهات في الخرائط» link; the `Header` with `showEn` only here; `Footer`.
- Header-Scrolled-D is a state of the shared Header (already built): register the screen with `prepare: { scroll: 400 }`.
- About opens in the About-D state; `?proof=1` (presenter `proof`) adds the financing block with placeholder bank names from `content.partners` and the three quotes each tagged «نص تجريبي».
- Services anchors `#buy #sell #invest #consult`; Privacy has a sticky contents list on desktop; NotFound budget chips link to `/units?max=…` computed from `content.lists.budgets`.
- `/en`: LTR, `font-latin`, cuts mirrored by the `[dir=ltr]` variables, copy from EN-Home-M, `<EnHtmlAttrs />`, Header variant `en`, EN switch visible.

## G2 · results (`lib/screens/g2-results.ts`, `app/units/page.tsx`, `app/units/map/page.tsx`, `app/alliance/request/sent/page.tsx`, `app/en/units/page.tsx`, `components/pages/g2/*`)

Boards: Results-M/D, Results-Filters-M, Results-Loading-D, State-Loading-M, State-Empty-M/D, State-Empty-Success-M, State-Cards, Results-Map-M/D, EN-Card-M, A-Card/B-Card (reference).

- Filters, sort and compare live in the URL (`parseFilters` / `unitsUrl` from `lib/url.ts`, `useQuery` + `setQuery`). Results from `filterUnits()` + `sortUnits()` with store overrides; sold units in the «مباعة، للمرجع فقط» strip; load-more; phone filter bottom sheet at `?sheet=filters`, desktop left column.
- `?skeleton=1` (presenter `skeleton`) shows the skeleton cards; also show them for ~400 ms on every filter change.
- Empty state: headline constraint and the loosen-one suggestions with computed `+n` from `emptyStateSuggestions()`; the alliance bridge form (district, budget, beds, phone, consent tick) validates and goes to `/alliance/request/sent?req=<next REQ number>` where the success screen echoes the request (store `addRequest`).
- Map view `/units/map` keeps the same query: `<SchematicMap>` with pins from `pinCounts()`; tapped pin → `BottomSheet` on phone, side card on desktop; `&pin=rwd-01` preselects; zoom buttons; the provider note is gone.
- `/en/units`: the English card from EN-Card-M, same data.

## G3 · unit and compare (`lib/screens/g3-unit.ts`, `app/units/[code]/page.tsx`, `/gallery`, `/plan`, `app/compare/page.tsx`, `app/en/units/[code]/page.tsx`, `components/pages/g3/*`)

Boards: Unit-M/D, Unit-Reserved-M, Unit-Sold-M, Unit-Roof-M, Unit-Gallery-M/D, Unit-Plan-M, Unit-Tier-Real-M, Unit-Tier-Gen-M, Unit-Tier-Typo-M, Compare-M/D, Compare-One-M, Compare-Empty-M, EN-Unit-M.

- `generateStaticParams` over the ten slugs; `dynamicParams = false`. Status = `effectiveUnitStatus(unit, overrides)` then the presenter `ustatus` switch on top (fixtures stay 8/2/0). Price band, per-m², «قياساً بالحي» and «قياساً بالمشروع» lines, similar available units (`similarAvailable`), the other roof (`otherRoof`), «قارن الروفين» → `/compare?u=rz-rf,ys-rf`.
- Image tier: presenter `tier` (`gen` default) → `<ImageSlot tier>`; the real tier uses `/public/real/<slot>.jpg` when the file exists (check at build time with `fs.existsSync` in the server component) else the neutral frame.
- Gallery `/units/[code]/gallery?i=3`: full screen, keyboard arrows, Esc, swipe, desktop tabs «الصور · المخطط · جولة 360 [للتأكيد]».
- Plan `/units/[code]/plan`: schematic SVG plan marked illustrative (draw it from Unit-Plan-M: rooms as rectangles with labels; tap a room shows its area; with/without dimensions toggle; roof villas get two tabs). Never a real floor plan.
- Compare: `?u=` list (store `compare` + `smq.compare` 7 days), best-in-row gold marker computed per row, one-unit and empty states.

## G4 · places (`lib/screens/g4-places.ts`, `app/guide`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/contact/page.tsx`, `app/contact/sent/page.tsx`, `components/pages/g4/*`)

Boards: Guide-M/D, Project-M/D, Projects-M/D, Contact-M/D, Contact-Success-M, Contact-Error-M.

- Guide: الروضة live from `guideTables()`; other districts «قريباً» chips (every district without a live guide); all numbers computed; the «الأرقام من الوحدات المتاحة» notes stay.
- Project: `generateStaticParams` over published slugs; buildings and per-building counts from `projectBuildingCounts()`; milestones with `[للتأكيد]`; location block = `<MapEmbed placeholder="project">` centred on the الروضة centre with «الموقع تقريبي [للتأكيد]» beside it; the directions link.
- Projects: published, auto-group, draft «قريباً»; «نبّهني» form validates and confirms inline.
- Contact: office `<MapEmbed placeholder="office">` at street level (zoom 17), hours, phone, WhatsApp; form validates (gold errors, summary takes focus, text never lost); valid submit → `/contact/sent` echoing the message with the reply-time line from `replyTimeLine(now)`; `?offline=1` adds the connection-lost banner.

## G5 · forms (`lib/screens/g5-forms.ts`, `app/add/*`, `app/marketers/*`, `app/collaborate/page.tsx`, `components/pages/g5/*`)

Boards: Add-M, Add-D, Add-Step1-M, Add-Step2-M, Add-Step2-D, Add-Step2-Building-M, Add-Step3-D, Add-Success-M/D, Marketer-M/D, Hub-M/D.

- `/add` step 1 (type, purpose, city, district, landmark, `<PinPicker>` with «ألصق رابطاً», relation; phone shows hero + «كيف يسير الأمر» + the form), `/add/details` step 2 (apartment/villa variant; `?type=building` or step-1 type عمارة → the building variant with land/build area, floors, units, income block and `ownerFormComputed()` per-m² and yield), `/add/contact` step 3 (photos with local previews, role with the role-dependent attachment, contact, timing, consent; the designed phone error on invalid submit), `/add/sent?no=2026-1043` (apartment) / `?no=2026-1042` (building) with copy-to-clipboard and the prefilled WhatsApp link. Step state lives in the store (`patch('add', 'draft', …)`) so a reload keeps it.
- `/marketers` form with the `[للتأكيد]` chip on the fields note → `/marketers/sent` (Add-Success pattern, no board).
- `/collaborate` hub: three `DoorCard`s.

## G6 · alliance and member pages (`lib/screens/g6-alliance.ts`, `app/alliance/*`, `app/member/[token]/*`, `app/m/[token]/page.tsx`, `app/r/[name]/page.tsx`, `components/pages/g6/*`)

Boards: Alliance-M/D, Alliance-Launch-M, AllianceApply-Step1-M, AllianceApply-Step2-M/D, AllianceApply-Step3-M, AllianceApply-Success-M, AllianceApply-Status-M, MarketerPage-M, Member-Request-M, Member-Request-States-M, Member-Referral-M, Member-Ledger-M, Member-Report-M/D.

- `/alliance`: 12 members (`?members=0` → launch day: empty directory, «مطلوب» cells, the 37 Google-form note); `Honeycomb` fills on load; coverage grid and directory from `coverageByDistrict()` / `directory()`.
- Apply: three steps (`/alliance/apply`, `/coverage`, `/offers`) with `PinPicker`, `DistrictMultiSelect`, radar preview, counters, consents (charter required) → `/alliance/apply/sent` (ALL-2026-0038, مكتب م) → `/alliance/status/ALL-2026-0038` with `?app=verified|rejected`; `generateStaticParams` over the application ids.
- Member pages (390 only → `PhoneColumn`): `/member/[token]` ledger (`LedgerBar`, `ledgerNet`), `/requests/[id]` open with the offer form (submit → store `addOffer` → answered state), `?mreq=answered|expired`, `/referrals/[id]` (`ReferralReceipt`, `protectionDaysLeft`), `/report` responsive. Tokens are `office-01…12`; the tour uses `office-09` (مكتب ط) with REQ-2026-0412 / REF-2026-0117.
- `/m/[token]` marketer page (QR drawn as an SVG placeholder grid, copy link, three numbers); `/r/[name]` stores `smq.ref` (30 days) and `router.replace('/')`.

## G7 · admin core (`lib/screens/g7-admin.ts`, `app/admin/login`, `app/admin/page.tsx`, `app/admin/approvals/[id]`, `app/admin/units/*`, `app/admin/projects/*`, `app/admin/leads`, `app/admin/analytics`, `app/admin/visitors`, `components/pages/g7/*`)

Boards: Admin-Login-M/D, Admin-M, Admin-Overview-D, Admin-Approvals-D, Admin-Inventory-D, Admin-UnitEditor-D, Admin-Projects-D, Admin-ProjectEditor-D, Admin-Leads-D, Admin-Leads-M, Admin-Analytics-D, Admin-Visitors-D.

- Login accepts anything non-empty; `?error=1` or empty submit shows the designed error. No session: every admin route is reachable directly.
- `AdminShell` with the fixture notifications; the phone tab row on `/admin` at 390.
- Approvals: `/admin/approvals/[id]` (`generateStaticParams` over the four ids; `/admin/approvals` redirects to the newest); role tabs switch the checklist; «اعتماد ونشر» enables when complete → store `setApproval('approved')`, toast, log entry in the mode the presenter `wa` switch selects.
- Units: inline status select (store), bulk actions, `?import=1` opens the Excel mapping + preview panel with the canned diff (RZ-B, RZ-C → 499,000 sample, RZ-E new, row 12 warning); `?empty=1` empty state. Unit editor `/admin/units/[code]` and `/new`: Excel vs admin-only field styling, status with dates, hide switch, change history, delete dialog typing the code.
- Projects list and editor (`/admin/projects/[id]`, `/new`): save bar dirty → saving → «نُشر للتو»; pin field = `PinPicker` with coordinate fields.
- Leads: `?lead=SMQ-8F3A2` opens the drawer (phone: bottom sheet); «علّم كمردود» changes status in the store; close asks for a reason. Analytics with the period toggle. Visitors: `?v=v-8f3a2` opens the drawer.

## G8 · admin content (`lib/screens/g8-content.ts`, `app/admin/content/*`, `app/admin/users`, `components/pages/g8/*`)

Boards: Admin-Content-D, Admin-PageEditor-D, Admin-FAQ-D, Admin-Partners-D, Admin-Testimonials-D, Admin-Lists-D, Admin-SiteSettings-D, Admin-SEO-D, Admin-Media-D, Admin-Users-D, Admin-Pieces.

- Content hub chips (published / draft / needs-confirmation); «11 عنصراً بانتظار التأكيد» → `/admin/content/needs-confirmation` listing `content.needsConfirmation`.
- Page editor `/admin/content/pages/home`: AR/EN tabs, `PreviewFrame` 390/1440 updating as you type (render the real Home hero component inside), save bar unsaved → «نُشر للتو» for 6 s.
- FAQ `?edit=faq-05`: drag order (`DragHandle`, pointer sort), publish toggle disabled while `[مسودة إجابة]`. Partners: visibility toggles drive the About block preview. Testimonials: 3+ rule meter, «سجّل الموافقة» enables publish. Lists: districts (قريباً flags), cities, unit types, budgets, rejection reasons. Site settings: office `PinPicker` + coordinates, WhatsApp templates, switches. SEO counters and OG previews (`/og/*` PNGs). Media: 32 slots, generated = تعبيرية, founder slot empty (upload only). Users: WhatsApp Business «متصل», `?wa=manual` → «غير متصل · وضع يدوي».
- Admin-Pieces: bell dropdown, needs-confirmation list, delete dialog, empty states, toasts after every action.

## G9 · marketers and the alliance room (`lib/screens/g9-room.ts`, `app/admin/marketers/*`, `app/admin/alliance/*`, `components/pages/g9/*`)

Boards: Admin-Marketers-D, Admin-MarketerDetail-D, Admin-Alliance-D, Admin-Alliance-M, Admin-AllianceApplications-D, Admin-AllianceMembers-D, Admin-AllianceMember-D, Admin-AllianceRadar-D, Admin-AllianceRequests-D, Admin-AllianceReferrals-D, Admin-AllianceReport-D, Admin-AllianceSettings-D.

- Marketers stage board (`StageBoard`); «أنشئ الرابط وفعّل» moves the card (store `setMarketer`); detail `/admin/marketers/[id]`.
- Alliance overview D/M; applications `?id=ALL-2026-0038` (مكتب م) with the licence check → «اعتمد كعضو موثّق» (store `setApplication`), Google-forms import banner; members with ledger cells (مكتب ل suspended) and `/members/[id]` («صفحة العضو كما يراها» → `/member/[id]`); radar `?district=obhur-north` (`RadarGrid` from `radarRanking()`, drawer, «أرسل للمكاتب» creates a request in the store); requests `?req=REQ-2026-0412` stage board + detail, select مكتب ط's offer → «أنشئ سجل إحالة» creates REF-2026-0117 in the store and opens the referrals tab; manual-mode «أرسل على واتساب» opens the designed state without sending; referrals with the dispute panel on REF-2026-0098 and the stage update form; report draft October preview («انشر وأرسل» → toast; «افتح كما يراه العضو» → `/member/office-01/report`); settings (charter, defaults, routing weights with the sum check, option lists, forms table).

## Presenter and tours (`lib/screens/presenter.ts`, `components/presenter/*`, `app/demo/*`)

Boards: none (the README's presenter spec). Build `PresenterBar` (bottom bar when `demo` is on: every switch of the parameter table in `docs/route-map.md` as segmented controls writing through `usePresenter().set`, a reset for `smq.store`/`smq.presenter`, links to `/demo` and `/demo/components`), `/demo` (group the screens by section with the deep links; a card per tour), `/demo/contact-sheet` (reads `public/images/_candidates/*/` at build time with `fs` and shows the two candidates per slot with the slot title from `data/media`), and `TourOverlay` for the three tours of `docs/route-map.md` «Tour steps»: an overlay with the step text, next/previous, that navigates the real routes with `?tour=<id>&step=<n>` and highlights the element the step talks about.

## Images (Phase 8) · `scripts/images/*`

Needs `AI_GATEWAY_API_KEY` in `.env.local` (ask the client). Run with the key exported: `set -a && . ./.env.local && set +a`. 1) `npm run images -- --anchors` (4 slots × 2 candidates ≈ $0.40 at 2048 class). 2) Open `/demo/contact-sheet` or the PNGs and pick: `npx tsx scripts/images/pick.ts --slot=IMG-PRJ-ROWDAH-EXT --candidate=1 --note="…"` for the four anchors (the client approves them in chat; record the picks in the PROGRESS decision log). 3) `npm run images` for the rest (references attached automatically; ≈ $2.70). 4) Reject anything with people, text, signage, plates, a non-Jeddah skyline or warped architecture in `scripts/images/rejections.md` and regenerate with `--only=<slot> --force`. 5) Pick every slot, then `npm run images:convert` → AVIF/WebP + `public/images/manifest.json`. 6) Wire `<ImageSlot>` to the manifest (`components/ui/ImageSlot.tsx`: use `/images/<slot>/<slot>-{640,1280,2048}.{avif,webp}` with `<picture>`, the blur placeholder, the «صورة تعبيرية» label; CSS `img-sold`/`img-desaturated` for the treatments). Hard stop at $15 (`scripts/images/out/cost.json`). IMG-HERO-BRAND gets the logo reference automatically; if the mark is distorted, composite the real `design/brand/logo-mark-gold.png` over the quiet corner in CSS.

## OG and icons (Phase 9)

Routes `app/og/home`, `app/og/project/[slug]`, `app/og/unit/[code]` rendered at 1200×630 from the OG-Home / OG-Project / OG-Unit boards (no header, no presenter), then `npm run og` → `public/og/*.png`, wired into `metadata.openGraph.images` of `/`, `/projects/[slug]`, `/units/[code]`. Icons are already built (`npm run icons`).

## Verification round (after each phase)

For every group: `npx tsx scripts/shots/boards.ts <boards>` and `npx tsx scripts/shots/shots.ts --group=<group>`, then a critic pass (one agent per group, fresh context) that opens each `docs/shots/<Board>.png` beside `docs/shots/boards/<Board>.png` and lists concrete differences (layout, copy, order, shape, colour, state, missing elements) with the file and the fix; the group owner applies them. Then `npm run build` must export cleanly (`out/`), `npm run lint` and `npx tsc --noEmit` clean, commit with the shots, update `docs/PROGRESS.md`, push.
