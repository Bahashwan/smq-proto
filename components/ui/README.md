# components/ui · public component library

Import everything from `@/components/ui`. Tokens only (the Tailwind utilities of `docs/BUILD-CONTRACTS.md`), zero radius, no shadows, no gradients; gold carries ink text; errors are gold; status is carried by shape and word; Western digits with tabular numerals; RTL first with logical properties so `/en` mirrors through `dir="ltr"`. Every interactive element is ≥ 44px tall (chips 32–38px by design). Hover 120ms (`motion-hover`), sheets 200ms (`motion-sheet`), reduced motion handled by the CSS variables. The QA page `/demo/components` (`_styleguide.tsx`) renders every component in every state in the order of the Components sheet.

Copy rules: components never type a number; pass values computed from `data/*` with `data/selectors.ts`. Money renders through `<Price />`; `[للتأكيد]` / `[مسودة إجابة]` through `<Mark />` or `<MarkedText />`.

Client components (`"use client"`): Chip/Segmented/Tabs/CompareToggle/Switch, the fields, Stepper, Mark, GalleryThumbs, UnitCard, CompareBar, BottomSheet, Header, EnHtmlAttrs, HeroFinder and the hooks. The rest (Button, Status, PriceBand, Rows, Notice, ImageSlot, Skeleton, Footer, LicenceLine, Layout, Brand, icons) render on the server too.

## Money and signs

| Export | Props |
|---|---|
| `RiyalSign` | `className?` · inline SVG at 0.75em, currentColor, `aria-label="ريال سعودي"` |
| `Price` | `value: number` · `sign?: boolean` (default true) · `className?` · `signClassName?` (sign colour, e.g. `text-gold`) · renders `dir="ltr"`, 0.25em gap, tabular numerals |

## Buttons (sheet §1)

| Export | Props |
|---|---|
| `Button` | `variant?: "primary" \| "secondary" \| "ghost" \| "whatsapp" \| "link"` (default primary: gold + ink text; secondary: ink + white, pass `arrow` for the gold arrow; ghost: 1.5px ink outline; whatsapp: gold with the glyph; link: gold text, hover ink + underline) · `size?: "s" \| "m" \| "l"` (40 / 48–52 / 56px; cut-s on s, cut-m on m and l) · `href?` (internal → `Link`, external/tel/wa → `<a target=_blank>`) · `arrow?` · `icon?: ReactNode` · `loading?` (pulsing ink hexagon + `aria-busy`) · `disabled?` (sand + disabled text) · `full?` · `between?` (label at the start, arrow at the end) · `state?: "hover" \| "focus"` (QA only) · `className?` · every native button/anchor attribute (`type`, `onClick`, `aria-*`) |
| `IconButton` | `label: string` (required aria-label) · `size?: 40 \| 44 \| 48 \| 56 \| 64` · `tone?: "gold" \| "ink" \| "paper" \| "ghost-ink" \| "ghost-paper"` (ghost tones draw the ring as a nested hexagon) · `href?` · `onClick?` · `disabled?` · `type?` · `className?` · `children` (icon) |

## Chips and switches (sheet §2)

| Export | Props |
|---|---|
| `Chip` | `active?` (aria-pressed, filled ink) · `href?` or `onClick?` · `disabled?` · `size?: "m" \| "s"` (38 / 34px) · `cut?` (cut-s on the selected chip) · `onColour?` (transparent background on the gold hero) · `state?` (QA) · `aria-label?` · `className?` · `children` |
| `FilterChip` | `children` · `onRemove?` or `href?` · `className?` · 32px, sand, `×` with `aria-label="إزالة"` |
| `Segmented<T>` | `options: {value, label, disabled?}[]` · `value` · `onChange(value)` · `label: string` (group aria-label) · `stretch?` · `size?: "m" \| "s"` · `className?` |
| `Tabs` | `items: {label, href? \| onClick?, active?, id?, state?}[]` · `label: string` · `size?: "m" \| "l"` · `className?` · 1.5px ink rule, active = 3px gold rule |
| `CompareToggle` | `checked` · `onChange?(checked)` · `disabled?` · `full?` («ممتلئة (3/3)») · `unavailable?` (reserved/sold: disabled box, `aria-label="غير متاح للمقارنة"`) · `size?: "s" \| "m" \| "l"` (44 / 46 / 50px) · `lang?` · `className?` |
| `Switch` | `checked` · `onChange(checked)` · `label?` (the word beside the switch) · `aria-label?` · `disabled?` · `className?` · hexagon knob: gold at the line end = on |

