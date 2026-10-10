# Data model · `/data` fixtures, ids, slugs

Everything the prototype shows comes from typed fixtures here. The ten units are real (design/README.md); every other record is illustrative, taken from the boards, and consistent across screens. Any number on screen is computed by a selector in `lib/selectors.ts`; nothing numeric is typed into components.

## Ids and slugs

| Thing | Id / slug | Notes |
|---|---|---|
| Units | `RZ-A RZ-B RZ-C RZ-D RZ-RF YS-A YS-B YS-C YS-D YS-RF`; URL slug is lower-case `rz-a` | model letter + building prefix |
| Buildings | `RZ` روز · `YS` ياسمين | |
| Projects | `rwd-01` جاردن الروضة (slug `garden-rawdah`, published) · `abh-01` مشروع أبحر (draft, «قريباً») · `ind` وحدات المُلّاك (auto group, not a project on the site) | |
| Districts | slug → Arabic, sector, approximate centre. See table below | |
| Alliance offices | `office-01` … `office-12` in **abjad order**: 01 أ · 02 ب · 03 ج · 04 د · 05 هـ · 06 و · 07 ز · 08 ح · 09 ط · 10 ي · 11 ك · 12 ل. Member page token = the same id (readable on purpose) | مكتب ل is suspended |
| Applications | `ALL-2026-0038` مكتب أ (review) · `0037` مكتب ن (review) · `0036` مكتب ع (missing info) · `0035` مكتب ق (review) · `0031` مكتب س (rejected) · 37 imported Google-form rows `ALL-G-001…037` | |
| Requests | `REQ-2026-0418` النهضة 2BR ≤560k (new, visitor) · `0417` الروضة land ≤2.5M (new, member أ) · `0415` أبحر الشمالية villa ≤2.2M (sent to أ, ك, auto) · `0414` المحمدية 3BR 700k–1M (staff, sent manually to د) · `0412` الفيصلية 4BR ≤450k (visitor, offer from ط, awaiting decision) · `0409` المحمدية land ≤1.5M (closed, أ answered «لا يوجد» in 50 min) · `0403` أبحر الشمالية land ≤1.5M (member هـ, offers from أ and ك) · `0401` الصفا 4BR (closed, no offers) · `0398` الشاطئ villa (staff → REF-0098) · `0377` أبحر الشمالية villa (member ك → REF-0061) | |
| Referrals | `REF-2026-0117` SMQ ↔ ط, الفيصلية 440,000, معاينة, protection 90/90 · `0104` أ ↔ ي, الروضة land 2,400,000, تفاوض, 77/90 · `0098` أ ↔ ج, الشاطئ villa 1,850,000, تفاوض, dispute 4 days, 70/90 · `0061` ك ↔ أ, أبحر villa 2,050,000, إفراغ 2026-09-30 · `0049` SMQ ↔ هـ, الصفا 3BR 1,850,000, إفراغ 2026-09-12 · `0033` د ↔ ب, المحمدية 2BR 520,000, لم تتم | |
| Marketers | `MK-07` عبدالله الحربي (active, `/r/abdullah`, page token `mk-07`) · `MK-03` نواف العتيبي · `MK-05` هند القرشي · `MK-02` فهد المالكي · `MK-01` خالد العمودي (suspended) · new: ريان الغامدي, لمى الحارثي · interview: محمد الشهري · accepted: سارة باجابر | |
| Owner submissions (approvals) | `2026-1043` شقة 3 غرف الروضة 620,000, محمد العمري (مالك), new 26h · `2026-1042` عمارة سكنية بدخل النعيم 4,800,000, عبدالرحمن الزهراني (وكيل), the detail board · `2026-1041` فيلا 5 غرف أبحر 2,400,000, أحمد الغامدي · `2026-1040` أرض 600 م² الفيصلية 1,100,000, سارة باخشوين (awaiting photos) | The owner tour's building submission lands on `2026-1042`; the apartment variant on `2026-1043` |
| Leads | `SMQ-8F3A2` WhatsApp from RZ-D (unanswered) · خالد باعشن contact form · `v-77b04` call click from compare (returning ×3) · `2026-1042` owner submission · ريم الزهراني «أبلغني» · `SMQ-A10F9` closed, bought RZ-B · `SMQ-2C91E` closed, bought YS-A · counts: 12 unanswered · 41 answered · 86 closed · 139 total | visitor codes `SMQ-XXXXX`, anonymous ids `v-xxxxx` |
| Visitors | `v-8f3a2` (the drawer example), `v-2c91e`, `v-77b04`, `v-a10f9`, `v-5d2c7`, `v-c3e18` | |
| FAQ | `faq-01` … `faq-12`; `faq-05`, `faq-06`, `faq-07` carry `[مسودة إجابة]` | |
| Media slots | the 31 ids from Shots.html + `IMG-FOUNDER` | |

## Districts

