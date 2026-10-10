# components/map

The maps of the prototype, per the 2026-10-10 amendment in `docs/BRIEF.md`: no map library, no API key, ever. Three pieces:

- `SchematicMap` · the results map view (Results-Map-M/D) as an interactive SVG with hexagon pins.
- `PinPicker` · the same drawing with one draggable hexagon pin, plus the «ألصق رابطاً» mode and coordinate fields.
- `MapEmbed` · a keyless Google Maps iframe behind the board's schematic drawing, framed on the container.

Everything is token-driven (`styles/tokens.css` through Tailwind), hexagons are `hex-flat` / `hex-point` clip-paths, no radius, no shadows (the board's inset box-shadow ring is a nested hexagon), Western digits with `tnum`, RTL first with logical properties. Rendered for QA at `/demo/components#map` (`components/map/_styleguide.tsx`).

Import from `@/components/map`.

## SchematicMap

```tsx
import { SchematicMap, type MapPin } from "@/components/map";

const pins: MapPin[] = [
  { id: "rwd-01", districtSlug: "rawdah", kind: "available", count: 7, label: "جاردن الروضة" },
  { id: "owner-safa", districtSlug: "safa", kind: "owner", count: 1, label: "من مالك · الصفا" },
  { id: "abh-01", districtSlug: "obhur-north", kind: "soon", label: "مشروع أبحر" },
];
<SchematicMap pins={pins} selectedId={pin} onSelect={(id) => setQuery({ pin: id })} className="h-[420px] md:h-[640px]" />
```

The page computes `count` from the fixtures and decides what a tap opens: a bottom sheet on the phone, the side card or the popover on desktop (`renderPopover`). The board's provider note is not rendered; the legend is the board's text without it.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `pins` | `MapPin[]` | required | `{ id, districtSlug? \| x?,y? \| latLng?, count?, kind: 'available' \| 'owner' \| 'soon', label, ariaLabel? }`. `districtSlug` uses the board's pin position for that district; `x`/`y` are desktop viewBox units (0…1000 × 0…800) scaled proportionally on the phone drawing; `latLng` goes through the fit |
| `selectedId` | `string \| null` | — | the pressed pin: bigger hexagon with the ink ring, `aria-pressed` |
| `onSelect` | `(id, pin) => void` | — | pins are `<button>`s with an accessible name (`label · 7 وحدات` / `label · قريباً`) |
| `showLabels` | `boolean` | `true` | the district labels the board draws (الروضة، الصفا، أبحر الشمالية، النعيم، الشاطئ; the phone board has no الشاطئ) |
| `showZoom` | `boolean` | `true` | two square 44px buttons «تكبير» / «تصغير», bottom end side; 1 → 2.5 in steps of 0.5, 120 ms (`--smq-motion-hover`), disabled at the ends |
| `zoomOrigin` | `'center' \| 'selected'` | `'center'` | the zoom scales the drawing around the region's centre (the brief); `'selected'` keeps the selected pin in place instead |
| `legend` | `string \| null` | `DEFAULT_LEGEND` | the white chip at the bottom start side; `null` hides it |
| `regionLabel` | `string` | — | the white chip at the top start side (phone board: «جدة · شمال وسط») |
| `onLocate` | `() => void` | — | renders the phone board's «موقعي» button (44px, crosshair) under the zoom buttons |
| `variant` | `'auto' \| 'phone' \| 'desktop'` | `'auto'` | `auto` renders the phone drawing below `md` and the desktop drawing from `md` (both in the DOM, one visible) |
| `initialZoom` | `number` | `1` | |
| `renderPopover` | `(pin) => ReactNode` | — | rendered under the selected pin with the ink pointer, clamped inside the region |
| `popoverWidth` | `number` | `360` | the board's card width |
| `ariaLabel` | `string` | `"خريطة النتائج"` | the region's name |
| `className` | `string` | — | give it a height; the region is `relative overflow-hidden bg-slot` |
| `children` | `ReactNode` | — | extra overlays positioned by the caller |

Exports beside the component: `DEFAULT_LEGEND`, `ZOOM_MIN` (1), `ZOOM_MAX` (2.5), `ZOOM_STEP` (0.5), types `MapPin`, `SchematicMapProps`.

## PinPicker

```tsx
// أضف عقارك step 1 (Add-Step1-M): snaps to the chosen district, «موقعي الحالي», hint «اختياري · اسحب الدبوس»
<PinPicker districtSlug={district} locateButton onChange={(v) => setPin(v)} />
// alliance application step 1 (AllianceApply-Step1-M): the tab row, the link field, the 110px preview box
<PinPicker districtSlug={district} showModeTabs defaultMode="link" height={110} gridSize={24} pinSize="s" onChange={setPin} />
// admin project editor / site settings: coordinate fields with seven decimals
<PinPicker latLng={project.centre} coordinateFields="below" gridSize={30} hint="اسحب الدبوس أو أدخل الإحداثيات" onChange={(v) => patch({ centre: { lat: v.lat, lng: v.lng } })} />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `{ x, y } \| null` | — | controlled position in desktop viewBox units |
| `latLng` | `{ lat, lng } \| null` | — | or a controlled location, converted through the fit |
| `onChange` | `(v: { x, y, lat, lng }) => void` | — | fires on drag, tap-to-place, arrow keys, «موقعي الحالي», a parsed link and the coordinate fields |
| `districtSlug` | `string` | — | with no value: the pin snaps to that district's board position (or its centre through the fit) and re-snaps when the slug changes |
| `mode` / `onModeChange` / `defaultMode` | `'pin' \| 'link'` | `'pin'` | «ضع دبوساً» / «ألصق رابطاً»; controlled or internal |
| `showModeTabs` | `boolean` | `false` | the `role=tablist` row of the alliance board (active tab ink, 38px) |
| `link` / `onLinkChange` / `defaultLink` | `string` | `""` | the `type=url` field (dir ltr, text right-aligned, placeholder `https://maps.app.goo.gl/…`) |
| `height` | `number` | `150` | box height in px (alliance preview 110) |
| `window` | `ViewWindow` | `PICKER_WINDOW` | the crop of the drawing shown, default the upper half `{0,0,1000,400}` where الروضة, الفيصلية and the office sit |
| `hint` | `string` | `PICKER_HINT` | the white chip in pin mode («اختياري · اسحب الدبوس») |
| `previewHint` | `string` | `PICKER_PREVIEW_HINT` | the chip once a link is recognised («معاينة الرابط · الدبوس يُضبط من الرابط تلقائياً») |
| `locateButton` | `boolean` | `false` | «موقعي الحالي» (bottom start side; the chip moves to the end side): browser geolocation, the office as the canned fallback |
| `coordinateFields` | `boolean \| 'above' \| 'below'` | `false` | «خط العرض» / «خط الطول» inputs, 7 decimals, `dir=ltr`, `inputMode=decimal`; typing moves the pin, the pin updates the fields (`true` = below) |
| `showLabels` | `boolean` | `false` | district labels inside the window (the boards show none in the pickers) |
| `showRoads` | `boolean` | `true` | the schematic strokes under the grid |
| `gridSize` | `number` | `28` | grid cell in px (boards: 28 add · 24 alliance · 30 site settings) |
| `pinSize` | `'m' \| 's'` | `'m'` | 26 × 30 or 22 × 26 hexagon |
| `disabled` | `boolean` | `false` | |
| `ariaLabel` | `string` | `"موقع العقار على الخريطة"` | the box is a labelled `group` (a `tabpanel` named by the active tab when `showModeTabs`); the pin button is named «الدبوس · <district> · اسحب أو استخدم الأسهم» |
| `className` | `string` | — | |

Interaction: pointer events with capture (mouse, pen, touch; `touch-action: none` on the box), pressing anywhere on the box places the pin there and keeps dragging, arrow keys move 1 % of the window (5 % with Shift), the pin's hit area is 44 × 44. Link mode: a full Google Maps link, a `geo:` URI or a plain `lat, lng` pair moves the pin and shows the preview chip; a short link (`maps.app.goo.gl`, `goo.gl/maps`) keeps the pin, shows the preview chip and echoes the link under the box; other text shows «لم نتعرّف على الرابط» in gold (the only line not on a board). Values are clamped to the window, so a location far from الروضة sits on the edge of the drawing.

Exports beside the component: `PICKER_HINT`, `PICKER_PREVIEW_HINT`, `PICKER_LINK_PLACEHOLDER`, `PICKER_UNKNOWN`, types `PinPickerProps`, `PinPickerMode`, `PinPickerChange`, `LinkState`.

## MapEmbed

```tsx
// Contact and the Home contact block
<MapEmbed lat={settings.office.lat} lng={settings.office.lng} title="خريطة مكتب SMQ" placeholder="office" forceEmbedUrl={settings.office.embedUrlAr || undefined} />
// Project: district-level zoom, the chip beside the map
<MapEmbed lat={district.centre.lat} lng={district.centre.lng} zoom={PROJECT_ZOOM} title="خريطة موقع جاردن الروضة" placeholder="project" label={<>الموقع تقريبي <Mark /></>} />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `lat`, `lng` | `number` | required | |
| `zoom` | `number` | `OFFICE_ZOOM` (17) | street level; the project passes `PROJECT_ZOOM` (14, district level) |
| `lang` | `'ar' \| 'en'` | `'ar'` | `hl=` of the embed; `/en` passes `en` |
| `title` | `string` | required | the iframe's accessible name |
| `label` | `ReactNode` | — | chip text rendered outside the iframe, in the row under the frame (e.g. «الموقع تقريبي» + the `Mark` chip) |
| `placeholder` | `'office' \| 'project'` | required | the board's schematic drawing shown until the iframe loads, and forever if it does not |
| `placeholderChip`, `placeholderCaption`, `placeholderCaptionShort` | `ReactNode` | board copy | the drawing's white chip and ink caption («خريطة Google · مكبّرة على الشارع، لا على المدينة» / «مكتب SMQ · شارع السيدة خديجة، حي الفيصلية», phone «مكتب SMQ · شارع السيدة خديجة»; «خريطة Google بموقع المشروع» / «جاردن الروضة») |
| `forceEmbedUrl` | `string` | — | Google's own «Embed a map» URL once the client pastes it (site settings `embedUrlAr` / `embedUrlEn`) |
| `directionsHref` | `string` | — | renders «افتح الاتجاهات في الخرائط» as a normal anchor under the frame (full width below `md`); pages that put the link in a heading omit it |
| `directionsLabel` | `string` | `DIRECTIONS_LABEL` | |
| `frameClassName` | `string` | per kind | height classes of the frame (office `h-[220px] md:h-[380px]`, project `h-[200px] md:h-[320px]`) |
| `className` | `string` | — | the outer column |

Behaviour: the placeholder renders at once; the iframe (`src=https://maps.google.com/maps?q=LAT,LNG&z=ZOOM&hl=LANG&output=embed`, `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`, `allowFullScreen={false}`, `title`) mounts when the frame scrolls within 200px of the viewport (IntersectionObserver) and only while `navigator.onLine` is not `false`; the placeholder stays above it until the iframe's `load` event; an `error` or no `load` within 8 s (`EMBED_TIMEOUT_MS`) keeps the placeholder for good. `data-map-state` on the frame reads `idle | loading | loaded | failed | offline`. The frame (`MapFrame`) is a stroke-only overlay with `pointer-events: none`: a 1.5px ink border whose top start corner is cut (`cut-m`, mirrored under `dir=ltr`) plus the diagonal stroke; nothing covers the iframe, so Google's logo (bottom left) and controls stay visible. Before the iframe loads the placeholder itself is clipped with the cut so the corner reads as designed.

Exports beside the component: `MapFrame`, `embedUrl(lat, lng, zoom, lang)`, `OFFICE_ZOOM`, `PROJECT_ZOOM`, `EMBED_TIMEOUT_MS`, `DIRECTIONS_LABEL`, type `MapEmbedProps`.

## Placeholders and pins

- `OfficeDrawing`, `ProjectDrawing` · `{ className?, opacity? = 0.6 }` · the bare line drawings from Contact-D/M and Project-D/M (phone SVG below `md`, desktop from `md`), absolutely positioned to fill a `relative` parent.
- `MapPlaceholder` · `{ kind: 'office' | 'project', chip?, caption?, captionShort?, className? }` · drawing + white chip (top start) + gold `hex-point` marker over the ink caption; `OfficePlaceholder` and `ProjectPlaceholder` fix the kind. Copy constants: `OFFICE_CHIP`, `OFFICE_CAPTION`, `OFFICE_CAPTION_SHORT`, `PROJECT_CHIP`, `PROJECT_CAPTION`.
- `HexPin` · `{ kind, count?, size? = 52, textSize? = 15, selected?, className? }` · the results-map hexagon (gold + ink count; white + 2px ink ring for `owner` / `soon`; `selected` adds the outer ring). Decorative (`aria-hidden`): put it inside a labelled button.
- `PinMarker` · `{ width? = 26, height? = 30, shape? = 'flat' | 'point', className? }` · the small gold marker.
- `SchematicDrawing` · `{ variant?, window?, grid?, showRoads?, roadsOpacity?, className?, style? }` · the grid pattern (`--smq-line`, in CSS px) and the coastline/road strokes (`--smq-on-ink-muted`, stretched with `preserveAspectRatio="none"` as the boards do).

## geometry.ts

- `DESKTOP`, `PHONE` (`SchematicGeometry`): viewBox (1000 × 800 · 390 × 420), the board's paths and stroke widths, grid cell (48 · 40), `labels` per district slug (`{ x, y, anchor }`, the text's top edge and anchored edge) and `pins` per slug (hexagon centres: the board's three pins; النعيم and الشاطئ derived under their labels), and the `fit`.
- `getGeometry(variant)`, `fullWindow(variant)`, `PICKER_WINDOW`, `clampToWindow(p, window, margin = 0.03)`, `scalePoint(p, variant)`.
- `districtPin(slug, variant = 'desktop')` · the board's pin, else the district centre through the fit (clamped), else the centre of the drawing. `districtLabel(slug, variant)` · only where the board labels it. `districtRef(slug)` and `DISTRICTS` · a local copy of docs/data-model.md «Districts» (slug, Arabic, sector, centre) until `data/districts.ts` lands.
- `latLngToSvg(ll, variant = 'desktop', clamp = true)` and `svgToLatLng(p, variant = 'desktop')` · the linear fit. `formatCoord(n)` · seven decimals.
- `OFFICE` (21.5604526, 39.1811231) and `RAWDAH_CENTRE` (21.572, 39.168).
- `parseMapsLink(text)` → `{ lat, lng } | null` · reads `!3d…!4d…`, `/maps/place|search|dir/…/lat,lng`, `?q=` / `query=` / `ll=` / `center=` / `destination=` (`loc:` accepted), `/@lat,lng`, `geo:lat,lng` and a plain `lat, lng` pair (Arabic comma too); validates ranges; short links return `null`. `isMapsLink(text)` · recognises full and short Google Maps links and `geo:` URIs. Unit-tested with a throwaway script (deleted).

The fit (documented at the end of `geometry.ts`): axis-aligned, north up, east right, from two anchor districts: الروضة's centre lands exactly on its board pin; أبحر الشمالية's board pin fixes the longitude scale (11937.5 units per degree on the desktop drawing, 3791.7 on the phone); the latitude scale keeps the same metres per unit (× 1.0755) instead of the board's twelve-to-one north-south compression, so dragging a pin reads as plausible coordinates. The board's other labels are schematic, so their districts' centres do not land on their labels; `latLngToSvg` clamps to the drawing. Pins placed by `districtSlug` never depend on the fit.

## Known gaps

- Copy at 10px on the phone boards (chips, «قريباً») is rendered at the 11px caption token, the sheet's minimum.
- The board's second zoom button has no top border with a 6px gap; both buttons keep their full 1.5px border.
- Pin pickers crop the drawing to its upper half; a pasted location far from الروضة (e.g. أبحر الشمالية) sits on the edge of the box.
- `/demo/components#map` uses a local stand-in for the `Mark` chip until `components/ui` exports it; the sample counts are the board's illustrative numbers, the pages compute theirs from the fixtures.
