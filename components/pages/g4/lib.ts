// G4 · places: copy fragments computed from the fixtures for /guide, /projects, /projects/[slug] and /contact.
// Every number on these pages comes from data/* through data/selectors.ts or the helpers below; the words around
// them are the boards' copy.
import type { Project, Unit } from "@/data/types";
import { projects } from "@/data/projects";
import { closedApprovals } from "@/data/approvals";
import { radarDistricts } from "@/data/analytics";
import { districtAr, districts } from "@/data/districts";
import { UNIT_TYPE_AR } from "@/data/units";
import { TODAY, availableUnits, soldUnits, filterUnits, type Range } from "@/data/selectors";
import type { UnitOverrides } from "@/data/selectors";
import { fmtArea, fmtCompactAr, fmtNum, plural, UNITS } from "@/lib/format";
import type { UnitFilters, UnitTypeParam } from "@/lib/url";

// ---------------------------------------------------------------------------
// Numbers as the guide writes them
// ---------------------------------------------------------------------------

/** «459 إلى 555 ألف» · «1.60 إلى 1.65 مليون» · «690 ألف»: the figures and the unit word, split for the bold parts. */
export function rangeParts(min: number, max: number | null): { a: string; b: string | null; word: "ألف" | "مليون" } {
  const top = max ?? min;
  const two = max != null && max !== min;
  if (top >= 1_000_000) return { a: (min / 1_000_000).toFixed(2), b: two ? (max / 1_000_000).toFixed(2) : null, word: "مليون" };
  return { a: fmtNum(min / 1000), b: two ? fmtNum(max / 1000) : null, word: "ألف" };
}
export function rangeText(min: number, max: number | null): string {
  const r = rangeParts(min, max);
  return r.b ? `${r.a} إلى ${r.b} ${r.word}` : `${r.a} ${r.word}`;
}
/** «400 ألف إلى 1.7 مليون» */
export function scaleText(scale: Range): string {
  return `${fmtCompactAr(scale.min)} إلى ${fmtCompactAr(scale.max)}`;
}
/** «80 إلى 147 م²» (whole metres, as the guide rounds them) */
export function areaRangeText(area: Range | null): string {
  if (!area) return "";
  const a = Math.round(area.min);
  const b = Math.round(area.max);
  return a === b ? `${a} م²` : `${a} إلى ${b} م²`;
}
/** Areas in the desktop models table keep two decimals: 147 → «147.00». */
export function area2(n: number): string {
  return n.toFixed(2);
}
/** «بيعت 2026/09» from soldOn */
export function soldMonth(iso?: string): string {
  return iso ? iso.slice(0, 7).replace("-", "/") : "";
}
/** «2026/10/01» */
export function slashDate(iso: string): string {
  return iso.replaceAll("-", "/");
}

// ---------------------------------------------------------------------------
// Words that count
// ---------------------------------------------------------------------------

