# `/data` · fixtures and selectors

Every record and every computed number the prototype shows. The ten units in `units.ts` are the only real numbers (design/README.md); everything else is illustrative, taken from the boards and kept consistent across screens (ids and shapes in `docs/data-model.md`). Pages never type a number from a board: they call a selector. Western digits in every string; Arabic copy verbatim from the boards; `[للتأكيد]` / `[مسودة إجابة]` stay inline in the strings (render them through `<Mark />`).

The prototype's clock is `TODAY = 2026-10-10` and `NOW = 2026-10-10T22:00+03:00` (selectors take `today` / `now` parameters that default to these).

Import from `@/data` (the index re-exports every file) or from the file.

## Fixture files

| File | Export | What it holds |
|---|---|---|
| `types.ts` | all interfaces | Shapes of `docs/data-model.md` plus additive optional fields and the shapes for analytics, reports, settings, content |
| `units.ts` | `units` | The ten real units: codes, slugs (lower-case code), beds/baths, areas, prices, status, `soldOn` (YS-A 2026-09-28, YS-C 2026-08-30), board details with `tbc`, features, images (Shots slot ids), `plan`, `updatedAt`. Helpers: `UNIT_CODES`, `BUILDINGS`, `unitByCode`, `unitBySlug`, `modelLabel` («نموذج A»/«روف»), `floorLabel` («الثالث», «الرابع والسطح»), `FLOOR_WORDS`, `UNIT_TYPE_AR`, `UNIT_TYPE_PLURAL_AR`, `unitHistory` (change log per unit), `importPreview` (the canned Excel diff of `?import=1`) |
| `projects.ts` | `projects` | `rwd-01` جاردن الروضة (slug `garden-rawdah`), `abh-01` draft, `ind` auto group (`autoGroup: true`). Buildings RZ/YS, milestones, features, delivery label tbc, centre = الروضة centre. Helpers: `projectById`, `projectBySlug`, `publicProjects` (on the site), `adminProjects`, `PROJECT_FEATURES` |
| `districts.ts` | `districts` | The 33 districts: slug, ar, en, sector, centre, `comingSoon` (أبحر الشمالية، الشاطئ، المحمدية), `inSiteList` (the 14 of Admin-Lists-D). Helpers: `districtBySlug`, `districtAr`, `districtsBySector`, `siteDistricts`, `SECTORS`, `SECTOR_ORDER` |
| `offices.ts` | `offices` | The 12 members in abjad order (`office-01` أ … `office-12` ل), districts, specialties, licence (expiry per board, د reminded), ledgers, مكتب ل suspended 2026-10-05. Helpers: `officeById`, `officeByLetter`, `activeOffices`, `officeNameAr`, `ABJAD`, `HOURS_LABELS` |
| `applications.ts` | `applications`, `importedApplications`, `allApplications` | ALL-2026-0038 مكتب م (review, licence check prefilled), 0037 مكتب ن, 0036 مكتب ع (missing), 0035 مكتب ق, 0031 مكتب س (rejected with the status-page reason), and ALL-G-001…037 imported rows («مكتب ف للعقارات» … double letters, status `imported`). Helpers: `applicationById`, `pendingApplications`, `APPLICATION_STATUS_LABELS`, `APPLICATION_LIST_LABELS` |
| `requests.ts` | `requests` | The ten REQ-2026-* records; REQ-2026-0412 carries مكتب ط's offer (165 m², 440,000, 72 min). Helpers: `requestById` (accepts `REQ-0412`), `shortRequestId`, `STAGE_LABELS`, `STAGE_ORDER`, `SOURCE_LABELS` |
| `referrals.ts` | `referrals` | Six REF-2026-* records; REF-2026-0117 SMQ ↔ office-09, 0098 carries the dispute. Helpers: `referralById`, `shortReferralId`, `referralsForOffice`, `REFERRAL_STAGE_LABELS`, `REFERRAL_STAGES` |
| `marketers.ts` | `marketers` | MK-07 عبدالله الحربي (active, slug `abdullah`, token `mk-07`, six attributed leads), MK-03/05/02 active, MK-01 suspended, new/interview/accepted rows. Helpers: `marketerById`, `marketerBySlug`, `marketerByToken`, `trackedLink`, `MARKETER_STAGE_LABELS`, `MARKETER_STAGES` |
| `approvals.ts` | `approvals`, `closedApprovals`, `allApprovals` | 2026-1043 apartment, 2026-1042 income building (the detail board, role checklists, both sending modes in the log), 2026-1041 villa, 2026-1040 land, plus 14 closed this month (9 approved · 3 rejected · 2 withdrawn). Helpers: `approvalById`, `openApprovals`, `checklistFor(kind)`, `ROLE_NOTES`, `ROLE_LABELS`, `APPROVAL_REJECT_OPTIONS`, `APPROVAL_STATUS_LABELS` |
| `leads.ts` | `leads` | The designed rows (SMQ-8F3A2 with its path and note, خالد باعشن, v-77b04, 2026-1042, ريم الزهراني, SMQ-A10F9, SMQ-2C91E, the marketer-attributed codes) plus deterministic filler rows (`generated: true`) so `leadCounts()` gives 12 / 41 / 86 / 139. Helpers: `leadById`, `unitLeadTitle`, `LEAD_KIND_LABELS`, `LEAD_STATUS_LABELS`, `CLOSE_REASONS` |
| `visitors.ts` | `visitors`, `visitorsSummary`, `visitorsPeriods` | v-8f3a2 (drawer example with the session path) and the other five rows; the 30-day summary (sources with WhatsApp conversion, device, language, cities); today / 7d / 30d tiles. Helper: `visitorById` |
| `analytics.ts` | `analytics`, `allianceReports`, `districtSessions30d`, `districtSessions90d`, `radarDistricts`, `unitWeek` | Period sets 7d / 30d / 90d (funnel, budgets, districts, rooms, types, features, zero results, sort, view, hours), today's tiles, the overview header, radar sessions per district (30 and 90 days) with drawer details, per-unit weekly views, the alliance response numbers, the monthly reports (October draft, September and August published). Helper: `reportById` |
| `content.ts` | `content` + named | `homePage` (sections with AR published / AR draft / EN fields, `visible` / `visibleDraft`), `homeFaq` (Home-D block verbatim), `faq` (faq-01…12, 05/06/07 drafts), `testimonials` + `TESTIMONIALS_MIN`, `proofNumbers`, `partners` (placeholder banks), `lists` (districts, cities, unit types, budgets, finder chips, rejection reasons), `seo` + `SEO_LIMITS`, `needsConfirmation` + `needsConfirmationCount()` (11), `contentHub`, `notifications`, `adminUsers`, `rolesMatrix`, `auditLog`, `forms` (option lists of the add / marketer / alliance forms), `copy` (shared fragments). `content.charter` and `content.routingWeights` point at `allianceSettings` |
| `settings.ts` | `settings`, `allianceSettings` | Office pin 21.5604526, 39.1811231, address, embed URLs (`embedUrl(lat, lng, hl)`), directions link (`directionsUrl`), WhatsApp 966559997929 and the six templates (`WA_TEMPLATES`, `fillTemplate`), hours + `businessHours`, phone 0556607779 (call) / 0559997929 (WhatsApp display), licences REGA 1200040135 · CR 7029797433, tax number tbc, socials, switches, WhatsApp Business connected. Alliance: charter 1.0 (full text, summary), defaults (50 / 50 tbc, 90 days, 3 business days), routing weights 50/30/20 and send-to, option lists, the three forms, rejection reasons |
| `media.ts` | `media` | 32 slots: the 31 of Shots.html (id, group, admin section, Arabic subject/mood/exclusions, primary ratio + board ratio text, pages, English subject prompt, `reference` on the four anchors) all tier `generated` with the label on, plus IMG-FOUNDER (`empty`). `scripts/images/manifest.ts` composes the final prompt. Helpers: `mediaById`, `mediaSections`, `ANCHOR_SLOTS`, `SHOT_LOOK`, `MEDIA_GROUP_LABELS`, `MEDIA_TIER_LABELS`, `MEDIA_TIER_NOTES` |
| `selectors.ts` | functions | Below |
| `index.ts` | re-exports | `import { … } from "@/data"` |