Sector slugs: `north` شمال جدة · `central` وسط جدة · `east` شرق جدة · `west` غرب جدة · `south` جنوب جدة.

| Slug | Arabic | Sector | Centre (approx, illustrative) |
|---|---|---|---|
| `obhur-north` | أبحر الشمالية | north | 21.78, 39.12 |
| `shati` | الشاطئ | north | 21.63, 39.11 |
| `dhahban` | ذهبان | north | 21.94, 39.12 |
| `mohammadiyah` | المحمدية | north | 21.64, 39.13 |
| `nahdah` | النهضة | north | 21.62, 39.16 |
| `basateen` | البساتين | north | 21.66, 39.15 |
| `rawdah` | الروضة | central | 21.572, 39.168 |
| `safa` | الصفا | central | 21.593, 39.202 |
| `naeem` | النعيم | central | 21.60, 39.17 |
| `zahra` | الزهراء | central | 21.58, 39.14 |
| `salamah` | السلامة | central | 21.60, 39.14 |
| `khalidiyah` | الخالدية | central | 21.56, 39.15 |
| `nuzhah` | النزهة | central | 21.60, 39.19 |
| `naseem` | النسيم | central | 21.59, 39.23 |
| `harazat` | الحرازات | east | 21.63, 39.27 |
| `samer` | السامر | east | 21.60, 39.26 |
| `rehab` | الرحاب | east | 21.56, 39.24 |
| `ajaweed` | الأجاويد | east | 21.58, 39.27 |
| `bryman` | بريمان | east | 21.67, 39.26 |
| `waha` | الواحة | east | 21.64, 39.22 |
| `hamra` | الحمراء | west | 21.53, 39.16 |
| `balad` | البلد | west | 21.485, 39.187 |
| `andalus` | الأندلس | west | 21.52, 39.17 |
| `ruwais` | الرويس | west | 21.53, 39.18 |
| `sharafiyah` | الشرفية | west | 21.51, 39.19 |
| `baghdadiyah` | البغدادية | west | 21.50, 39.18 |
| `faisaliyah` | الفيصلية | south | 21.56, 39.18 |
| `muntazahat` | المنتزهات | south | 21.44, 39.24 |
| `jamiah` | الجامعة | south | 21.49, 39.24 |
| `sanabel` | السنابل | south | 21.42, 39.22 |
| `quwaizah` | قويزة | south | 21.46, 39.26 |
| `kawthar` | الكوثر | south | 21.47, 39.29 |
| `sawari` | الصواري | north | 21.69, 39.11 |

Centres drive only the schematic SVG map layout and the project embed centre (الروضة). They are approximations; the project location carries «الموقع تقريبي [للتأكيد]». Districts with units: الروضة (10). «قريباً» on the price guide: الفيصلية، أبحر الشمالية، الشاطئ (and المحمدية in Lists). The office is at 21.5604526, 39.1811231 (شارع السيدة خديجة، حي الفيصلية).

## Fixture shapes (TypeScript, `data/types.ts`)

