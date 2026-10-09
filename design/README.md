# SMQ Real Estate · redesign package · round 3

Direction B "القطع" (the cut). Arabic-first, RTL, Noto Kufi Arabic (Noto Sans for the English boards), ink #141311 / gold #B48F2E / white, 60° cuts and hexagons from the logo geometry. No radius, no gradients, no shadows. Errors are gold, never red. Status is carried by shape and word (gold filled hexagon = متاح, white with ink inset ring = محجوز, ink = مباع). Gold carries ink text only; gold as text on white is #8A6C1E.

Unit prices, areas, bedrooms, bathrooms and statuses are the client's inventory (see the table below). Delivery dates, warranties, insurance, occupancy certificate, orientation, floor, ceiling height, RETT, FAQ answers, licence numbers other than the two in the footer, alliance charter terms, marketer commission and every analytics or alliance number are placeholders. Anything marked [للتأكيد] or [مسودة إجابة] stays marked on the site until a manager confirms it in the admin. Everything in the admin, member and alliance boards is illustrative data.

## Folders

- `preview/` — open `index.html`. Every artboard as a standalone HTML page with the brand images inlined from `preview/assets/`. Links between pages work (phone boards link to phone boards, desktop to desktop). These are the files a developer reads for exact spacing, sizes, colours and copy: all styles are inline on the elements or in a small `<style>` block at the top of the page.
- `canvas-source/` — the original design-canvas files (`*.dc.html` + `canvas.json`). Same markup as preview, but image references point at the canvas asset store (`/_blob/<id>`) and each file carries the canvas runtime script. Keep for re-importing into the canvas.
- `brand/` — logo files: gold mark, white lockup (original from the website), ink lockup, gold-mark + ink text, gold-mark + white text, wordmark only (ink / white). Usage rules are on the `HeaderFooter` sheet; favicon and app-icon derivations are on `Icons`.

## Asset id map (canvas-source)

| /_blob id | file |
|---|---|
| e72eb7d55ec3eb88a34f67dce8e71550 | logo-mark-gold.png |
| abcc5dce5470be854555617d981921e7 | lockup-white.png |
| 75656b4b34a582a811c6915c8a502b70 | lockup-ink.png |
| f4f3ce1de7b5b44709e143dff3a5d0ab | lockup-goldmark-ink.png |
| 74198517e5ad06a71e300a3da635ec66 | lockup-goldmark-white.png |
| 13918f1d73eb82fd33e5bc59de976b61 | wordmark-ink.png |
| 4462335048cb520575b464ff06be7413 | wordmark-white.png |

## Canonical inventory (the only numbers that are real)

| Code | Building | Type | Beds/Baths | m² | Price | Status |
|---|---|---|---|---|---|---|
| RZ-A | روز | شقة | 3/3 | 147.00 | 690,000 | متاح |
| RZ-B | روز | شقة | 2/3 | 116.90 | 555,000 | متاح |
| RZ-C | روز | شقة | 2/2 | 80.35 | 510,000 | متاح |
| RZ-D | روز | شقة | 2/2 | 82.60 | 459,000 | متاح |
| RZ-RF | روز | فيلا روف | 5/6 | 411.00 | 1,650,000 | متاح |
| YS-A | ياسمين | شقة | 2/3 | 109.35 | 555,000 | مباع |
| YS-B | ياسمين | شقة | 2/3 | 106.05 | 555,000 | متاح |
| YS-C | ياسمين | شقة | 2/2 | 84.10 | 459,000 | مباع |
| YS-D | ياسمين | شقة | 2/2 | 84.20 | 459,000 | متاح |
| YS-RF | ياسمين | فيلا روف | 5/6 | 419.00 | 1,600,000 | متاح |

8 available, 2 sold, none reserved. The reserved state appears only on `State-Cards`, `Unit-Reserved-M` (a state demo on YS-D) and the unit editor. The price guide is computed from available units only; the model counts read "available of listed". The `Admin-Inventory-D` import preview shows RZ-C changing to 499,000 as a sample diff, not a real price.

## Pages (M = 390 phone, D = 1440 desktop)

Sections on the canvas are numbered; the same numbers are the headings in `preview/index.html`.

**Options (0 to 1):** A-Hero, A-Card (rejected), B-Hero, B-Card (chosen).

