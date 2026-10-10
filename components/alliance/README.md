# components/alliance · التحالف وتعاون معنا

Shared components for the alliance pages (`/alliance`, `/alliance/apply/*`, `/member/*`, `/admin/alliance/*`) and the
door cards of تعاون معنا. Sources: `docs/boards/Components3.txt` (the nine sections), `Alliance-D/M`, `Alliance-Launch-M`,
`Admin-AllianceRadar-D`, `Admin-AllianceRequests-D`, `Admin-AllianceReferrals-D`, `Member-Ledger-M`, `Member-Referral-M`,
`Member-Report-M`. Styleguide: `/demo/components#alliance` (`_styleguide.tsx`, every component in every state, sheet order).

Rules kept here: copy verbatim from the sheets; tokens only (no hex values, no radius, no shadows); hexagons via clip-path
(`hex-flat` for cells and markers, `hex-point` for the dispute «diamond»); a bordered hexagon is a border-coloured hexagon
under a smaller fill (a CSS border cannot follow a clip-path and shadows are banned); gold carries ink text; status by shape
and word; Western digits with `tnum`; RTL first with logical properties; 44px tap targets on every control.

Import: `import { HexCell, RadarGrid, … } from "@/components/alliance"`. Types come from `data/types.ts`.

## Exports

