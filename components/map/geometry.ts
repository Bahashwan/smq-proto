// Schematic map geometry · copied from design/preview/Results-Map-D.html and Results-Map-M.html.
// No map library and no key anywhere in this folder: the map is a drawing, and lat/lng only pass
// through the linear fit below (see «Fit» at the end of this file).

export type MapVariant = "desktop" | "phone";

export interface XY {
  x: number;
  y: number;
}
export interface LatLng {
  lat: number;
  lng: number;
}
export interface LabelPos extends XY {
  /** `end`: the text's end edge (screen right) sits on x · `start`: the text begins at x. Physical, like the drawing. */
  anchor: "start" | "end";
}
/** A window onto the drawing in viewBox units (the pin pickers show a crop). */
export interface ViewWindow {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface LinearFit {
  lat0: number;
  lng0: number;
  x0: number;
  y0: number;
  /** viewBox units per degree of longitude (east → +x) */
  kx: number;
  /** viewBox units per degree of latitude (north → −y) */
  ky: number;
}
export interface SchematicGeometry {
  viewBox: { w: number; h: number };
  /** coastline / road strokes, in drawing order; `strokeWidth` overrides the default */
  paths: { d: string; strokeWidth?: number }[];
  strokeWidth: number;
  /** grid cell in CSS px (the board draws the grid in screen pixels, not viewBox units) */
  grid: number;
  /** district label positions, only for the districts the board labels */
  labels: Record<string, LabelPos>;
  /** pin centres for the districts the board labels (board pins where they exist, derived otherwise) */
  pins: Record<string, XY>;
  fit: LinearFit;
}

/** District table · slug, Arabic, sector and the approximate centre from docs/data-model.md «Districts».
 *  Local copy until `data/districts.ts` lands; the fixtures owner's file is the source of truth. */
export type Sector = "north" | "central" | "east" | "west" | "south";
export interface DistrictRef {
  slug: string;
  ar: string;
  sector: Sector;
  centre: LatLng;
}
export const DISTRICTS: DistrictRef[] = [
  { slug: "obhur-north", ar: "أبحر الشمالية", sector: "north", centre: { lat: 21.78, lng: 39.12 } },
  { slug: "shati", ar: "الشاطئ", sector: "north", centre: { lat: 21.63, lng: 39.11 } },
  { slug: "dhahban", ar: "ذهبان", sector: "north", centre: { lat: 21.94, lng: 39.12 } },
  { slug: "mohammadiyah", ar: "المحمدية", sector: "north", centre: { lat: 21.64, lng: 39.13 } },
  { slug: "nahdah", ar: "النهضة", sector: "north", centre: { lat: 21.62, lng: 39.16 } },
  { slug: "basateen", ar: "البساتين", sector: "north", centre: { lat: 21.66, lng: 39.15 } },
  { slug: "rawdah", ar: "الروضة", sector: "central", centre: { lat: 21.572, lng: 39.168 } },
  { slug: "safa", ar: "الصفا", sector: "central", centre: { lat: 21.593, lng: 39.202 } },
  { slug: "naeem", ar: "النعيم", sector: "central", centre: { lat: 21.6, lng: 39.17 } },
  { slug: "zahra", ar: "الزهراء", sector: "central", centre: { lat: 21.58, lng: 39.14 } },
  { slug: "salamah", ar: "السلامة", sector: "central", centre: { lat: 21.6, lng: 39.14 } },
  { slug: "khalidiyah", ar: "الخالدية", sector: "central", centre: { lat: 21.56, lng: 39.15 } },
  { slug: "nuzhah", ar: "النزهة", sector: "central", centre: { lat: 21.6, lng: 39.19 } },
  { slug: "naseem", ar: "النسيم", sector: "central", centre: { lat: 21.59, lng: 39.23 } },
  { slug: "harazat", ar: "الحرازات", sector: "east", centre: { lat: 21.63, lng: 39.27 } },
  { slug: "samer", ar: "السامر", sector: "east", centre: { lat: 21.6, lng: 39.26 } },
  { slug: "rehab", ar: "الرحاب", sector: "east", centre: { lat: 21.56, lng: 39.24 } },
  { slug: "ajaweed", ar: "الأجاويد", sector: "east", centre: { lat: 21.58, lng: 39.27 } },
  { slug: "bryman", ar: "بريمان", sector: "east", centre: { lat: 21.67, lng: 39.26 } },
  { slug: "waha", ar: "الواحة", sector: "east", centre: { lat: 21.64, lng: 39.22 } },
  { slug: "hamra", ar: "الحمراء", sector: "west", centre: { lat: 21.53, lng: 39.16 } },
  { slug: "balad", ar: "البلد", sector: "west", centre: { lat: 21.485, lng: 39.187 } },
  { slug: "andalus", ar: "الأندلس", sector: "west", centre: { lat: 21.52, lng: 39.17 } },
  { slug: "ruwais", ar: "الرويس", sector: "west", centre: { lat: 21.53, lng: 39.18 } },
  { slug: "sharafiyah", ar: "الشرفية", sector: "west", centre: { lat: 21.51, lng: 39.19 } },
  { slug: "baghdadiyah", ar: "البغدادية", sector: "west", centre: { lat: 21.5, lng: 39.18 } },
  { slug: "faisaliyah", ar: "الفيصلية", sector: "south", centre: { lat: 21.56, lng: 39.18 } },
  { slug: "muntazahat", ar: "المنتزهات", sector: "south", centre: { lat: 21.44, lng: 39.24 } },
  { slug: "jamiah", ar: "الجامعة", sector: "south", centre: { lat: 21.49, lng: 39.24 } },
  { slug: "sanabel", ar: "السنابل", sector: "south", centre: { lat: 21.42, lng: 39.22 } },
  { slug: "quwaizah", ar: "قويزة", sector: "south", centre: { lat: 21.46, lng: 39.26 } },
  { slug: "kawthar", ar: "الكوثر", sector: "south", centre: { lat: 21.47, lng: 39.29 } },
  { slug: "sawari", ar: "الصواري", sector: "north", centre: { lat: 21.69, lng: 39.11 } },
];
const DISTRICT_BY_SLUG = new Map(DISTRICTS.map((d) => [d.slug, d]));
export function districtRef(slug: string): DistrictRef | undefined {
  return DISTRICT_BY_SLUG.get(slug);
}

/** The SMQ office · شارع السيدة خديجة، حي الفيصلية (docs/BRIEF.md amendments). */
export const OFFICE: LatLng = { lat: 21.5604526, lng: 39.1811231 };
/** The project location used by the Project page: the centre of حي الروضة (approximate, «الموقع تقريبي»). */
export const RAWDAH_CENTRE: LatLng = { lat: 21.572, lng: 39.168 };

// ─── Desktop · Results-Map-D (map region 1020 × 870 px, SVG viewBox 1000 × 800, preserveAspectRatio none) ───
// Board positions are CSS pixels on a 1020 × 870 region; they were converted with × 1000/1020 and × 800/870.
// Pins: the hexagon centre (board: top/right or top/left of a 60/52 px hexagon). Labels: the text's top edge
// and its anchored edge (board `right:` → anchor end, `left:` → anchor start).
export const DESKTOP: SchematicGeometry = {
  viewBox: { w: 1000, h: 800 },
  strokeWidth: 4,
  grid: 48,
  paths: [
    { d: "M0 220 C 200 180, 400 300, 620 240 S 900 160, 1000 200" },
    { d: "M160 0 C 180 240, 120 520, 200 800" },
    { d: "M0 560 C 300 520, 600 640, 1000 560" },
    { d: "M700 0 C 660 260, 760 540, 700 800" },
    { d: "M420 0 C 440 300, 400 600, 460 800", strokeWidth: 2 },
  ],
  labels: {
    rawdah: { x: 843, y: 83, anchor: "end" }, // top 90 · right 160
    safa: { x: 588, y: 386, anchor: "end" }, // top 420 · right 420
    "obhur-north": { x: 118, y: 55, anchor: "start" }, // top 60 · left 120
    naeem: { x: 745, y: 589, anchor: "end" }, // top 640 · right 260
    shati: { x: 216, y: 276, anchor: "start" }, // top 300 · left 220
  },
  pins: {
    rawdah: { x: 765, y: 166 }, // «7» · top 150 · right 210 · 60 px
    safa: { x: 602, y: 456 }, // «1» · top 470 · right 380 · 52 px
    "obhur-north": { x: 192, y: 125 }, // «قريباً» · top 110 · left 170 · 52 px
    naeem: { x: 705, y: 664 }, // derived: under the label, as the three board pins sit under theirs
    shati: { x: 276, y: 351 }, // derived
  },
  fit: { lat0: 21.572, lng0: 39.168, x0: 765, y0: 166, kx: 11937.5, ky: 12839 },
};

// ─── Phone · Results-Map-M (map region 390 × ~420 px, SVG viewBox 390 × 420) · board px ≈ viewBox units ───
export const PHONE: SchematicGeometry = {
  viewBox: { w: 390, h: 420 },
  strokeWidth: 3,
  grid: 40,
  paths: [
    { d: "M0 120 C 90 100, 160 160, 240 130 S 360 90, 390 110" },
    { d: "M60 0 C 70 120, 40 260, 80 420" },
    { d: "M0 300 C 120 280, 220 340, 390 300" },
    { d: "M250 0 C 240 140, 300 280, 260 420" },
  ],
  labels: {
    rawdah: { x: 330, y: 60, anchor: "end" }, // top 60 · right 60
    safa: { x: 160, y: 200, anchor: "end" }, // top 200 · right 230
    "obhur-north": { x: 40, y: 40, anchor: "start" }, // top 40 · left 40
    naeem: { x: 270, y: 330, anchor: "end" }, // top 330 · right 120
  },
  pins: {
    rawdah: { x: 274, y: 116 }, // «7» · top 90 · right 90 · 52 px
    safa: { x: 178, y: 252 }, // «1» · top 230 · right 190 · 44 px
    "obhur-north": { x: 92, y: 92 }, // «قريباً» · top 70 · left 70 · 44 px
    naeem: { x: 236, y: 380 }, // derived
    shati: { x: 108, y: 184 }, // derived from the desktop proportion (not labelled on the phone board)
  },
  fit: { lat0: 21.572, lng0: 39.168, x0: 274, y0: 116, kx: 3791.7, ky: 4078 },
};

export function getGeometry(variant: MapVariant): SchematicGeometry {
  return variant === "phone" ? PHONE : DESKTOP;
}

/** The pin pickers show the upper half of the desktop drawing: الروضة, الفيصلية and the office all fall inside it. */
export const PICKER_WINDOW: ViewWindow = { x: 0, y: 0, w: 1000, h: 400 };

export function fullWindow(variant: MapVariant = "desktop"): ViewWindow {
  const g = getGeometry(variant);
  return { x: 0, y: 0, w: g.viewBox.w, h: g.viewBox.h };
}

/** Keeps a point inside a window with a margin (fraction of the window size; default 3%). */
export function clampToWindow(p: XY, win: ViewWindow, margin = 0.03): XY {
  const mx = win.w * margin;
  const my = win.h * margin;
  return {
    x: Math.min(win.x + win.w - mx, Math.max(win.x + mx, p.x)),
    y: Math.min(win.y + win.h - my, Math.max(win.y + my, p.y)),
  };
}

/** lat/lng → drawing units through the variant's fit. `clamp` keeps the point on the drawing (default true). */
export function latLngToSvg(ll: LatLng, variant: MapVariant = "desktop", clamp = true): XY {
  const { fit } = getGeometry(variant);
  const p = { x: fit.x0 + (ll.lng - fit.lng0) * fit.kx, y: fit.y0 - (ll.lat - fit.lat0) * fit.ky };
  return clamp ? clampToWindow(p, fullWindow(variant)) : p;
}

/** drawing units → lat/lng (the inverse of `latLngToSvg`, never clamped). */
export function svgToLatLng(p: XY, variant: MapVariant = "desktop"): LatLng {
  const { fit } = getGeometry(variant);
  return { lng: fit.lng0 + (p.x - fit.x0) / fit.kx, lat: fit.lat0 - (p.y - fit.y0) / fit.ky };
}

/** Converts a desktop-unit point to another variant's units proportionally (for explicit x/y pins). */
export function scalePoint(p: XY, to: MapVariant): XY {
  if (to === "desktop") return p;
  const a = DESKTOP.viewBox;
  const b = getGeometry(to).viewBox;
  return { x: (p.x / a.w) * b.w, y: (p.y / a.h) * b.h };
}

/** Pin centre for a district: the board's pin where the board draws one, else the district centre through the fit. */
export function districtPin(slug: string, variant: MapVariant = "desktop"): XY {
  const g = getGeometry(variant);
  const board = g.pins[slug];
  if (board) return board;
  const d = districtRef(slug);
  if (d) return latLngToSvg(d.centre, variant, true);
  return { x: g.viewBox.w / 2, y: g.viewBox.h / 2 };
}

/** Label position for a district, only where the board labels it. */
export function districtLabel(slug: string, variant: MapVariant = "desktop"): LabelPos | undefined {
  return getGeometry(variant).labels[slug];
}

/** 21.5604526 → "21.5604526" (seven decimals by default, Western digits). */
export function formatCoord(n: number, decimals = 7): string {
  return n.toFixed(decimals);
}

// ─── Google Maps links ───────────────────────────────────────────────────────────────────────────────────
const NUM = "(-?\\d{1,3}(?:\\.\\d+)?)";
const SEP = "\\s*[,،][\\s+]*";
// most exact first: the marker (!3d!4d) and path coordinates beat the viewport centre after «@»
const PATTERNS: RegExp[] = [
  new RegExp(`!3d${NUM}!4d${NUM}`), // data=!3d21.56!4d39.18 (the place marker)
  new RegExp(`/maps/(?:place|search|dir)/(?:[^/?#]*/)*?${NUM}${SEP}${NUM}(?:[/?#]|$)`), // /maps/place/21.56,39.18 · /maps/dir//21.56,39.18
  new RegExp(`[?&](?:q|query|ll|center|destination|daddr|saddr|sll)=(?:loc:)?${NUM}${SEP}${NUM}`, "i"), // ?q=21.56,39.18 · query=
  new RegExp(`/@${NUM}${SEP}${NUM}`), // …/maps/place/…/@21.56,39.18,17z (the viewport)
  new RegExp(`^geo:${NUM}${SEP}${NUM}`, "i"), // geo:21.56,39.18
  new RegExp(`^\\s*${NUM}${SEP}${NUM}\\s*$`), // a plain "21.56, 39.18" pair (Arabic comma accepted)
];

function valid(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

/** True for anything that looks like a Google Maps link (full or short) or a geo: URI. */
export function isMapsLink(text: string): boolean {
  const t = text.trim();
  return /(^|\/\/|\.)(?:maps\.google\.[a-z.]+|google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs|g\.page)/i.test(t) || /^geo:/i.test(t);
}

/** Reads coordinates out of a Google Maps link (@lat,lng · q= · ll= · !3d!4d · /place/lat,lng), a geo: URI or a plain
 *  "lat, lng" pair. Short links (maps.app.goo.gl, goo.gl/maps) carry no coordinates and return null. */
export function parseMapsLink(text: string): LatLng | null {
  if (!text) return null;
  let t = text.trim();
  try {
    t = decodeURIComponent(t);
  } catch {
    /* keep the raw text */
  }
  for (const re of PATTERNS) {
    const m = re.exec(t);
    if (!m) continue;
    const lat = parseFloat(m[1]);
    const lng = parseFloat(m[2]);
    if (valid(lat, lng)) return { lat, lng };
  }
  return null;
}

// ─── Fit ─────────────────────────────────────────────────────────────────────────────────────────────────
// Axis-aligned linear fit, north up and east right, defined from two anchor districts of docs/data-model.md:
//   الروضة        21.572, 39.168 → its board pin (desktop 765,166 · phone 274,116)
//   أبحر الشمالية 21.78,  39.12  → its board pin's x (desktop 192 · phone 92) fixes the longitude scale:
//     kx = (765 − 192) / (39.168 − 39.12) = 11937.5 units per degree (phone 3791.7).
// The board compresses north–south by about twelve to one (أبحر is 23 km north of الروضة but sits 41 units above
// it), so a latitude scale taken from the same two pins would make a 10 % drag move the pin 40 km. The latitude
// scale therefore keeps the longitude scale's metres per unit: ky = kx × 1.0755 (1 / cos 21.6°) = 12839 (phone 4078).
// Consequences, on purpose: الروضة's centre lands exactly on its pin; the office (21.5604526, 39.1811231) lands at
// (921, 315), 1.3 km south-east of it, inside the picker window; districts far from الروضة (أبحر, الصفا, النعيم…)
// do not land on their schematic labels and are clamped to the drawing's edge by `latLngToSvg`. Pins placed by
// district slug always use the board positions, so the results map never depends on the fit.