**Public site, round 1 (2 to 17):** Home, Results (+ Results-Filters-M bottom sheet), Guide (price guide), Project, Unit, Compare, State-Loading-M, State-Empty (now with the alliance bridge), State-Cards (sold / reserved), Services, Add (step 3 on phone, with the new role and timing fields; step 1 on desktop), About, Contact, NotFound, HeaderFooter (header, mobile menu, footer; the header slot is now «تعاون معنا»), Tokens, Components, Shots (31 generated shots + the upload-only founder slot), Admin-M, Admin-Overview-D, Admin-Approvals-D (now an income-building example submitted by a وكيل, with a role-dependent checklist), Admin-Inventory-D, Admin-Analytics-D, Admin-Visitors-D.

**Admin, round 2 (18 to 22):** Admin-Login-M/D (error state, no sign-up), Admin-Projects-D, Admin-ProjectEditor-D, Admin-UnitEditor-D (Excel-sourced vs admin-only fields, status with dates, hide switch, change history), Admin-Leads-D/M (inbox with manual status and «علّم كمردود»), Admin-Content-D (hub with published / draft / needs confirmation), Admin-PageEditor-D (Home, AR/EN tabs, live preview, save bar in unsaved and just-published states), Admin-FAQ-D, Admin-Partners-D, Admin-Testimonials-D (3+ rule, proof points), Admin-Lists-D, Admin-SiteSettings-D, Admin-SEO-D, Admin-Media-D (32 slots with tiers and label switch), Admin-Users-D (roles, invite, audit log, WhatsApp Business connected and manual mode), Admin-Pieces-D (notifications, needs-confirmation list, confirm dialog, empty states, toasts), Components2 (admin components, all states).

**Public, round 2 (23 to 29):** Add-Step1-M, Add-Step2-M, Add-Success-M, Add-Step2-D (income-building variant), Add-Step3-D, Add-Success-D; Results-Map-M/D (hexagon pin per project, card from pin); Projects-M/D (header «المشاريع» goes here); Results-Loading-D; Unit-Reserved-M, Unit-Sold-M, Unit-Roof-M; Unit-Gallery-M/D; Unit-Plan-M; Unit-Tier-Real-M, Unit-Tier-Gen-M, Unit-Tier-Typo-M (one unit per image tier); About-Proof-D (financing and testimonials visible); Compare-One-M, Compare-Empty-M; Contact-Success-M, Contact-Error-M; Header-Scrolled-D; Privacy-M/D; EN-Home-M, EN-Card-M, EN-Unit-M (LTR); OG-Home, OG-Project, OG-Unit (1200×630); Icons.

**تعاون معنا and the alliance, round 3 (30 to 37):**
- 30: Hub-M/D (three doors), Alliance-M (12 members), Alliance-Launch-M (0 members, launch day), Alliance-D.
- 31: AllianceApply-Step1-M, Step2-M, Step3-M, Step2-D, AllianceApply-Success-M, AllianceApply-Status-M (قيد المراجعة، موثّق، مرفوض with reason).
- 32: Marketer-M/D (landing + application, fields [للتأكيد]), MarketerPage-M (tracked link, QR, three numbers), Add-Step2-Building-M, State-Empty-Success-M.
- 33: Member pages, 390 only, opened from WhatsApp links with no login: Member-Request-M, Member-Request-States-M (expired, answered), Member-Referral-M (receipt), Member-Ledger-M (الميزان), Member-Report-M, Member-Report-D.
- 34 to 36: Admin-Marketers-D, Admin-MarketerDetail-D, Admin-Alliance-D (overview), Admin-AllianceApplications-D (list, review, manual licence check, Google Forms import state), Admin-AllianceMembers-D, Admin-AllianceMember-D, Admin-AllianceRadar-D (hex grid, ranked table, district drawer), Admin-AllianceRequests-D (board by stage, request detail, both sending modes), Admin-AllianceReferrals-D (dispute flag), Admin-AllianceReport-D (preview, publish and send), Admin-AllianceSettings-D (charter, defaults, routing weights, option lists, forms control), Admin-Alliance-M (daily actions on the phone).
- 37: Components3 (door card, district multi-select, hexagon district cell in four states, «رخصة فال موثّقة» badge, ledger bar, request card, referral record, board column, stage line).

## Build notes