- `Unit { code, slug, projectId, building: 'RZ'|'YS', model: 'A'|'B'|'C'|'D'|'RF', type: 'apartment'|'roof-villa', beds, baths, areaM2, priceSar, status: 'available'|'reserved'|'sold', soldOn?, reservedUntil?, floor?: {value, tbc}, orientation?: {value, tbc}, ceilingM?: {value, tbc}, rett: 'tbc', features: {maid, driver, balcony, smartHome, parking, roofTerrace, kitchen: 'open'|'closed'|'tbc'}, otherFeatures, extraFeatures: 'tbc', imageTier: 'generated'|'real'|'typographic', images: SlotId[], plan?: PlanId, updatedAt }`. Real rows: see design/README.md (YS-A sold 2026-09-28, YS-C sold 2026-08-30). Board details: RZ-A floor 3 north, maid, balcony, smart, parking; RZ-C floor 3 north, balcony; RZ-D floor 2 east; YS-D floor 2 west; roof villas floor 4 + roof, maid, driver, two parking, no pool, no private lift.
- `Project { id, slug, nameAr, districtSlug, status: 'under-construction'|'ready'|'planned'|'draft', deliveryLabel: {value:'الربع الثاني 2027', tbc:true}, buildings: [{code, nameAr, letter}], features: ['موقف خاص','دخول ذكي','سمارت هوم'], milestones: [{label, date, done, tbc}], warranties: tbc, insurance: tbc, occupancy: 'بعد التسليم', centre, images, published, featured }`.
- `District { slug, ar, sector, centre, comingSoon }`.
- `Office { id, letter, nameAr ('مكتب أ'), fullName ('مكتب أ للعقارات'), sector, districts: slug[], specialties, licence: {number:'1200XXXXXX', verifiedOn, verifiedBy, expiresOn}, hours: 'single'|'morning'|'evening'|'other', applicantRole, memberSince, status: 'active'|'suspended', suspendedOn?, suspendedReason?, inDirectory, ledger: {offersGiven, requestsGiven, dealsClosed, requestsReceived, replied, avgReplyMinutes} }`. Ledger numbers per board (Admin-AllianceMembers-D): أ 10/9 1h40 · ب 4/12 3h05 · ج 6/6 2h20 · د 3/5 4h50 (licence expires 2026-11-03, reminded) · هـ 5/8 1h55 · و 2/4 6h10 · ز 3/3 2h40 · ح 8/2 1h10 · ط 4/3 1h12 · ي 1/7 9h30 · ك 7/6 2h00 · ل 1/8 suspended 2026-10-05.
- `Application { id, officeName, licence, applicantName, applicantRole, phoneMasked, districtSlug, sectors, districts, specialties, hours, offersDirect, offersBrokered, requestsElsewhere: slug[], want, add, notes, directoryConsent, charterConsent, status: 'review'|'missing'|'verified'|'rejected'|'imported', verification?: {date, expiry, nameAtRega, by}, rejectReason?, submittedAt }`.
- `Request { id, source: 'visitor'|'staff'|'member', memberOfficeId?, districtSlug, type, beds?, budgetMax?, budgetMin?, timing, stage: 'new'|'sent'|'offers'|'intro'|'closed', sentTo: [{officeId, mode:'auto'|'manual', sentAt, status:'pending'|'replied'|'none'|'expired'}], offers: [{officeId, type, areaM2, priceSar, note, brokered: boolean, repliedAt, replyMinutes}], referralId?, closedReason?, createdAt, expiresAt }`.
- `Referral { id, requestId, requesterOfficeId: 'SMQ'|officeId, offerOfficeId, districtSlug, summary, offerSummary, brokered, valueSar, split: '50 / 50', splitTbc: true, protectionDays: 90, introducedOn, stage: 'intro'|'viewing'|'negotiation'|'transfer'|'failed', stageNote, dispute?: {openedDaysAgo, claim, counter}, createdBy }`.
- `Marketer { id, name, slug, stage: 'new'|'interview'|'accepted'|'active'|'suspended', phoneMasked, licence?, districts, years, social, bio, cv, agreementOn, commission: 'tbc', stats: {visits30d, whatsapp30d, leads, negotiating}, attributedLeads: [{when, unit, channel, status, team, code}], notes, log }`.
- `Lead { id, kind: 'whatsapp'|'call'|'form'|'notify'|'owner', title, detail, source, device, city, status: 'unanswered'|'answered'|'closed', closedReason?, at, path: string[], notes: [{by, at, text}], viaMarketer? }`.
- `Visitor { id, code?, source, device, city, lang, visits, sessionLength, lastSearch, zeroResults, openedUnits, whatsapp, path }`.
- `Approval { id, kind: 'apartment'|'villa'|'land'|'building', role: 'owner'|'agent'|'marketer', ...the step 1–3 fields..., computed: {ppmBuild, ppmLand, yield}, status: 'new'|'awaiting-photos'|'approved'|'rejected', photos, checklist by role, log: [{by, text, at, mode?:'auto'|'manual'}] }`.
- `Analytics`, `Visitors summary`, `Report` (monthly numbers), `Content` (pages, FAQ, testimonials, partners, lists, site settings, SEO, charter, routing weights), `MediaSlot { id, group, tier: 'generated'|'real'|'render'|'typographic'|'empty', labelOn, pages, ratio }` — values copied from the boards; in the admin Media screen every generated image is `generated` (تعبيرية); the founder slot is `empty`.

## URL parameters

`/units` and `/units/map`: `district=<slug|all>` · `min`, `max` (SAR) · `type=apt|roof|villa|duplex` (comma list) · `beds=2|3|4|5` (5 = 5+) · `amin`, `amax` (m²) · `pstatus=ready|construction` · `delivery=2026-end|2027-mid|2027-end` · `feat=maid,driver,balcony,roof,smart` · `sort=price|ppm|area|delivery` (default `price`) · `sheet=filters` · `pin=<projectId>`. Compare: `/compare?u=rz-d,ys-d,rz-c`. Attribution: `/r/<marketer slug>` → `/?ref=<slug>` (stored 30 days).

## Computed selectors (never hardcoded)

available/sold/reserved counts · from-price · ranges by beds and by type · price per m² (`price ÷ areaM2`, rounded) · district per-m² range · "قياساً بالحي" lines · finder count as the budget moves · matching units per pin · loosen suggestions (see route-map Plan) · guide tables · project per-building counts · owner-form per-m² and yield · alliance coverage counts per district · directory · radar opportunity ranking (`sessions × (1 if no SMQ units) × (members covering)`) · ledger net («معطٍ» / «مستقبِل» / «متوازن») · routing order by weights 50/30/20 · referral protection days remaining · report slices (hide under 20 sessions).