| Export | Props | Notes |
|---|---|---|
| `DoorCard` | `variant: "owners" \| "offices" \| "marketers"`, `eyebrow`, `title`, `text?`, `cta`, `href`, `icon?` (decoration slot; default honeycomb for offices, link chip for marketers), `cut?` (big `cut-l` on the gold block, default for owners), `className?` | Hover: 6px gold rule at the inline start (no shadow, no motion). Focus: theme outline on the unclipped anchor |
| `DistrictMultiSelect` | `districts: District[]`, `value: string[]` (slugs), `onChange(slugs)`, `sectors?: Sector[]`, `requireSector?` (empty sectors → «اختر الجهة أولاً»), `disabled?`, `error?: boolean \| string` (true → «اختر حياً واحداً على الأقل»), `label?`, `placeholder?` («ابحث عن حي»), `requestHref?` («اطلب إضافة حي», default WhatsApp), `note?`, `sheetTitle?`, `inlineList?` (md+: list open under the field, default true), `className?` | Client. Tags of the selection with a gold × (aria «إزالة …»), grouped by sector, alphabetical inside, loose Arabic matching. Phone: the field opens a full-screen sheet with «تم» |
| `HexCell` | `label`, `value?`, `valueSize?: "small" \| "big"`, `state?: HexState` (`muted \| normal \| demand \| gap \| required \| active \| rank-1 \| rank-2 \| rank-3`), `selected?` (gold ring; gap colour from `--hex-surface`), `onClick?` (renders a `button`, `aria-pressed`), `href?`, `size?` (84 desktop · 60 phone · 40 hero), `title?`, `ariaLabel?`, `className?`, `style?` | muted = line 1.5px · normal = ink 1.5px · demand = ink 1.5px on sand · gap/rank-n = gold 2.5px · required = gold 1.5px («مطلوب») · active = solid ink, gold value |
| `HexDot`, `PointDot`, `hexLook` | `size?`, `tone?`, `border?` / `size?`, `tone?` | Small hexagon markers (badge dot, stage cells, legend) and the pointed hexagon |
| `HexGrid` | `cells: HexCellProps[]`, `columns?` (6), `columnsSm?` (phone copy), `size?`, `sizeSm?`, `gap?`, `rowGap?`, `shift?: "odd" \| "even" \| "none"`, `align?`, `className?`, `ariaLabel?`, `children?` | Rows of cells; alternate rows move half a cell inline-start |
| `Honeycomb` | `cells: HoneyTone[]` (`ink2 \| gold \| outline \| paper`), `rows?: number[]` (e.g. `[4,5,4]`), `columns?`, `size?`, `gap?`, `rowGap?`, `animate?`, `align?: "center" \| "start"`, `caption?`, `className?`, `ariaLabel?` | Hero honeycomb. `animate` fills cell by cell over `--smq-motion-skeleton` (1400ms); `prefers-reduced-motion` renders the end state (`alliance.module.css`) |
| `FalBadge` | `verified?` (false → «بانتظار التحقق»), `date?` (ISO expiry), `showDate?` («· حتى 2027/06/30»), `expiringInDays?` (≤ 30 → «تنتهي بعد 24 يوماً»), `suspended?` («موقوف»), `onInk?`, `className?` | Only for the فال licence. The public page shows the verified state only |
| `LedgerBar` | `given`, `received` (totals), `rows?: { given: LedgerRow[]; received: LedgerRow[] }` (`{ label, value, display?, ratio? }`), `labels?`, `variant?: "card" \| "compact"`, `header?: { title, subtitle? }`, `showNet?` (default true), `divider?`, `note?`, `suspended?`, `empty?` («بلا بيانات بعد»), `className?` | Gold = «أعطى», ink = «استقبل», bars scaled to the highest value in the card; net row «صافي الميزان» with the word (`ledgerNetLine`) |
| `StageLine` | `stages?` (default the five referral words), `failWord?` (last word is the failure word; default true only for the referral default), `current`, `failedAt?` (slot where «لم تتم» sits), `dates?`, `compact?` (14px cells + word), `word?`, `closed?`, `className?`, `ariaLabel?` | Done ink · current gold · next grey outline · failed white with 2px ink border. `APPLICATION_STEPS` for the 3-step application line |
| `RequestCard` | `id`, `source: "visitor" \| "staff" \| "member"`, `office?`, `district`, `summary`, `budgetMin?`, `budgetMax?`, `budget?` (preformatted), `beds?`, `timing?`, `stage?: RequestStage`, `offersCount?`, `detail?` (verbatim line; default budget · stage · offers), `extra?`, `href?`, `onClick?`, `needsAction?` (5px gold rule), `selected?` (2px gold outline), `closed?`, `variant?: "board" \| "member"`, `compact?` (id as title, «district · summary» as detail), `banner?`, `tileLabels?`, `className?` | Member variant: gold banner with the bottom-left cut and the three tiles; never a buyer's name or number |
| `ReferralReceipt` | `referral: Referral`, `requester: { name, licence }`, `offerer: { name, licence }`, `district?`, `requestLine?`, `offerLine?` (compact rows), `time?`, `createdBy?`, `requestSource?`, `offerSentAt?`, `brokerageLine?`, `charterLine?`, `stageNote?`, `failedAt?`, `compact?`, `mark?` (brand slot, default `LogoMark` from ui), `parties?` («SMQ ↔ مكتب ط»), `className?` | Full = Member-Referral-M order (header, meta rows, party tiles, الطلب, العرض, الاتفاق, المرحلة, ink footer). Protection «حتى» = `introducedOn + protectionDays`. «[للتأكيد]» through `Tbc` when `splitTbc` |
| `DisputeFlag` | `days`, `className?` | «نزاع · 4 أيام» with the gold pointed hexagon |
| `BoardColumn` | `title`, `count`, `needsDecision?` (gold rule + gold counter), `dropTarget?` («أفلت هنا»), `dropLabel?`, `more?: { label, href?, onClick? }`, `children`, `className?` | |
| `StageBoard` | `columns: (BoardColumnProps & { key })[]`, `initial?`, `className?` | Client. Tabs on phone (one column shown), `repeat(n, 1fr)` from md |
| `OfferRow`, `OfferRowsHeader` | `office`, `replyMinutes?`, `priceSar?` (`<Price />`), `areaM2?`, `note?`, `brokered` («عقد وساطة موثّق» / «مباشر من المالك»), `selected?` (cream-focus), `onSelect?`, `name?`, `action?`, `className?` | Grid `36px 1fr 1fr 1.2fr 150px` |
| `DisputePanel` | `id`, `openedDaysAgo`, `claimant`, `claim`, `respondent`, `counter`, `note?`, `actions?`, `className?` | 2px gold frame, cream-focus header, quoted blocks, actions slot |
| `RadarGrid`, `RadarLegend`, `radarState`, `radarNote` | `districts: RadarDistrict[]` (`{ slug, ar, sector, sessions, units?, members?, offers?, rank?, state?, note? }`), `selected?`, `onSelect?(slug)`, `demandMin?` (30), `columns?` (6), `columnsSm?` (5), `size?` (86), `sizeSm?` (60), `legend?`, `title?`, `caption?`, `className?` | Grouped by sector, alternate sector rows shifted; cells are buttons with `aria-pressed`; the page opens its drawer on `onSelect` |
| `MemberCard`, `DirectoryEmpty` | `office: Pick<Office, "letter" \| "nameAr" \| "specialties">`, `district`, `line?`, `href?`, `badge?`, `tag?`, `className?` / `title?`, `text?`, `className?` | Directory card; the launch-day empty frame |
| `CoverageGrid` | `districts: District[]`, `counts: Record<slug, number>`, `required?: string[]`, `sectorMembers?: Partial<Record<Sector, number>>`, `launch?`, `columns?` (6), `columnsSm?` (5), `size?` (84), `sizeSm?` (60), `headings?`, `caption?`, `className?` | Headings «شمال جدة · 5 مكاتب»; launch day: «مطلوب» cells, no counts |
| `ReportTile`, `ReportBarRow`, `ReportGapRow`, `GoldDot` | `label`, `value`, `note?`, `tone?: "paper" \| "ink"` / `label`, `pct`, `tone?: "ink" \| "gold" \| "muted"`, `max?` / `n`, `title`, `note?` | Member-Report pieces |
| `ProtectionMeter` | `daysLeft`, `total?` (90), `label?` (replaces the bar: «انتهت بالإفراغ»), `className?` | `role="meter"` |
| `SourceTag`, `AlliancePill`, `StagePill` | `source`, `office?`, `short?` / `tone: PillTone`, `children` / `stage: ReferralStage` | Source tag (sand · ink · outline); word pills; referral stage pill (معاينة gold · تفاوض ink · إفراغ outline) |
| `Tbc` | `text?`, `className?` | «[للتأكيد]» through the public `Mark` (hidden with `?marks=0`) |
| `A` | anchor props + `href` | `next/link` for internal paths, `<a>` otherwise |
| `lib` | `SECTOR_ORDER`, `SECTOR_LABELS`, `REFERRAL_STAGES`, `REFERRAL_STAGE_WORD`, `REFERRAL_STAGE_INDEX`, `APPLICATION_STEPS`, `REQUEST_STAGE_WORD`, `SOURCE_WORD(_SHORT)`, `LEDGER_NET_WORD`, `PROTOTYPE_TODAY`, `fmtReply(min)` («1 س 40 د»), `daysLabel(n)`, `fmtShort(n)` («2.2M»), `budgetLabel(min?, max?, short?)`, `membersLabel`, `officesCount`, `unitsLabel`, `ledgerNet`, `ledgerNetLine`, `addDays`, `daysBetween`, `protectionDaysLeft`, `normalizeAr`, `chunk` | |

## Decisions and known differences

- Hexagon borders are real hexagonal rings (two clip-path layers). The boards draw them with an inset box-shadow that the
  clip-path cuts, which renders as two horizontal lines; the sheets' written rule («الحالات بالحدّ») is followed instead.
- Cut sizes normalise to the tokens: the door's «big cut» is `cut-l`, small CTAs `cut-s`, the member banner uses the 60°
  bottom-left cut (12 × 21).
- Cell text: 11px label / 10px numbers at 84px, 10px / 9px at 60px (the sheets use 10/9 and 9/8; the token minimum is 11).
- The ledger net line for takers and balanced members («مستقبِل أكثر مما يعطي · …», «متوازن · …») follows the pattern of the
  giver line on Member-Ledger-M; the sheet only writes the three words.
- `Tbc` wraps `components/ui` `Mark`; `ReferralReceipt` takes its brand mark from `LogoMark` (override with `mark`).