- Riyal sign: drawn as a placeholder inline SVG everywhere. Replace with the official glyph (U+20C1) or the SAMA SVG at 0.75em, inheriting text colour, 0.25em gap before the number. Never print "ر.س".
- Western digits everywhere; `font-feature-settings: 'tnum'` on the root. English boards use Noto Sans; Arabic text inside them keeps Noto Kufi Arabic.
- Zero border radius. Cuts: dy = dx × 1.732 (60°). Sizes cut-s 8×14, cut-m 12×21, cut-l 16×28, cut-xl 36×62. In LTR the cut mirrors to the other corner (see EN boards). Hexagon: `polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)`; marker: `polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)`.
- Status: gold filled hexagon = متاح, white with ink inset ring = محجوز, ink = مباع. Sold cards shrink, image desaturates, price stays as "سعر البيع المعلن", WhatsApp becomes a redirect to similar units.
- WhatsApp: every button carries a prefilled message with project, model code and a visitor reference code (`SMQ-XXXXX`). The code is what links a WhatsApp click to a conversation; visitors who only tapped WhatsApp have no phone number in the admin, only the code. Phone numbers exist for form submitters only.
- Leads: «بلا رد» is a manual status; the site cannot detect replies. «علّم كمردود» sets it. The approvals log shows both sending modes: «أُرسلت تلقائياً (واتساب بزنس متصل)» and the manual «أرسل على واتساب».
- Images: three tiers. Real photos carry no label; generated and developer renders carry the «صورة تعبيرية» label (only a manager can switch it off); the typographic tier shows the unit's numbers on ink when no image exists. Uploading a real photo in the admin replaces the generated one and removes the label. `IMG-HERO-BRAND` is the only slot where the logo may appear in a generated image. Never generate people, the founder, logos or maps.
- Admin sidebar links المشاريع / الطلبات الواردة / المحتوى والأسئلة / الإعدادات والمستخدمون / المسوّقون / غرفة التحالف each open their own board; «تحرير» on the inventory opens the unit editor. The «تعاون معنا» group appears on every admin board.
- أضف عقارك: property types include «عمارة سكنية» and «عمارة تجارية» (no plain «عمارة»). Step 2 shows عمر العقار always, and for buildings عدد الوحدات, هل يوجد دخل؟ and الدخل السنوي; the admin computes yield and price per m². Step 3 asks صفتك في العرض (مالك، وكيل، مسوق، أخرى) and التوقيت المناسب للتواصل. The approval checklist changes with the role: مالك needs the deed, وكيل the power of attorney, مسوق a FAL licence and a brokerage contract.
- Empty results: when no unit matches, the alliance bridge offers to pass the request (district, budget, rooms, type only) to licensed member offices after an explicit consent tick. SMQ makes the introduction; the visitor's name and number never reach a member.
- Alliance: licence verification is manual against the REGA site, with a dated checkbox and licence expiry. Requests go to members who cover the district, ranked by الميزان, response speed and specialisation (weights in settings). Members answer from a per-office WhatsApp link, no login. A referral record (REF-) is created from a chosen offer before any introduction and carries the split and protection period (both [للتأكيد]). Suspended members disappear from the directory and routing but keep their records. The monthly report hides any slice under 20 sessions and never names a person.
- Sample office names (مكتب أ، مكتب ب…) and all marketer, member, request and referral numbers are placeholders for the design.

## Changes in round 3 (this package)

- Header slot «أضف عقارك» became «تعاون معنا» (header, mobile menu, footer on every public board). «أضف عقارك» stays reachable from the hub, Home services card 05 and the Services page.
- Approvals board: submitter role, income-building fields (units, annual income, computed yield, price per m² on land and on build), role-dependent checklist.
- State-Empty (390 and 1440): alliance bridge with consent; success state added.
- Add: new property types, step 2 income-building variant (1440 and 390), step 3 role and timing (390 and 1440).
- Admin: «تعاون معنا» sidebar group with «المسوّقون» and «غرفة التحالف» on every board; Admin-M and Admin-Leads-M gained a «التحالف» tab.
- Site settings now carry the real footer licences (FAL 1200040135, CR 7029797433) and contact numbers; only the tax number remains [للتأكيد].
- Canvas: every board height was measured in a browser and the rows re-laid out, so no board overlaps the next section title. `preview/index.html` lists 130 boards in 39 sections.
- Round 2 corrections kept: inventory counts 8/2/0, RZ-B has 2 bedrooms, price guide from available units only, reference codes instead of visitor phone numbers, manual «بلا رد», two approval sending modes, 31 generated shots, sidebar links fixed.
