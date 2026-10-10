# SMQ prototype · route map and plan

Every board in `design/preview` mapped to a route and a state. M = 390, D = 1440: two points of one responsive layout unless marked "390 only" (then a centred phone-width column on desktop).

Conventions
- Arabic RTL is the default. EN exists only at `/en`, `/en/units`, `/en/units/[code]`; the EN switch is hidden elsewhere.
- Presenter states are one URL parameter per switch (table in «Presenter layer» below). The presenter bar (`Shift+P` outside inputs, or `?demo=1`) sets the same switches and persists them in localStorage under `smq.presenter`; a URL parameter always overrides the stored value, so the screen map at `/demo` deep-links every state.
- `[للتأكيد]` and `[مسودة إجابة]` render as a small gold-outlined chip; the presenter can hide them.
- Nothing is sent anywhere. Forms validate, step forward, and land on the designed success screen. Status changes live in memory.

## 0 · Options (references, not screens)

| Board | Built as |
|---|---|
| A-Hero, A-Card | Not built (rejected direction) |
| B-Hero, B-Card | The Home hero/finder block and the result card component, used on `/` and `/units` |

## 1–12 · Public site, round 1

| Board | Route | State / how it is reached |
|---|---|---|
| Home-M, Home-D | `/` | Default. Finder defaults: 700,000 · الروضة · الكل. The answer block (count, from-price, ranges) recomputes from fixtures as the budget moves |
| Header-Scrolled-D | `/` (and every public page) | After 120px of scroll: 56px header, the same lockup (the client asked that the logo never change on scroll), phone becomes an icon, 2px gold rule |
| Results-M, Results-D | `/units?district=rawdah&max=700000&type=apt` | Filters, sort and compare selection live in the URL (`district, min, max, type, beds, amin, amax, pstatus, delivery, feat, sort`; values in `docs/data-model.md`). Sold units shown in the «مباعة، للمرجع فقط» strip |
| Results-Filters-M | `/units?…&sheet=filters` | Phone bottom sheet; desktop shows the same form in the left column |
| Guide-M, Guide-D | `/guide` | Only الروضة is live; the other districts are «قريباً» chips. All numbers computed |
| Project-M, Project-D | `/projects/garden-rawdah` | Location block: keyless Google Maps embed (iframe, `hl=ar`, street level) centred on حي الروضة, «الموقع تقريبي [للتأكيد]» beside it, lazy-loaded with the board's schematic drawing as placeholder and fallback. The frame (zero radius, 1.5px ink border, cut corner, label chip) is drawn on the container, never clipped onto the iframe, so Google's logo and controls stay fully visible |
| Unit-M, Unit-D | `/units/rz-a` (any of the ten codes) | Status, price, per-m², "قياساً بالحي" line computed |
| Compare-M, Compare-D | `/compare?u=rz-d,ys-d,rz-c` | Best-in-row gold marker computed. Selection also kept on the device 7 days |
| State-Loading-M, Results-Loading-D | `/units?skeleton=1` | Presenter switch «loading skeletons»; also shown briefly on filter changes |
| State-Empty-M, State-Empty-D | `/units?district=faisaliyah&max=450000&beds=4&type=apt&feat=driver` | Zero results computed. The "القيد الذي يحذف أكثر النتائج" line and the loosen-one-constraint suggestions with their `+n` are computed from the fixtures (see plan). Alliance bridge form with consent tick |
| State-Cards | `/units` at 390 (the full sold card in the «مباعة، للمرجع فقط» strip; desktop uses Results-D's compact sold rows). The reserved card state is the shared `UnitCard` (`/demo/components`); `/units/ys-d?ustatus=reserved` is the reserved unit page | Card states |
| Services-M, Services-D | `/services` (`#buy #sell #invest #consult`) | Default |
| Add-M (phone, step 3), Add-D (desktop, step 1) | `/add` (step 1), `/add/contact` (step 3) | See section 23 |
| About-M, About-D | `/about` | Opens in the About-D state (no financing or testimonial blocks) |
| Contact-M, Contact-D | `/contact` | Office map: keyless Google Maps embed (iframe, `hl=ar`) at street level from 21.5604526, 39.1811231, framed in the design's map container (zero radius, 1.5px ink border, cut corner drawn on the container, label chip outside the iframe; the iframe itself is never clipped, Google's logo and controls never covered); lazy-loaded with the schematic drawing as placeholder and fallback; «افتح الاتجاهات في الخرائط» is a plain Google Maps link. Same embed in the Home contact block. The owner will paste Google's own «Embed a map» code later; until then the URL is built from the coordinates |
| NotFound-M, NotFound-D | Any unknown URL, e.g. `/this-page-does-not-exist` | Budget chips link to `/units?max=…` |
| HeaderFooter | Components on every public page | Mobile menu: `?menu=1` |