## Selectors (`selectors.ts`)

Every function is pure. `overrides` is the store's `{ unitStatus, unitHidden }` (pass `useStore` state or nothing); effective status = override ?? fixture.

Units
- `effectiveUnitStatus(unit, overrides)`, `isUnitHidden`, `listedUnits`, `availableUnits`, `soldUnits`, `reservedUnits`
- `countsByStatus(overrides)` → `{ available: 8, reserved: 0, sold: 2, listed: 10 }`
- `unitPpm(unit)` price ÷ area rounded · `priceRange`, `ppmRange`, `areaRange`, `bedsRange(list)` · `fromPrice(list)` → 459,000 · `latestUpdate(list)` · `unitDistrictSlug(unit)` · `bedsWord(n)`
- `rangeByBeds(overrides)` rows per bedroom count (from/to from the available, «من N» from the listed, `single`) · `rangeByType(overrides)` per type (ppm from/to, areas, available of listed)
- `districtPpmRange(slug)` · `comparedToDistrict(unit)` → the «قياساً بالحي» inputs and line · `comparedToProject(unit)` → the roof's «قياساً بالمشروع» line
- `finderCount(budget, district, type, beds)` → 6 at 700,000 in الروضة · `finderAnswer(...)` → count, from-price, beds / area / ppm ranges
- `unitMatches(unit, filters)`, `filterUnits(filters, overrides)` → `{ available, sold, reserved, matched }` sorted · `sortUnits(list, sort)` · `deliveryQuarterIndex(project)`
- `activeConstraints(filters)` chips · `emptyStateSuggestions(filters, overrides)` → headline constraint (the single filter that alone removes the most available units, ties in board order), the loosenings with computed `+n` (one constraint when possible, else the smallest subset), `bestDistrict` for «لكن لدينا 10 في الروضة»
- `pinCounts(filters)` pins per project (available / owner / soon) with matching counts and price range
- `guideTables(districtSlug)` the price guide (by beds, by type, by project, scale) · `guideDistricts()` chips with `live` · `GUIDE_CHIP_SLUGS`
- `projectBuildingCounts(projectId)` per building · `projectStats(projectId)` · `otherModelsInBuilding(unit)` · `similarAvailable(unit)` (same beds, available) · `otherRoof(unit)` · `budgetChipCounts()` · `importDiffPct(from, to)` · `supplyGapLine(period)`