/** genitive room count: «شقة غرفتين» · «3 غرف» */
export function bedsGen(n: number): string {
  if (n === 1) return "غرفة واحدة";
  if (n === 2) return "غرفتين";
  if (n <= 10) return `${n} غرف`;
  return `${n} غرفة`;
}
/** «10 نماذج» */
export function modelsWord(n: number): string {
  return plural(n, { one: "نموذج واحد", two: "نموذجان", few: "نماذج", many: "نموذجاً" });
}
/** «2 مبيعتان» · «1 مبيعة» */
export function soldWord(n: number): string {
  return n === 2 ? "2 مبيعتان" : `${n} مبيعة`;
}
/** «وفيلتا روف» (construct) · «وفيلا روف» */
export function roofsWord(n: number): string {
  if (n === 1) return "فيلا روف";
  if (n === 2) return "فيلتا روف";
  return `${n} فلل روف`;
}
/** «4 شقق» */
export function apartmentsWord(n: number): string {
  return plural(n, { one: "شقة واحدة", two: "شقتان", few: "شقق", many: "شقة" });
}
/** «مشروع واحد مدرج» */
export function projectsListedWord(n: number): string {
  if (n === 1) return "مشروع واحد مدرج";
  if (n === 2) return "مشروعان مدرجان";
  return `${n} مشاريع مدرجة`;
}
/** «الوحدات الثماني» (Projects-D button) */
const TENS = ["", "الواحدة", "الاثنتان", "الثلاث", "الأربع", "الخمس", "الست", "السبع", "الثماني", "التسع", "العشر"];
export function unitsDefinite(n: number): string {
  return n >= 1 && n <= 10 ? (n === 1 ? "الوحدة الواحدة" : n === 2 ? "الوحدتان" : `الوحدات ${TENS[n]}`) : `الوحدات ${n}`;
}
export function unitsCount(n: number): string {
  return plural(n, UNITS);
}
/** «حقلان يحتاجان تصحيحاً» */
export function fieldsToFix(n: number): string {
  if (n === 1) return "حقل يحتاج تصحيحاً";
  if (n === 2) return "حقلان يحتاجان تصحيحاً";
  return `${n} حقول تحتاج تصحيحاً`;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const ORDINALS: Record<string, number> = { الأول: 1, الثاني: 2, الثالث: 3, الرابع: 4 };
/** «الربع الثاني 2027» → «الربع 2 · 2027» */
export function deliveryShort(label: string): string {
  const m = label.match(/الربع\s+(\S+)\s+(?:من\s+)?(\d{4})/);
  if (!m) return label;
  return `الربع ${ORDINALS[m[1]] ?? m[1]} · ${m[2]}`;
}
/** «عمارتان روز وياسمين» (nominative) */
export function buildingsNom(p: Project): string {
  const names = p.buildings.map((b) => b.nameAr);
  if (names.length === 1) return `عمارة ${names[0]}`;
  if (names.length === 2) return `عمارتان ${names[0]} و${names[1]}`;
  return `${names.length} عمارات`;
}
/** «عمارتا روز وياسمين» (construct, the guide) */
export function buildingsConstruct(p: Project): string {
  const names = p.buildings.map((b) => b.nameAr);
  if (names.length === 1) return `عمارة ${names[0]}`;
  if (names.length === 2) return `عمارتا ${names[0]} و${names[1]}`;
  return `${names.length} عمارات`;
}
/** «شقق غرفتين و3 غرف» from the project's apartments */
export function apartmentBedsPhrase(list: Unit[]): string {
  const beds = [...new Set(list.filter((u) => u.type === "apartment").map((u) => u.beds))].sort((a, b) => a - b);
  if (!beds.length) return "";
  return `شقق ${beds.map(bedsGen).join(" و")}`;
}
/** «4 شقق (A إلى D)» */
export function apartmentsWithModels(list: Unit[]): string {
  const apts = list.filter((u) => u.type === "apartment");
  const models = apts.map((u) => u.model).sort();
  const span = models.length > 1 ? ` (${models[0]} إلى ${models[models.length - 1]})` : models.length ? ` (${models[0]})` : "";
  return `${apartmentsWord(apts.length)}${span}`;
}
/** «شقة غرفتين · 82.60 م²» */
export function unitPhrase(u: Unit): string {
  return `${UNIT_TYPE_AR[u.type]} ${bedsGen(u.beds)} · ${fmtArea(u.areaM2)} م²`;
}
/** The cheapest available unit (smaller area first on a tie, as the boards pick RZ-D). */
export function cheapestAvailable(overrides?: UnitOverrides): Unit | null {
  const list = [...availableUnits(overrides)].sort((a, b) => a.priceSar - b.priceSar || a.areaM2 - b.areaM2);
  return list[0] ?? null;
}
/** Units sold in the prototype's current year (Projects-D «بيعت هذا العام»). */
export function soldThisYear(overrides?: UnitOverrides): Unit[] {
  const year = TODAY.slice(0, 4);
  return soldUnits(overrides).filter((u) => (u.soldOn ?? "").startsWith(year));
}

/** The automatic owner group (Projects «وحدات من مُلّاك»): the illustrative owner listings of the radar fixture
 *  (`radarDistricts[*].ownerUnits`, الصفا: 1) and the approved submission that became the listing. */
export interface OwnerGroup {
  project: Project | undefined;
  count: number;
  districtSlug: string | null;
  districtAr: string;
  titleAr: string; // «شقة 4 غرف»
  typeAr: string; // «شقة»
}
export function ownerGroup(): OwnerGroup {
  const project = projects.find((p) => p.autoGroup);
  const rows = Object.values(radarDistricts).filter((d) => (d.ownerUnits ?? 0) > 0);
  const count = rows.reduce((s, d) => s + (d.ownerUnits ?? 0), 0);
  const slug = rows[0]?.slug ?? null;
  const listing = slug ? closedApprovals.find((a) => a.status === "approved" && a.districtSlug === slug) : undefined;
  return {
    project,
    count,
    districtSlug: slug,
    districtAr: slug ? districtAr(slug) : "",
    titleAr: listing?.titleAr?.split(" · ")[0] ?? listing?.typeLabelAr ?? "",
    typeAr: listing?.typeLabelAr ?? "",
  };
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

/** Western digits only: «٠٥٥ ١٢» → «05512» */
export function phoneDigits(s: string): string {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
}
/** «05X XXX 4567» */
export function maskPhone(digits: string): string {
  if (digits.length < 6) return "05X XXX XXXX";
  return `${digits.slice(0, 2)}X XXX ${digits.slice(-4)}`;
}
/** «كتبت 5 أرقام فقط» */
export function typedDigits(n: number): string {
  if (n === 1) return "كتبت رقماً واحداً فقط.";
  if (n === 2) return "كتبت رقمين فقط.";
  return `كتبت ${n} أرقام فقط.`;
}
export type PhoneCheck = { ok: true; digits: string } | { ok: false; digits: string; summary: string; message: string };
/** 10 digits starting with 05 (Contact-Error-M wording). */
export function checkPhone(raw: string): PhoneCheck {
  const digits = phoneDigits(raw);
  if (/^05\d{8}$/.test(digits)) return { ok: true, digits };
  if (!digits.length) return { ok: false, digits, summary: "رقم الجوال مطلوب", message: "10 أرقام تبدأ بـ 05." };
  if (digits.length < 10 && "05".startsWith(digits.slice(0, 2)) && (digits.length < 2 || digits.startsWith("05")))
    return { ok: false, digits, summary: "رقم الجوال غير مكتمل", message: `10 أرقام تبدأ بـ 05. ${typedDigits(digits.length)}` };
  return { ok: false, digits, summary: "رقم الجوال غير صحيح", message: "10 أرقام تبدأ بـ 05." };
}

/** What a contact message asks for, read from its words: «شقة 3 غرف بميزانية 700 ألف» → apartments, 3 rooms,
 *  up to 700,000 (Contact-Success-M «شقق 3 غرف حتى 700 ألف · وحدة واحدة»). */
export interface MessageAsk {
  filters: Partial<UnitFilters>;
  labelAr: string;
  count: number;
}
export function readAsk(text: string, overrides?: UnitOverrides): MessageAsk | null {
  const t = text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  const filters: Partial<UnitFilters> = {};
  let beds: number | null = null;
  const bm = t.match(/(\d+)\s*غرف/);
  if (bm) beds = parseInt(bm[1], 10);
  else if (/غرفتين|غرفتان/.test(t)) beds = 2;
  if (beds) filters.beds = Math.min(beds, 5);
  let max: number | null = null;
  const mm = t.match(/(\d+(?:[.,]\d+)?)\s*مليون/);
  const km = t.match(/(\d[\d,]*)\s*(?:ألف|الف)/);
  if (mm) max = Math.round(parseFloat(mm[1].replace(",", ".")) * 1_000_000);
  else if (km) max = parseInt(km[1].replace(/,/g, ""), 10) * 1000;
  if (max) filters.max = max;
  let type: UnitTypeParam | null = null;
  if (/شق[ةق]/.test(t)) type = "apt";
  else if (/روف/.test(t)) type = "roof";
  if (type) filters.type = [type];
  const d = districts.find((x) => t.includes(x.ar));
  if (d) filters.district = d.slug;
  if (!beds && !max && !type && !d) return null;
  const count = filterUnits(filters, overrides).available.length;
  const what = type === "apt" ? "شقق" : type === "roof" ? "فلل روف" : "وحدات";
  const parts = [what, beds ? (beds === 2 ? "غرفتين" : `${beds} غرف`) : null, d ? `في ${d.ar}` : null, max ? `حتى ${fmtCompactAr(max)}` : null].filter(Boolean);
  return { filters, labelAr: `${parts.join(" ")} · ${unitsCount(count)}`, count };
}