## 13–15 · Sheets (references)

| Board | Built as |
|---|---|
| Tokens | `styles/tokens.css` (`--smq-*`) and the Tailwind v4 `@theme` block in `styles/globals.css` (no `tailwind.config`); names in `docs/tokens.md` |
| Components | Shared components; a QA styleguide at `/demo/components` |
| Shots | `scripts/images/manifest.ts` (31 slots) |

## 16–22 · Admin

| Board | Route | State / how it is reached |
|---|---|---|
| Admin-Login-M, Admin-Login-D | `/admin/login` | Accepts anything non-empty. The designed error state: `/admin/login?error=1` or submitting empty fields |
| Admin-M | `/admin` at 390 | Tabs: نظرة عامة · الموافقات · الواردة (→ `/admin/leads`) · الوحدات · البحث · الزوار · التحالف (→ `/admin/alliance`) |
| Admin-Overview-D | `/admin` at 1440 | Default |
| Admin-Approvals-D | `/admin/approvals/2026-1042` (`/admin/approvals` opens the newest) | Role tabs مالك/وكيل/مسوّق switch the checklist; «اعتماد ونشر» enables when the checklist is complete, then creates the unit in memory with a toast. Both sending modes in the log (WhatsApp Business connected vs manual) |
| Admin-Inventory-D | `/admin/units` | Inline status select, bulk actions, «استيراد من Excel» opens the mapping + preview panel (`?import=1`) with the canned diff (RZ-B, RZ-C, RZ-E, row 12 warning) |
| Admin-Analytics-D | `/admin/analytics` | Illustrative numbers, period toggle |
| Admin-Visitors-D | `/admin/visitors?v=v-8f3a2` | Row click opens the visitor drawer |
| Admin-Projects-D | `/admin/projects` | Published, auto-group, draft |
| Admin-ProjectEditor-D | `/admin/projects/rwd-01` (`/admin/projects/abh-01` draft, `/admin/projects/new`) | Save bar: dirty → saving → just published. Pin field is the schematic SVG picker with a draggable pin and coordinate fields |
| Admin-UnitEditor-D | `/admin/units/rz-a` (`/admin/units/new`) | Excel vs admin-only field styling, status with dates, hide switch, change history, delete dialog (type the code) |
| Admin-Leads-D | `/admin/leads?lead=SMQ-8F3A2` | Row opens the drawer; «علّم كمردود» changes status in memory; close asks for a reason |
| Admin-Leads-M | `/admin/leads` at 390 | Details as a bottom sheet |
| Admin-Content-D | `/admin/content` | Hub with published / draft / needs-confirmation chips; «11 عنصراً بانتظار التأكيد» → `/admin/content/needs-confirmation` |
| Admin-PageEditor-D | `/admin/content/pages/home` | AR/EN tabs, live preview (390/1440) updates as you type, save bar unsaved → just published (6 s) |
| Admin-FAQ-D | `/admin/content/faq?edit=faq-05` | Drag order, publish toggle disabled while `[مسودة إجابة]` |
| Admin-Partners-D | `/admin/content/partners` | Visibility toggles drive the About block preview |
| Admin-Testimonials-D | `/admin/content/testimonials` | 3+ rule meter; "سجّل الموافقة" enables publish |
| Admin-Lists-D | `/admin/content/lists` | Districts (قريباً flags), cities, unit types, budgets, rejection reasons |
| Admin-SiteSettings-D | `/admin/content/site-settings` | Office pin is the schematic SVG picker with coordinate fields; WhatsApp templates; global switches |
| Admin-SEO-D | `/admin/content/seo` | Counters, OG previews |
| Admin-Media-D | `/admin/content/media` | 32 slots; every generated image listed as تعبيرية; founder slot empty (upload only) |
| Admin-Users-D | `/admin/users` | WhatsApp Business «متصل» by default; `?wa=manual` (presenter switch) → «غير متصل · وضع يدوي» (also changes the approvals/requests send buttons) |
| Admin-Pieces-D | Bell on every admin page (notifications), `/admin/content/needs-confirmation` (confirm list), delete dialog from the unit editor, empty states (`/admin/units?empty=1`, `/admin/leads?empty=1`), toasts after every action | Pieces |
| Components2 | Admin components | `/demo/components` |