Owner form and approvals
- `ownerFormComputed({ askedPriceSar, buildM2, landM2, areaM2, incomeYearSar })` → ppm on build 3,243, on land 7,680, yield 6.5% for 2026-1042 · `approvalComputed(approval)` · `vsDistrict(ppm, slug)` (null = «لا مرجع في الحي»)
- `effectiveApprovalStatus`, `approvalAgeHours(a, now)`, `checklistRemaining(a, role)`, `approvalCounts(overrides)`

Alliance
- `coverageByDistrict()` members per district (active only) · `coverageBySector()` the hexagon grid with `wanted` cells · `directory()` (active + opted in) · `memberCounts()`
- `ledgerNet(office)` → معطٍ / مستقبِل / متوازن with «10 مقابل 9» · `replyLabel(minutes)` → «1 س 40 د» / «بلا رد» · `allianceReplyStats()`
- `routingOrder(districtSlug, requestType, weights)` members covering the district ranked by ledger 50 · speed 30 · specialty 20 · `rankInDistrict(officeId, slug)` · `specialtyForType(type)`
- `radarRanking(period)` → districts ranked by `sessions × (1 if no SMQ units) × members covering`, with open requests, suspended members and the action (`send` / `needs-members` / `self`)
- `protectionDaysLeft(referral, today)`, `protectionUntil(referral)`, `effectiveReferralStage`, `referralSummary(overrides, created)` (ongoing 3 · 4,690,000 · transferred 2 · 3,900,000 · disputes 1) · `reportSlices(slices, 20)` → visible / hidden
- `effectiveRequest`, `requestsByStage(overrides)`, `requestCoverage(request)`, `memberRequestState(request, officeId, now)` → open / answered / expired, `openRequestsForOffice(officeId)`, `expiresInLabel(expiresAt, now)` («يومين و4 ساعات»), `allianceOverview(opts)`, `applicationCounts(overrides)`