## Fields (sheet §3, Contact-Error-M rules)

All fields: label 11/600 muted (gold when focused or in error), control 48px with the 1.5px ink frame, focus = gold frame on cream-focus, error = `border-error` (2px gold + cream-focus) with a worded message (`ErrorText`) under the field and `aria-invalid` / `aria-describedby` wired. `required` adds the gold hexagon mark.

| Export | Props |
|---|---|
| `TextField` | `label?` · `hint?` · `error?` · `required?` · `ltr?` (phone numbers: `dir=ltr`, digits right-aligned) · `size?: "m" \| "s"` · `state?: "focus"` (QA) · `trailing?` (node at the label's line end) · `wrapperClassName?` · `id?` · every input attribute; forwards its ref |
| `SelectField` | same shell props · `options?: {value, label, disabled?}[]` or `<option>` children · `placeholder?` · native select with the chevron; forwards its ref |
| `TextArea` | same shell props · `rows?` (4) · `maxLength?` + `counter?` (default true: «62 / 600» at the label end) · forwards its ref |
| `Checkbox` | `label: ReactNode` · `error?` · `hint?` · `framed?` (1.5px frame around the row, error frame when `error`) · `wrapperClassName?` · input attributes; forwards its ref |
| `RadioGroup<T>` | `name` · `label` · `options: {value, label, disabled?}[]` · `value: T \| null` · `onChange(value)` · `variant?: "tiles" \| "list"` (tiles: bordered cells, selected = ink) · `columns?: 2 \| 3 \| 4` · `error?` · `hint?` · `required?` · `className?` |
| `Radio` | one option: `label` · `variant?` · `checked` · `disabled?` · input attributes |
| `ErrorSummary` | `title: ReactNode` («لم تُرسل الرسالة. حقلان يحتاجان تصحيحاً:») · `errors: {id, label}[]` (each line focuses the field with that id) · `autoFocus?` (default true: takes focus when errors appear/change) · `className?` · `role="alert"` |
| `ErrorText` / `Hint` | `children` · `id?` · `className?` |
| `FieldShell` | `id` · `label?` · `hint?` · `error?` · `required?` · `disabled?` · `state?` · `as?: "label" \| "div"` · `trailing?` · `children` (custom controls) |
| `fieldControlClass` | `({error?, disabled?, state?, size?}) => string` for custom inputs |
| `Stepper` | `value` · `onChange(value)` · `min?` (100,000) · `max?` (5,000,000) · `step?` (fixed; default the budget rule: 50,000 up to a million then 100,000) · `label?` («الميزانية») · `decLabel?` / `incLabel?` · `size?: "m" \| "l"` (price-s / price) · `sign?` (riyal sign before the figure) · `onGold?` · `id?` · `className?` · typed values format on blur, Enter commits, arrow keys step |
| `RangeSlider` | `value` · `onChange(value)` · `min` · `max` · `step?` (10,000) · `label` · `className?` · gold pointed-hexagon knob over a native range input |
| `budgetStep(value, direction)` · `BUDGET_MIN` · `BUDGET_MAX` | the stepper rule and limits |

## Badges and status (sheet §4)

| Export | Props |
|---|---|
| `StatusBadge` | `status: "available" \| "reserved" \| "sold" \| "soon" \| "owner"` → gold hexagon «متاح», white hexagon with the ink ring «محجوز», ink hexagon «مباع», white ring «قريباً» / «من مالك» · `size?: 40 \| 52 \| 54` · `lang?` (EN: For sale / Reserved / Sold) · `className?` (position it: `absolute top-3 start-3`) |
| `StatusDot` | `tone?: "gold" \| "ink" \| "paper" \| "muted" \| "line"` · `size?: 2 \| 2.5 \| 3 \| 3.5 \| 4` (8–16px) · `pulse?` · `className?` · pointed hexagon, `aria-hidden` |
| `Pill` | `tone?: "ink" \| "outline" \| "sand" \| "gold" \| "line" \| "gold-outline" \| "muted-outline"` · `delta?` (ink with gold text: «+6 وحدات») · `children` · `className?` |
| `CountBadge` | `children` (gold, min 20px) |
| `Tag` | `children` · `size?: "s" \| "m"` · hairline feature tag («غرفة خادمة») |
| `BuildingTag` | `children` · `href?` · `className?` · ink tag with the cut on its line-end side; place at `absolute bottom-0 end-0` of an image |
| `IllustrativeLabel` | `lang?` · `size?: "s" \| "m"` · `className?` · the white «صورة تعبيرية» label |

## Price band (sheet §5)

| Export | Props |
|---|---|
| `PriceBand` | `price` · `ppm?` (or `area?` to compute it) · `variant?: "dark" \| "reserved" \| "sold"` · `size?: "s" \| "m" \| "l"` (h2 / price-s / price) · `ppmLabel?` (default «للمتر المربع»; cards use «للمتر») · `soldLabel?` («بيعت 2026/09») · `cut?` (cut-l block on the unit page) · `stacked?` (figure above its label, as the B-Card) · `children?` · `className?` |

## Rows, accordion, headings (sheet §6)

| Export | Props |
|---|---|
| `RowGroup` | `children` · `header?: ReactNode[]` · `columns?` (CSS grid template) · `framed?` (default true: 1.5px ink frame; false: top rule + hairlines) · `aria-label?` · `className?` |
| `Row` | grid row: `cells: ReactNode[]` · or key/value: `label` + `value` + `tbc?` (adds the chip) · `href?` / `onClick?` (hover sand) · `muted?` · `columns?` · `divider?` (default true) · `state?` (QA) · `className?` |
| `Accordion` | `items: {id, q, a, draft?, defaultOpen?}[]` · `onToggle?(id, open)` · `className?` · `<details>`; hexagon ring «+» → gold «−» |
| `Breadcrumb` | `items: {label, href?}[]` (last = current page) · `label?` («المسار») · `className?` |
| `Eyebrow` | `children` · `onInk?` · `onGold?` · `as?` · `className?` |
| `SectionHeading` | `title` · `link?: {label, href}` · `size?: "s" \| "m" \| "l"` · `as?: "h1" \| "h2" \| "h3"` · `eyebrow?` · `description?` · `onInk?` · `id?` · `className?` |
| `HexNumber` | `children` («01»…«05») · `tone?: "gold" \| "ink" \| "ink-2"` · `size?: 32 \| 40 \| 48 \| 56` · `className?` |
| `LoadMore` | `label` («عرض 3 وحدات أخرى») · `onClick` · `done?` → «هذه كل الوحدات» (`doneLabel?`) · `className?` |

## Marks and notices

| Export | Props |
|---|---|
| `Mark` | `children` («[للتأكيد]» or «[مسودة إجابة]», brackets stripped) · `className?` · returns null when `useMarks()` is false |
| `MarkedText` | `text: string` → the text with every `[للتأكيد]` / `[مسودة إجابة]` token as a chip · `className?` |
| `MARK_RE` | the token regex |
| `Notice` | `tone?: "ink" \| "sand" \| "gold"` · `children` · `action?: {label, href}` · `aside?` · `role?: "status" \| "alert" \| "note"` · `className?` · inline notice (floating toasts: `useStore().toast()` + `components/presenter/Toasts.tsx`) |

## Images (sheet §7, Unit-Tier boards)

| Export | Props |
|---|---|
| `ImageSlot` | `slotId` · `tier: "generated" \| "real" \| "typographic"` · `ratio?: "3:2" \| "16:9" \| "4:5" \| "1:1" \| "21:9" \| "2:3"` (or set a height class) · `src?` / `realSrc?` (file for the real or generated tier; without it the real tier draws the neutral ink frame with no label and the generated tier the placeholder drawing) · `alt?` · `label?` (default true: «صورة تعبيرية» on generated) · `showId?` (default true: «IMG-… · 3:2» line) · `cut?: "none" \| "img" \| "img-l" \| "xl"` · `compact?` (thumbnails/strips: small label, compact typographic tile «A · شقة · 3 غرف · 147 م²») · `unit?: {model, buildingNameAr, areaM2, beds, baths, floor?, orientation?, typeAr?}` (typographic tile: «نموذج A · روز», big area, rooms/baths/floor, «الصور تُنشر بعد التصوير») · `sold?` (desaturated / faded) · `lang?` · `children` (overlays: `StatusBadge`, `BuildingTag`) · `className?` · `as?: "figure" \| "div"` |
| `PlaceholderDrawing` | `tone?: "slot" \| "ink"` · `className?` · the neutral skyline strokes |
| `GalleryThumbs` | `items: {slotId, label, short?, src?}[]` (three thumbs) · `active` · `onSelect(i)` · `tier` (typographic → number tiles beds / baths / orientation) · `planHref?` · `planLabel?` («المخطط») · `unit?: {beds, baths, orientation?}` · `className?` |

## Cards and compare (B-Card, State-Cards, sheet §8)

| Export | Props |
|---|---|
| `UnitCard` | `unit: Unit` · `href?` (default `/units/<slug>`) · `projectName?` / `projectHref?` («جاردن الروضة · روز» tag) · `districtName?` («حي الروضة، جدة · الطابق … · واجهة …» line) · `deliveryLabel?` · `floorLabel?` / `orientationLabel?` (default: `floorWord(unit.floor.value)` «3» → «الثالث», `orientationWord(unit.orientation.value)` «شمالي» → «شمالية») · `status?: UnitStatus` (effective status: store override ?? fixture; defaults to `unit.status`) · `fromOwner?` («من مالك» badge) · `tier?` (presenter image tier; default `unit.imageTier`) · `src?` · `compare?: {checked, disabled?, full?, onChange(checked)}` (omit to hide) · `variant?: "full" \| "results"` (full = the B-Card with spec cells and feature tags; results = the list card) · `showUpdated?` («آخر تحديث …») · `waText?` (default: «أرغب بالاستفسار عن … · CODE · SMQ-XXXXX» with the visitor code) · `lang?` · `className?`. Sold units render the shrunken reference card (line frame, faded image, ink badge, struck price, «بيعت …», «للمرجع فقط», «أبلغني عند توفر مشابه»); reserved units the full card with the ring badge, «محجوز حتى …», ink-2 band, «أبلغني إن أُلغي الحجز» and the disabled compare box |
| `CompareBar` | `nameOf?(slug) => string` (desktop names line) · `slugs?` (override; default the store) · `fixed?` (viewport-fixed instead of sticky at the content end) · `href?` (default `compareUrl(slugs)`) · `lang?` · `className?` · hidden with no selection |
| `useCompare()` | `{ slugs, count, max, isFull, has(slug), add(slug), remove(slug), toggle(slug), clear() }` · store list mirrored to localStorage `smq.compare` for 7 days |
| `setCompare(slugs)` · `readStoredCompare()` · `writeStoredCompare(slugs)` · `COMPARE_MAX` (3) · `COMPARE_KEY` · `COMPARE_TTL_MS` | helpers |

## Overlays and loading

| Export | Props |
|---|---|
| `BottomSheet` | `open` · `onClose` · `title?` · `actions?` (header nodes before the × button) · `children` · `footer?` · `desktop?: "sheet" \| "dialog"` (centred 560px dialog from md) · `size?: "auto" \| "full"` · `closeLabel?` · `portal?` (default true) · `labelledBy?` · `className?` · 200ms slide, ink scrim, focus trap, Esc, scrim click, body scroll lock, focus restored |
| `Skeleton.Block` / `SkeletonBlock` | `w?` / `h?` (px or class) · `tone?: "slot" \| "sand"` · `cut?` · `className?` |
| `Skeleton.Lines` | `n?` · `className?` |
| `Skeleton.Card` | `actions?` · `className?` · the results-card skeleton |
| `Skeleton.Status` | `children` («نبحث في الوحدات المتاحة…») · pulsing gold marker, `role=status` |
| `Skeleton.Filters` | the filter row skeleton |

## Shell (HeaderFooter, Header-Scrolled-D)

| Export | Props |
|---|---|
| `Header` | `variant?: "ar" \| "en"` · `showEn?` (the language switch: only on `/`, `/units`, `/units/[code]` and their `/en` twins) · `transparent?` (overlay the hero until scrolled) · `switchHref?` (computed from the path when omitted) · `active?` (force the active nav item) · `demo?: "default" \| "scrolled"` + `withMenu?` (QA) · `className?`. Sticky 72px ink bar (64px on the phone); after 120px: 56px, mark + «SMQ العقارية», phone → icon, 2px gold rule; on the phone it hides on scroll down and returns on scroll up. The menu button and `?menu=1` open the ink sheet from the top (links of the HeaderFooter board, واتساب / اتصال / EN, Esc, focus trap) |
| `Footer` | `variant?: "ar" \| "en"` · `compact?` (the results / unit footer) · `settings?: {phone?, whatsapp?, email?, addressAr?, hoursAr?, licence?: {rega, cr}}` (overrides; the defaults already come from `data/settings`) · `links?: NavItem[]` · `className?` · always carries «ترخيص الهيئة العامة للعقار 1200040135 · السجل التجاري 7029797433» and the © line |
| `LicenceLine` | `variant?` · `licence?: {rega, cr}` · `className?` |
| `EnHtmlAttrs` | no props · sets `<html lang="en" dir="ltr">` before paint (inline script) and on mount, restores `ar` / `rtl` on unmount. Use inside the `/en` wrapper `<div dir="ltr" lang="en" className="font-latin">` |
| `Container` | `children` · `as?` · `className?` · `container-smq` |
| `PhoneColumn` | `children` · `framed?` · `className?` · centred 390px column for 390-only boards |
| `WhatsAppLink` | `text?` (prefilled message) · `children` · `icon?` · `aria-label?` · `className?` · plain anchor through `waLink()` |
| `Lockup` | `tone?: "goldmark-white" \| "white" \| "goldmark-ink" \| "ink" \| "wordmark-ink" \| "wordmark-white"` · `height?` (24–44; 24 · 26 · 28 · 30 · 32 · 36 · 40 · 44 become height classes so `className="lg:h-9"` can override) · `lang?` · `decorative?` · `className?` |
| `LogoMark` | `size?` · `decorative?` · `lang?` · `className?` · the gold mark alone |

## Hero / finder (B-Hero)

| Export | Props |
|---|---|
| `HeroFinder` | `budget: BudgetBlockProps` · `answer: AnswerBlockProps` · `pickers?: ReactNode` (two `SelectButton`s) · `cta: {label, href}` (secondary button with the gold arrow) · `footnote?` · `className?` |
| `BudgetBlock` | `eyebrow?` · `title` («كم ميزانيتك؟») · `description?` · `value` · `onChange(value)` · `presets?: {label, value}[]` (chips) · `as?: "h1" \| "h2"` · `size?: "m" \| "l"` (stepper) · `titleSize?: "h1" \| "display"` · `children?` · `className?` · gold cut-xl block |
| `AnswerBlock` | `count` · `countLabel` («وحدات متاحة») · `line` («ضمن ميزانيتك في حي الروضة») · `fromLabel?` («تبدأ من») · `from?: number` · `ranges?` («غرفتان إلى 3 غرف · 80 إلى 147 م²») · `className?` · ink cut-l block, `aria-live` |
| `SelectButton` | `label` («الحي») · `value` («الروضة») · `onClick?` · `aria-haspopup?` · `className?` |

## Icons, hooks, constants

- Icons (24-unit, currentColor, `size?`, `title?`, `className?`): `WhatsAppIcon`, `ArrowIcon` (points to the line end, mirrors in LTR), `BackArrowIcon`, `ChevronDownIcon`, `PhoneIcon`, `MenuIcon`, `CloseIcon`, `CheckIcon`, `SocialIcon({ id })`.
- Hooks: `useFocusTrap(ref, active, onClose?)`, `useScrollLock(active)`, `useMounted()`, `useVisitorCode()` (SMQ-XXXXX after hydration), `usePresence(open, leaveMs)`.
- Constants (`constants.ts`, contact and licence values read from `data/settings`): `NAV_AR`, `MENU_AR`, `FOOTER_COMPACT_AR`, `NAV_EN`, `SOCIAL`, `PHONE_DISPLAY`, `PHONE_TEL`, `PHONE_EN`, `WA_DISPLAY`, `WA_URL`, `EMAIL`, `ADDRESS_AR`, `HOURS_AR`, `TAGLINE_AR`, `HANDLE`, `SITE`, `LICENCE`, `BRAND_AR`, `BRAND_EN`, `BRAND_SHORT`, `COPYRIGHT_YEAR`, `FEATURE_LABELS` (unit feature flag → chip copy), `isExternalHref(href)`.

## Notes for page agents

- Image files: the real tier takes `realSrc="/real/<slot>.jpg"` only when the page knows the file exists; the generated tier takes `src` once Phase 8 drops files into `public/images/<slot>/`. Never embed a raster yourself.
- The compare checkbox on cards: `compare={{ checked: has(slug), full: isFull, onChange: () => toggle(slug) }}` from `useCompare()`; render `<CompareBar nameOf={…} />` after the list (sticky) and the «ممتلئة» state follows automatically.
- Sticky header + anchors: the header is 56px when scrolled; give in-page targets `scroll-mt-16`.
- Chips on the boards carry no cut (a cut would clip the frame); `cut` is opt-in for filled chips.
- `floorWord(value)` and `orientationWord(value)` are exported for pages that print the same lines.