## 23–29 · Public, round 2

| Board | Route | State / how it is reached |
|---|---|---|
| Add-Step1-M, Add-D | `/add` | Step 1: type, purpose, city, district, landmark, schematic SVG pin picker with a draggable hexagon pin, relation. Phone shows hero + «كيف يسير الأمر» + the form; desktop as Add-D |
| Add-Step2-M | `/add/details` | Step 2, apartment/villa variant (rooms, baths, area, floor, age, occupancy, features, asked price with computed per-m² and district range bar). No desktop board exists for this variant: at 1440 it uses the Add-Step2-D layout with the apartment fields |
| Add-Step2-Building-M, Add-Step2-D | `/add/details` when the step-1 type is «عمارة سكنية» or «عمارة تجارية» (`?type=building` deep link) | Building variant at both widths: land/build area, floors, units, income block, computed per-m² on build and land and gross yield |
| Add-M (form part), Add-Step3-D | `/add/contact` | Step 3: photos (local previews), role with role-dependent attachment (وكيل → power of attorney), contact details, timing, consent. The designed phone error (incomplete number) appears on invalid submit |
| Add-Success-M, Add-Success-D | `/add/sent?no=2026-1043` (apartment) · `/add/sent?no=2026-1042` (building, the number the owner tour then opens in admin) | Copy to clipboard works; WhatsApp link prefilled with the request number |
| Results-Map-M, Results-Map-D | `/units/map?…same query` (`&pin=rwd-01` selects) | Interactive schematic SVG exactly as drawn: district labels, hexagon pins with computed counts (gold = available, white ring = «من مالك» / «قريباً»); tapped pin → bottom sheet (phone) / side card (desktop); square zoom buttons scale the SVG; the board's provider note is removed |
| Projects-M, Projects-D | `/projects` | «نبّهني» form validates and shows an inline confirmation |
| Results-Loading-D | `/units?skeleton=1` at 1440 | Presenter |
| Unit-Reserved-M | `/units/ys-d?ustatus=reserved` | Presenter «unit status» switch (`ustatus=available|reserved|sold`); the fixtures stay 8 / 2 / 0 |
| Unit-Sold-M | `/units/ys-a` (and `/units/ys-c`) | Real sold units |
| Unit-Roof-M | `/units/rz-rf` (and `/units/ys-rf`) | Roof villa layout, «قارن الروفين» |
| Unit-Gallery-M, Unit-Gallery-D | `/units/rz-a/gallery?i=3` | Full-screen gallery, keyboard arrows, Esc, swipe; «الصور · المخطط · جولة 360 [للتأكيد]» tabs on desktop |
| Unit-Plan-M | `/units/rz-a/plan` | Schematic SVG plan marked illustrative; tap a room to see its area; with/without dimensions; roof villas get two tabs |
| Unit-Tier-Real-M | `/units/rz-a?tier=real` | Presenter «image tier». Uses `/public/real/*` if present, otherwise the neutral placeholder frame, no label |
| Unit-Tier-Gen-M | `/units/rz-a` (default) | Generated images with «صورة تعبيرية» |
| Unit-Tier-Typo-M | `/units/rz-a?tier=typo` | Typographic tier |
| About-Proof-D | `/about?proof=1` | Presenter «About proof blocks»: financing block with placeholder bank names and the three quotes each with a «نص تجريبي» tag |
| Compare-One-M | `/compare?u=rz-a` | One unit, suggestions |
| Compare-Empty-M | `/compare` | Nothing selected |
| Contact-Success-M | `/contact/sent` | After a valid submit; the message is echoed back; the reply-time line is computed from the clock and business hours |
| Contact-Error-M | `/contact` after an invalid submit (`?offline=1` adds the connection-lost banner) | Gold validation, summary takes focus, text never lost |
| Header-Scrolled-D | see above | |
| Privacy-M, Privacy-D | `/privacy` | Sticky contents on desktop |
| EN-Home-M | `/en` | LTR, cuts mirrored |
| EN-Card-M | `/en/units` | English results list with the designed card |
| EN-Unit-M | `/en/units/rz-a` | |
| OG-Home, OG-Project, OG-Unit | `/og/home`, `/og/project/garden-rawdah`, `/og/unit/rz-a` | Rendered 1200×630 routes, screenshotted by Playwright to `/public/og/*.png`, wired into page metadata |
| Icons | `/public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `icon-512-maskable.png` | |

## 30–32 · تعاون معنا

| Board | Route | State / how it is reached |
|---|---|---|
| Hub-M, Hub-D | `/collaborate` | Three doors |
| Alliance-M, Alliance-D | `/alliance` | 12 members. Honeycomb hero fills cell by cell on load; coverage grid and directory computed from the member fixtures |
| Alliance-Launch-M | `/alliance?members=0` | Presenter «alliance members 12 / 0» (launch day: empty directory, «مطلوب» cells, 37 Google-form note) |
| AllianceApply-Step1-M | `/alliance/apply` | Office, licence, applicant, role, district, map link / pin: schematic SVG with a draggable hexagon pin; «ألصق رابطاً» accepts a Google Maps link and shows the designed preview state |
| AllianceApply-Step2-M, AllianceApply-Step2-D | `/alliance/apply/coverage` | Sectors, district multi-select (search, grouped), radar preview, specialties, hours |
| AllianceApply-Step3-M | `/alliance/apply/offers` | Counters, requests elsewhere, text fields, directory consent, charter consent (required) |
| AllianceApply-Success-M | `/alliance/apply/sent` | ALL-2026-0038, shown as مكتب م للعقارات (the board's مكتب أ is already member `office-01`; see the decision log) |
| AllianceApply-Status-M | `/alliance/status/ALL-2026-0038` (مكتب م) | «قيد المراجعة» by default; `?app=verified` → «موثّق»; `?app=rejected` → «مرفوض مع السبب» (presenter «application status»). `/alliance/status/ALL-2026-0031` is rejected in the fixtures |
| Marketer-M, Marketer-D | `/marketers` | Form with the `[للتأكيد]` chip on the fields note |
| (no board) | `/marketers/sent` | Success screen built on the Add-Success pattern, since the marketer form has no designed success board |
| MarketerPage-M | `/m/mk-07` (390 only) | The marketer's private page (QR, copy link, three numbers). `/r/abdullah` is the public tracked link: it redirects to `/` and stores the attribution for 30 days |
| Add-Step2-Building-M | `/add/details` (building type) | see section 23 |
| State-Empty-Success-M | `/alliance/request/sent?req=REQ-2026-0412` | After the alliance bridge form on the empty results state |

## 33 · Member pages (390 only, no login)

| Board | Route | State / how it is reached |
|---|---|---|
| Member-Request-M | `/member/office-09/requests/REQ-2026-0412` | مكتب ط (covers الفيصلية). Open request with the offer form |
| Member-Request-States-M | same route with `?mreq=answered` (also after submitting the form) · `?mreq=expired` | Presenter «member request open / answered / expired», all three on REQ-2026-0412 |
| Member-Referral-M | `/member/office-09/referrals/REF-2026-0117` | SMQ ↔ مكتب ط, stage معاينة |
| Member-Ledger-M | `/member/office-01` (مكتب أ, as designed) · `/member/office-09` (مكتب ط, used in the tour) | Ledger bars, open requests, referral records of that office |
| Member-Report-M, Member-Report-D | `/member/office-01/report` | Responsive (both widths designed) |

## 34–37 · Admin: marketers and the alliance room

| Board | Route | State / how it is reached |
|---|---|---|
| Admin-Marketers-D | `/admin/marketers` | Stage board; «أنشئ الرابط وفعّل» moves the card in memory |
| Admin-MarketerDetail-D | `/admin/marketers/mk-07` | |
| Admin-Alliance-D | `/admin/alliance` at 1440 | Overview with the sub-tabs |
| Admin-Alliance-M | `/admin/alliance` at 390 | Daily actions |
| Admin-AllianceApplications-D | `/admin/alliance/applications?id=ALL-2026-0038` | Licence check with date → «اعتمد كعضو موثّق» (in memory, toast; the applicant is مكتب م, so no duplicate of member مكتب أ is created); Google-forms import banner |
| Admin-AllianceMembers-D | `/admin/alliance/members` | Ledger cells, مكتب ل suspended |
| Admin-AllianceMember-D | `/admin/alliance/members/office-01` | «صفحة العضو كما يراها» → `/member/office-01` |
| Admin-AllianceRadar-D | `/admin/alliance/radar?district=obhur-north` | Hexagon cell opens the district drawer; «أرسل للمكاتب» creates a request in memory |
| Admin-AllianceRequests-D | `/admin/alliance/requests?req=REQ-2026-0412` | Stage board + detail; select مكتب ط's offer → «أنشئ سجل إحالة» creates REF-2026-0117 in memory and opens the referrals tab. Manual-mode «أرسل على واتساب» opens the designed state without sending |
| Admin-AllianceReferrals-D | `/admin/alliance/referrals` | Dispute panel on REF-2026-0098, stage update form |
| Admin-AllianceReport-D | `/admin/alliance/report` | Draft October preview; «انشر وأرسل» → toast; «افتح كما يراه العضو» → `/member/office-01/report` |
| Admin-AllianceSettings-D | `/admin/alliance/settings` | Charter, defaults, routing weights (sum check), option lists, forms table |
| Components3 | Alliance components | `/demo/components` |

## Presenter layer (hidden from visitors)

| Screen | Route |
|---|---|
| Screen map, grouped by the sections of this file, with every state above as a deep link | `/demo` |
| Presenter bar | `Shift+P` outside inputs, or `?demo=1` |
| Switches | One URL parameter each, see the table below |
| Tours | `/demo/tours/buyer`, `/demo/tours/owner`, `/demo/tours/alliance`; each runs as an overlay with next / previous over the real routes (`?tour=buyer&step=3`) |
| Styleguide (QA) | `/demo/components` |
| Image contact sheet (Phase 8: two candidates per slot, anchors first) | `/demo/contact-sheet` |

Presenter parameters (one per switch; a parameter in the URL overrides the stored value)

| Switch | Parameter | Values | Default |
|---|---|---|---|
| Presenter bar | `demo` | `1` | off |
| Alliance members | `members` | `12`, `0` | `12` |
| Unit image tier | `tier` | `real`, `gen`, `typo` | `gen` |
| Unit status | `ustatus` | `available`, `reserved`, `sold` | from fixtures |
| Application status | `app` | `review`, `verified`, `rejected` | from fixtures |
| Member request | `mreq` | `open`, `answered`, `expired` | from fixtures |
| WhatsApp Business | `wa` | `connected`, `manual` | `connected` |
| Loading skeletons | `skeleton` | `1` | off |
| `[للتأكيد]` chips | `marks` | `1`, `0` | `1` (shown) |
| About proof blocks | `proof` | `1` | off |
| Connection lost banner | `offline` | `1` | off |
| Admin empty states | `empty` | `1` | off |
| Login error | `error` | `1` | off |
| Tour overlay | `tour`, `step` | `buyer`, `owner`, `alliance` · `1…n` | off |

Storage keys: `smq.presenter` (switches, localStorage), `smq.compare` (compare selection, 7 days), `smq.ref` (marketer attribution from `/r/[name]`, 30 days), `smq.store` (in-memory mutations, sessionStorage, reset from the presenter bar). The `/demo` screen map groups links by the section headings of this file (0, 1–12, 13–15, 16–22, 23–29, 30–32, 33, 34–37), which follow the numbering of `design/preview/index.html`; `design/README.md` lists the same pages under its own headings without those numbers.

Tour steps
- Buyer: `/` (budget 700k, count changes) → `/units?…` (filters, sort) → `/units/rz-a` (gallery, plan) → `/compare?u=rz-d,ys-d,rz-c` → WhatsApp link with the prefilled message.
- Owner: `/collaborate` → `/add?type=building` (type عمارة سكنية) → `/add/details?type=building` (income variant, computed yield) → `/add/contact?type=building` (وكيل) → `/add/sent?no=2026-1042` → `/admin/approvals/2026-1042` (role checklist, approve).
- Alliance request: `/units?district=faisaliyah&max=450000&beds=4&type=apt&feat=driver` (0 results, bridge form) → `/alliance/request/sent?req=REQ-2026-0412` → `/member/office-09/requests/REQ-2026-0412` (مكتب ط answers) → `/admin/alliance/requests?req=REQ-2026-0412` (pick the offer, create REF-2026-0117) → `/member/office-09/referrals/REF-2026-0117` → `/member/office-09` (ledger).

## Plan

Stack: Next.js 16 App Router (`output: 'export'`), TypeScript, Tailwind v4 with the `--smq-*` tokens as CSS variables (names in `docs/tokens.md`), Playwright for screenshots and OG images, AI SDK for the image script. Every dynamic route (`/units/[code]`, `/member/[token]/…`, `/admin/approvals/[id]`, `/r/[name]` …) ships `generateStaticParams` over the fixtures with `dynamicParams = false`; `/r/[name]` stores the attribution and redirects on the client. `noindex` comes from a `<meta name="robots">` on every page plus an `X-Robots-Tag` header in `vercel.json` and a disallow-all `robots.txt`. No map library and no Maps API key: office and project locations are keyless Google Maps embeds (iframe, `hl=ar`, `hl=en` on `/en`), lazy-loaded with the schematic drawing as placeholder and fallback; the results map view and all pin pickers are interactive schematic SVGs. `noindex` header + `robots.txt` on everything.

Data (`/data`, typed fixtures; the file list, every id, shape and the 33 district slugs are in `docs/data-model.md`): `units`, `projects`, `districts`, `offices`, `applications`, `requests`, `referrals`, `marketers`, `approvals`, `leads`, `visitors`, `analytics`, `content`, `settings`, `media` (32 slots), plus `types.ts` and `selectors.ts`. Everything shown as a count, range, price per m², yield or ranking is a selector over these fixtures. REQ-2026-0412 / REF-2026-0117 use مكتب ط throughout. In-memory mutations (status changes, approvals, created referrals, toasts) live in a client store that the presenter can reset.

Empty-state logic: the headline constraint is the single filter that, applied alone to all available units, removes the most. Suggestions loosen one constraint each (drop the district, raise the budget to the next available price, nearest bedroom count, drop a feature) and show the computed `+n`; if no single loosening yields results, the smallest pair is shown. So the numbers will be honest for whatever filters the client tries, and may differ from the board's illustrative `+6 / +4 / +2`.

Build order (as requested): tokens, shell, shared components → public explorer (home, results + map, guide, project, unit, compare, states) → remaining public pages → تعاون معنا, alliance, forms → member and marketer pages → admin → presenter and tours → images → OG and icons. Once the shared components exist, the four page groups run in parallel. After each section: screenshots at 390 and 1440 next to the boards, fixes, then a check-in.

## Decisions I'd like you to confirm

(To be confirmed by the project owner, the author of `docs/BRIEF.md`, in chat. Not received as of 2026-10-10. Building waits for this OK and for the OK on the table above.)

1. Hub path `/collaborate` (the boards never name one).
2. `/r/[name]` is the visitor-facing tracked link (redirects to `/`, stores attribution); the marketer's own page lives at `/m/[token]`.
3. Member pages under `/member/[token]/…` with readable tokens `office-01 … office-12`; the alliance tour uses مكتب ط (`office-09`); مكتب أ's ledger shows its own three records.
4. Public default image tier is "generated with the label" for all ten units, roof villas included; the real tier appears only via the presenter or when files exist in `/public/real`.
5. The marketer form gets a success screen built on the Add-Success pattern (no board exists).
6. Add steps at `/add`, `/add/details`, `/add/contact`, `/add/sent`.
Note (not a decision): `AI_GATEWAY_API_KEY` lives only in the git-ignored `.env.local`; `.env.example` carries the name. No Maps key is needed any more.