Leads and marketers
- `effectiveLeadStatus`, `leadCounts(overrides)` → 12 / 41 / 86 / 139 · `effectiveMarketerStage`, `marketersByStage`, `marketerSummary()` (4 active · 1,284 visits · 19 leads · 1 negotiating), `marketerConversion(m)`

Record numbers and time
- `nextRequestNumber(createdIds)` REQ-2026-0419 · `nextApprovalNumber` 2026-1044 · `nextReferralNumber` REF-2026-0118 · `nextApplicationNumber` ALL-2026-0039
- `replyTimeLine(now)` the contact-success line from the business hours («الآن الساعة 9:05 مساءً، فالرد غداً في أول ساعة عمل.») · `timeLabelAr` · `agoLabel(iso, now)` («قبل 14 د», «أمس», «2026/10/02») · `whenLabel(iso, now)` («اليوم 10:40»)

## Decisions and known differences from the boards

- Computed numbers win over the boards' illustrative ones where they disagree: RZ-A is the lowest per m² among apartments (the board's «ثاني أقل»), YS-A has 5 similar available units (board: 4), the budget chips count 3 / 5 / 6 / 6 / 8 (board: 3 / 6 / 7 / 7 / 8), the empty state for `district=faisaliyah&max=450000&beds=4&type=apt&feat=driver` needs four loosenings before any unit appears (board: three single loosenings with +6 / +4 / +2), the radar order follows the formula (board order differs), protection days 90 / 78 / 71 (board 90 / 77 / 70), the alliance mean reply is the mean of the members' averages.
- ALL-2026-0038 is مكتب م للعقارات everywhere (decision log). The imported rows have placeholder names, not the board's «مكتب 1 (قوقل)».
- REQ-2026-0398 is a member request of مكتب أ (the board column says فريق SMQ) so that REF-2026-0098's parties and dispute reconcile. REF-2026-0104 / 0049 / 0033 reference earlier requests (REQ-2026-0389 / 0341 / 0302) that are not among the ten request records.
- The lead row for 2026-1042 describes the income building (the Leads board writes the apartment title next to that number; the approvals fixture owns the number).
- Members' `memberSince` and licence `verifiedOn` are the launch date 2026-10-01 («منذ أكتوبر 2026»); the member board's 2026/10/12 is after the prototype's today.
- `directory()` excludes the suspended مكتب ل (design/README rule); the public hero counts `offices.length` = 12 members.
- The three Home-D FAQ questions without answers (faq-10…12) carry short answers written from the Services / Guide copy so that 9 of 12 are published as the admin counts; `homeFaq` keeps the Home-D block verbatim.
- Media: every generated slot is `generated` (تعبيرية); the Admin-Media-D board's فعلية / رندر / طباعي mix is not reproduced (route-map rule). `ratio` holds the nearest value of the type union; `ratiosLabel` keeps the board text (16:10, 4:3).
- Headline lines of the empty state other than the district one («أقل سعر مدرج …», «لا نماذج بـ…») are derived copy; the board only designs the district case.
