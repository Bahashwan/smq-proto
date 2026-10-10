// Pure functions over the fixtures. Every number the prototype shows comes from here: counts, from-prices, ranges,
// price per m², finder answers, the empty-state loosenings, guide tables, project stats, owner-form yield, alliance
// coverage, radar ranking, ledgers, routing, protection days, report slices and the next record numbers.
// Nothing here reads the URL or the store: callers pass the parsed filters and the store's override maps.
import type {
  AllianceRequest, Approval, ApprovalRole, ApprovalStatus, ApplicationStatus, District, Lead, LeadStatus, Marketer, MarketerStage, Office,
  Project, Referral, ReferralStage, ReportSlice, RequestStage, Unit, UnitStatus, AnalyticsPeriodKey,
} from "./types";
import type { UnitFilters, UnitTypeParam, SortParam } from "../lib/url";
import { units, UNIT_TYPE_AR, UNIT_TYPE_PLURAL_AR, UNIT_TYPE_PLURAL_DEF_AR } from "./units";
import { projects, projectById, publicProjects } from "./projects";
import { districts, districtBySlug, districtAr, districtsBySector, SECTORS, SECTOR_ORDER } from "./districts";
import { offices, activeOffices } from "./offices";
import { applications, allApplications } from "./applications";
import { requests } from "./requests";
import { referrals } from "./referrals";
import { marketers } from "./marketers";
import { allApprovals } from "./approvals";
import { leads } from "./leads";
import { analytics } from "./analytics";
import { settings, allianceSettings } from "./settings";
import { lists } from "./content";

/** The prototype's clock: today (dates) and now (relative labels), Jeddah time. */
export const TODAY = "2026-10-10";
export const NOW = "2026-10-10T22:00:00+03:00";
const TZ = "Asia/Riyadh";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
const round = Math.round;

// ---------------------------------------------------------------------------
// Units: effective status, counts, ranges
// ---------------------------------------------------------------------------

/** The store's maps (lib/store.ts: unitStatus, unitHidden); pass the store state or nothing. */
export interface UnitOverrides {
  unitStatus?: Record<string, UnitStatus>;
  unitHidden?: Record<string, boolean>;
}

/** Effective status = store override ?? fixture value. */
export function effectiveUnitStatus(unit: Unit, overrides?: UnitOverrides): UnitStatus {
  return overrides?.unitStatus?.[unit.code] ?? unit.status;
}
export function isUnitHidden(unit: Unit, overrides?: UnitOverrides): boolean {
  return overrides?.unitHidden?.[unit.code] ?? unit.hidden ?? false;
}
/** Listed units (not hidden) with the effective status merged in. */
export function listedUnits(overrides?: UnitOverrides): Unit[] {
  return units.filter((u) => !isUnitHidden(u, overrides)).map((u) => ({ ...u, status: effectiveUnitStatus(u, overrides) }));
}
export function availableUnits(overrides?: UnitOverrides): Unit[] {
  return listedUnits(overrides).filter((u) => u.status === "available");
}
export function soldUnits(overrides?: UnitOverrides): Unit[] {
  return listedUnits(overrides).filter((u) => u.status === "sold");
}
export function reservedUnits(overrides?: UnitOverrides): Unit[] {
  return listedUnits(overrides).filter((u) => u.status === "reserved");
}
/** 8 / 2 / 0 of 10 with the fixtures. */
export function countsByStatus(overrides?: UnitOverrides): { available: number; reserved: number; sold: number; listed: number } {
  const list = listedUnits(overrides);
  return {
    available: list.filter((u) => u.status === "available").length,
    reserved: list.filter((u) => u.status === "reserved").length,
    sold: list.filter((u) => u.status === "sold").length,
    listed: list.length,
  };
}
/** price ÷ areaM2, rounded to the riyal */
export function unitPpm(unit: Pick<Unit, "priceSar" | "areaM2">): number {
  return round(unit.priceSar / unit.areaM2);
}
export interface Range {
  min: number;
  max: number;
}
const range = (vals: number[]): Range | null => (vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : null);
export function priceRange(list: Unit[]): Range | null {
  return range(list.map((u) => u.priceSar));
}
export function ppmRange(list: Unit[]): Range | null {
  return range(list.map(unitPpm));
}
export function areaRange(list: Unit[]): Range | null {
  return range(list.map((u) => u.areaM2));
}
export function bedsRange(list: Unit[]): Range | null {
  return range(list.map((u) => u.beds));
}
/** «يبدأ من»: the lowest available price (null when nothing is available). */
export function fromPrice(list: Unit[] = availableUnits()): number | null {
  return list.length ? Math.min(...list.map((u) => u.priceSar)) : null;
}
/** Latest «آخر تحديث» among a list. */
export function latestUpdate(list: Unit[] = listedUnits()): string {
  return list.reduce((m, u) => (u.updatedAt > m ? u.updatedAt : m), "");
}
/** The district a unit sits in (through its project). */
export function unitDistrictSlug(unit: Unit): string {
  return projectById(unit.projectId)?.districtSlug ?? "rawdah";
}
/** غرفتان · 3 غرف · 5 غرف */
export function bedsWord(n: number): string {
  if (n === 1) return "غرفة واحدة";
  if (n === 2) return "غرفتان";
  return `${n} غرف`;
}

export interface BedsRow {
  beds: number;
  labelAr: string;
  from: number | null;
  to: number | null;
  ppm: Range | null;
  area: Range | null;
  availableCount: number;
  listedCount: number;
  single: boolean; // «نموذج واحد»
  units: Unit[];
}
/** Price ranges by bedroom count (available units set the range, listed units the «من N» denominator). */
export function rangeByBeds(overrides?: UnitOverrides): BedsRow[] {
  const listed = listedUnits(overrides);
  const bedsSet = [...new Set(listed.map((u) => u.beds))].sort((a, b) => a - b);
  return bedsSet.map((beds) => {
    const all = listed.filter((u) => u.beds === beds);
    const avail = all.filter((u) => u.status === "available");
    const pr = priceRange(avail);
    return {
      beds,
      labelAr: bedsWord(beds),
      from: pr?.min ?? null,
      to: pr?.max ?? null,
      ppm: ppmRange(avail),
      area: areaRange(avail),
      availableCount: avail.length,
      listedCount: all.length,
      single: avail.length === 1,
      units: avail,
    };
  });
}

export interface TypeRow {
  type: Unit["type"];
  labelAr: string;
  pluralAr: string;
  from: number | null;
  to: number | null;
  ppmFrom: number | null;
  ppmTo: number | null;
  area: Range | null;
  availableCount: number;
  listedCount: number;
  units: Unit[];
}
/** Price per m² and areas by unit type. */
export function rangeByType(overrides?: UnitOverrides): TypeRow[] {
  const listed = listedUnits(overrides);
  const types: Unit["type"][] = ["apartment", "roof-villa"];
  return types
    .filter((t) => listed.some((u) => u.type === t))
    .map((type) => {
      const all = listed.filter((u) => u.type === type);
      const avail = all.filter((u) => u.status === "available");
      const pr = priceRange(avail);
      const pp = ppmRange(avail);
      return {
        type,
        labelAr: UNIT_TYPE_AR[type],
        pluralAr: UNIT_TYPE_PLURAL_AR[type],
        from: pr?.min ?? null,
        to: pr?.max ?? null,
        ppmFrom: pp?.min ?? null,
        ppmTo: pp?.max ?? null,
        area: areaRange(avail),
        availableCount: avail.length,
        listedCount: all.length,
        units: avail,
      };
    });
}
/** Per-m² range of the available units in a district (the district guide's «للمتر»). */
export function districtPpmRange(districtSlug: string, overrides?: UnitOverrides): (Range & { count: number }) | null {
  const avail = availableUnits(overrides).filter((u) => unitDistrictSlug(u) === districtSlug);
  const r = ppmRange(avail);
  return r ? { ...r, count: avail.length } : null;
}

// ---------------------------------------------------------------------------
// «قياساً بالحي» · «قياساً بالمشروع»
// ---------------------------------------------------------------------------

const BEDS_WITH = ["", "بغرفة واحدة", "بغرفتين", "بثلاث غرف", "بأربع غرف", "بخمس غرف", "بست غرف"];
const ORDINAL = ["", "", "ثاني", "ثالث", "رابع", "خامس", "سادس", "سابع", "ثامن", "تاسع", "عاشر"];

export interface ComparedToDistrict {
  sameBedsListed: number;
  bedsPart: string;
  ppmRank: number; // 1 = lowest per m² among listed units of the same type in the district
  typeCount: number;
  ppmPart: string;
  line: string;
}
/** Inputs and the sentence of «قياساً بالحي» (Unit-D): the model's place by bedrooms and by price per m². */
export function comparedToDistrict(unit: Unit, overrides?: UnitOverrides): ComparedToDistrict {
  const district = unitDistrictSlug(unit);
  const listed = listedUnits(overrides).filter((u) => unitDistrictSlug(u) === district);
  const sameBeds = listed.filter((u) => u.beds === unit.beds);
  const sameType = listed.filter((u) => u.type === unit.type).sort((a, b) => unitPpm(a) - unitPpm(b));
  const rank = sameType.findIndex((u) => u.code === unit.code) + 1;
  const bedsWith = BEDS_WITH[unit.beds] ?? `بـ${unit.beds} غرف`;
  const bedsPart = sameBeds.length === 1 ? `النموذج الوحيد ${bedsWith}` : `واحد من ${sameBeds.length} نماذج ${bedsWith}`;
  const plural = UNIT_TYPE_PLURAL_DEF_AR[unit.type];
  const ppmPart = rank <= 1 ? `أقل سعر للمتر بين ${plural}` : `${ORDINAL[rank] ?? `رقم ${rank} في`} أقل سعر للمتر بين ${plural}`;
  return { sameBedsListed: sameBeds.length, bedsPart, ppmRank: rank, typeCount: sameType.length, ppmPart, line: `${bedsPart} · ${ppmPart}` };
}
/** «الروف الثاني في ياسمين 1,600,000 · 419 م²» (Unit-Roof-M «قياساً بالمشروع»). */
export function comparedToProject(unit: Unit, overrides?: UnitOverrides): { other: Unit | null; line: string } {
  const other = otherRoof(unit, overrides);
  if (!other) return { other: null, line: "" };
  return { other, line: `الروف الثاني في ${other.buildingNameAr} ${fmt(other.priceSar)} · ${fmt(other.areaM2)} م²` };
}

// ---------------------------------------------------------------------------
// Finder (Home)
// ---------------------------------------------------------------------------

export type FinderType = UnitTypeParam | "all";
const TYPE_PARAM: Record<UnitTypeParam, Unit["type"] | null> = { apt: "apartment", roof: "roof-villa", villa: null, duplex: null };

function finderUnits(budget: number, district: string | null | "all", type: FinderType = "all", beds: number | null = null, overrides?: UnitOverrides): Unit[] {
  return availableUnits(overrides).filter((u) => {
    if (u.priceSar > budget) return false;
    if (district && district !== "all" && unitDistrictSlug(u) !== district) return false;
    if (type !== "all" && u.type !== TYPE_PARAM[type]) return false;
    if (beds != null && !(beds >= 5 ? u.beds >= 5 : u.beds === beds)) return false;
    return true;
  });
}
/** Units available at or under the budget in the district (الروضة by default), by type and rooms. */
export function finderCount(budget: number, district: string | null | "all" = "rawdah", type: FinderType = "all", beds: number | null = null, overrides?: UnitOverrides): number {
  return finderUnits(budget, district, type, beds, overrides).length;
}
export interface FinderAnswer {
  count: number;
  units: Unit[];
  fromPrice: number | null;
  beds: Range | null;
  area: Range | null;
  ppm: Range | null;
  budget: number;
  districtSlug: string | null;
  districtAr: string;
}
/** The Home answer block: count, «تبدأ من», rooms, areas and per-m² ranges for the chosen budget. */
export function finderAnswer(budget: number, district: string | null | "all" = "rawdah", type: FinderType = "all", beds: number | null = null, overrides?: UnitOverrides): FinderAnswer {
  const list = finderUnits(budget, district, type, beds, overrides);
  const slug = district && district !== "all" ? district : null;
  return {
    count: list.length,
    units: sortUnits(list, "price"),
    fromPrice: fromPrice(list),
    beds: bedsRange(list),
    area: areaRange(list),
    ppm: ppmRange(list),
    budget,
    districtSlug: slug,
    districtAr: slug ? districtAr(slug) : "كل جدة",
  };
}

// ---------------------------------------------------------------------------
// Results: filters and sort
// ---------------------------------------------------------------------------

export const FEATURE_KEYS = ["maid", "driver", "balcony", "roof", "smart"] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];
export const FEATURE_LABELS: Record<FeatureKey, string> = { maid: "غرفة خادمة", driver: "غرفة سائق", balcony: "بلكونة", roof: "سطح خاص", smart: "سمارت هوم" };
export const TYPE_PARAM_LABELS: Record<UnitTypeParam, string> = { apt: "شقق", roof: "فلل روف", villa: "فلل", duplex: "دوبلكس" };
export const TYPE_PARAM_SINGULAR: Record<UnitTypeParam, string> = { apt: "شقة", roof: "فيلا روف", villa: "فيلا", duplex: "دوبلكس" };
export const DELIVERY_LABELS: Record<NonNullable<UnitFilters["delivery"]>, string> = { "2026-end": "نهاية 2026", "2027-mid": "منتصف 2027", "2027-end": "نهاية 2027" };
export const PSTATUS_LABELS: Record<NonNullable<UnitFilters["pstatus"]>, string> = { ready: "جاهز", construction: "قيد الإنشاء" };
export const SORT_LABELS: Record<SortParam, string> = { price: "السعر، الأقل أولاً", ppm: "سعر المتر", area: "المساحة", delivery: "التسليم" };

const DELIVERY_LIMIT: Record<NonNullable<UnitFilters["delivery"]>, number> = { "2026-end": 2026 * 4 + 4, "2027-mid": 2027 * 4 + 2, "2027-end": 2027 * 4 + 4 };
/** Project delivery as a quarter index (year × 4 + quarter) parsed from the «التسليم» milestone, e.g. 2027/Q2. */
export function deliveryQuarterIndex(project: Project | undefined): number | null {
  const m = project?.milestones.find((x) => x.label === "التسليم")?.date.match(/(\d{4})\/Q([1-4])/);
  return m ? parseInt(m[1], 10) * 4 + parseInt(m[2], 10) : null;
}
function hasFeature(u: Unit, f: string): boolean {
  switch (f) {
    case "maid": return u.features.maid;
    case "driver": return u.features.driver;
    case "balcony": return u.features.balcony;
    case "roof": return u.features.roofTerrace;
    case "smart": return u.features.smartHome;
    default: return true;
  }
}
/** Does a unit pass every filter except its status? */
export function unitMatches(u: Unit, f: Partial<UnitFilters>): boolean {
  if (f.district && f.district !== "all" && unitDistrictSlug(u) !== f.district) return false;
  if (f.min != null && u.priceSar < f.min) return false;
  if (f.max != null && u.priceSar > f.max) return false;
  if (f.type && f.type.length && !f.type.some((t) => TYPE_PARAM[t] === u.type)) return false;
  if (f.beds != null && !(f.beds >= 5 ? u.beds >= 5 : u.beds === f.beds)) return false;
  if (f.amin != null && u.areaM2 < f.amin) return false;
  if (f.amax != null && u.areaM2 > f.amax) return false;
  const project = projectById(u.projectId);
  if (f.pstatus === "ready" && project?.status !== "ready") return false;
  if (f.pstatus === "construction" && project?.status !== "under-construction") return false;
  if (f.delivery) {
    const q = deliveryQuarterIndex(project);
    if (q == null || q > DELIVERY_LIMIT[f.delivery]) return false;
  }
  if (f.feat && f.feat.length && !f.feat.every((x) => hasFeature(u, x))) return false;
  return true;
}
export function sortUnits(list: Unit[], sort: SortParam = "price"): Unit[] {
  const arr = [...list];
  switch (sort) {
    case "ppm": return arr.sort((a, b) => unitPpm(a) - unitPpm(b) || a.priceSar - b.priceSar);
    case "area": return arr.sort((a, b) => b.areaM2 - a.areaM2 || a.priceSar - b.priceSar);
    case "delivery": return arr.sort((a, b) => (deliveryQuarterIndex(projectById(a.projectId)) ?? 0) - (deliveryQuarterIndex(projectById(b.projectId)) ?? 0) || a.priceSar - b.priceSar);
    default: return arr.sort((a, b) => a.priceSar - b.priceSar || a.code.localeCompare(b.code)); // equal prices: RZ before YS, as the boards list them
  }
}
export interface FilterResult {
  available: Unit[];
  sold: Unit[];
  reserved: Unit[];
  matched: Unit[]; // every status
}
/** Units matching the URL filters, split by effective status and sorted. Sold matches feed the «مباعة، للمرجع فقط» strip. */
export function filterUnits(filters: Partial<UnitFilters>, overrides?: UnitOverrides): FilterResult {
  const matched = sortUnits(listedUnits(overrides).filter((u) => unitMatches(u, filters)), filters.sort ?? "price");
  return {
    matched,
    available: matched.filter((u) => u.status === "available"),
    sold: matched.filter((u) => u.status === "sold"),
    reserved: matched.filter((u) => u.status === "reserved"),
  };
}

// ---------------------------------------------------------------------------
// Empty state: headline constraint and loosenings (docs/route-map.md «Empty-state logic»)
// ---------------------------------------------------------------------------

type ConstraintKey = "district" | "max" | "beds" | "min" | "type" | "amin" | "amax" | "pstatus" | "delivery" | `feat:${string}`;
const PRIORITY: string[] = ["district", "max", "beds", "min", "type", "amin", "amax", "feat", "pstatus", "delivery"];
const priorityOf = (k: string) => PRIORITY.indexOf(k.startsWith("feat:") ? "feat" : k);

export interface Constraint {
  key: ConstraintKey;
  chipAr: string; // the active chip, e.g. «حتى 450,000»
}
/** The filters that are active, as chips, in the order the boards list them. */
export function activeConstraints(f: Partial<UnitFilters>): Constraint[] {
  const out: Constraint[] = [];
  if (f.district && f.district !== "all") out.push({ key: "district", chipAr: districtAr(f.district) });
  if (f.min != null) out.push({ key: "min", chipAr: `من ${fmt(f.min)}` });
  if (f.max != null) out.push({ key: "max", chipAr: `حتى ${fmt(f.max)}` });
  if (f.beds != null) out.push({ key: "beds", chipAr: f.beds >= 5 ? "5 غرف أو أكثر" : bedsWord(f.beds) });
  if (f.type && f.type.length) out.push({ key: "type", chipAr: f.type.map((t) => TYPE_PARAM_LABELS[t]).join("، ") });
  if (f.amin != null) out.push({ key: "amin", chipAr: `من ${fmt(f.amin)} م²` });
  if (f.amax != null) out.push({ key: "amax", chipAr: `حتى ${fmt(f.amax)} م²` });
  for (const x of f.feat ?? []) out.push({ key: `feat:${x}`, chipAr: FEATURE_LABELS[x as FeatureKey] ?? x });
  if (f.pstatus) out.push({ key: "pstatus", chipAr: PSTATUS_LABELS[f.pstatus] });
  if (f.delivery) out.push({ key: "delivery", chipAr: `التسليم قبل ${DELIVERY_LABELS[f.delivery]}` });
  return out;
}
/** The filter object with one constraint removed (feature keys remove that one feature). */
export function withoutConstraint(f: Partial<UnitFilters>, key: ConstraintKey): Partial<UnitFilters> {
  if (key.startsWith("feat:")) return { ...f, feat: (f.feat ?? []).filter((x) => x !== key.slice(5)) };
  switch (key) {
    case "district": return { ...f, district: null };
    case "max": return { ...f, max: null };
    case "min": return { ...f, min: null };
    case "beds": return { ...f, beds: null };
    case "type": return { ...f, type: [] };
    case "amin": return { ...f, amin: null };
    case "amax": return { ...f, amax: null };
    case "pstatus": return { ...f, pstatus: null };
    case "delivery": return { ...f, delivery: null };
    default: return f;
  }
}
/** Only this constraint, applied alone to the available units: how many it removes. */
function removedAlone(key: ConstraintKey, f: Partial<UnitFilters>, avail: Unit[]): number {
  const alone: Partial<UnitFilters> = {};
  if (key.startsWith("feat:")) alone.feat = [key.slice(5)];
  else (alone as Record<string, unknown>)[key] = (f as Record<string, unknown>)[key];
  return avail.length - avail.filter((u) => unitMatches(u, alone)).length;
}

export interface Loosening {
  key: ConstraintKey;
  labelAr: string; // «كل أحياء جدة بدل الفيصلية»
  filters: Partial<UnitFilters>;
}
/** One constraint loosened, given the filters that remain (used to pick the next price / nearest rooms). */
function loosen(key: ConstraintKey, f: Partial<UnitFilters>, avail: Unit[]): Loosening | null {
  const rest = withoutConstraint(f, key);
  const candidates = avail.filter((u) => unitMatches(u, rest));
  if (key === "district") return { key, labelAr: `كل أحياء جدة بدل ${districtAr(f.district!)}`, filters: rest };
  if (key === "max") {
    const above = candidates.filter((u) => u.priceSar > (f.max ?? 0)).map((u) => u.priceSar);
    if (!above.length) return null;
    const next = Math.min(...above);
    return { key, labelAr: `حتى ${fmt(next)} بدل ${fmt(f.max!)}`, filters: { ...rest, max: next } };
  }
  if (key === "min") return { key, labelAr: `بلا حد أدنى بدل ${fmt(f.min!)}`, filters: rest };
  if (key === "beds") {
    const current = f.beds!;
    const options = [...new Set(candidates.map((u) => Math.min(u.beds, 5)))].filter((b) => b !== current);
    if (!options.length) return null;
    const nearest = options.sort((a, b) => Math.abs(a - current) - Math.abs(b - current) || a - b)[0];
    return { key, labelAr: `${nearest >= 5 ? "5 غرف" : bedsWord(nearest)} بدل ${current}`, filters: { ...rest, beds: nearest } };
  }
  if (key === "type") return { key, labelAr: `كل الأنواع بدل ${(f.type ?? []).map((t) => TYPE_PARAM_LABELS[t]).join("، ")}`, filters: rest };
  if (key.startsWith("feat:")) return { key, labelAr: `بدون ${FEATURE_LABELS[key.slice(5) as FeatureKey] ?? key.slice(5)}`, filters: rest };
  if (key === "amin" || key === "amax") return { key, labelAr: "بلا حد للمساحة", filters: rest };
  if (key === "pstatus") return { key, labelAr: "كل حالات المشروع", filters: rest };
  if (key === "delivery") return { key, labelAr: "بدون تحديد التسليم", filters: rest };
  return null;
}

export interface EmptyStateSuggestion {
  changes: Loosening[];
  labelAr: string; // the changes joined with « · »
  filters: Partial<UnitFilters>;
  count: number;
  deltaAr: string; // «+6 وحدات»
}
export interface EmptyState {
  isEmpty: boolean;
  constraints: Constraint[];
  headline: { key: ConstraintKey; labelAr: string; removed: number; lineAr: string } | null;
  suggestions: EmptyStateSuggestion[];
  bestDistrict: { slug: string; ar: string; listed: number } | null;
}
const unitsWord = (n: number) => (n === 1 ? "وحدة واحدة" : n === 2 ? "وحدتان" : n <= 10 ? `${n} وحدات` : `${n} وحدة`);

/**
 * Zero-results logic: the headline constraint is the single filter that, applied alone, removes the most available
 * units (ties break in the boards' order: district, budget, rooms…). Suggestions loosen the smallest number of
 * constraints that yields results (one when possible, then pairs, then triples), each with its computed count.
 */
export function emptyStateSuggestions(filters: Partial<UnitFilters>, overrides?: UnitOverrides): EmptyState {
  const avail = availableUnits(overrides);
  const constraints = activeConstraints(filters);
  const isEmpty = filterUnits(filters, overrides).available.length === 0;
  const best = (() => {
    const by = new Map<string, number>();
    for (const u of listedUnits(overrides)) by.set(unitDistrictSlug(u), (by.get(unitDistrictSlug(u)) ?? 0) + 1);
    const top = [...by.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? { slug: top[0], ar: districtAr(top[0]), listed: top[1] } : null;
  })();
  if (!isEmpty || !constraints.length) return { isEmpty, constraints, headline: null, suggestions: [], bestDistrict: best };

  const scored = constraints.map((c) => ({ ...c, removed: removedAlone(c.key, filters, avail) }));
  const head = [...scored].sort((a, b) => b.removed - a.removed || priorityOf(a.key) - priorityOf(b.key))[0];
  const HEAD_LABEL: Record<string, string> = { district: "الحي", max: "الميزانية", min: "الحد الأدنى", beds: "الغرف", type: "النوع", amin: "المساحة", amax: "المساحة", pstatus: "حالة المشروع", delivery: "التسليم", feat: "الميزة" };
  let lineAr = "";
  if (head.key === "district") lineAr = `لا نملك وحدات مدرجة في ${districtAr(filters.district!)} بعد${best ? `، لكن لدينا ${best.listed} في ${best.ar}` : ""}.`;
  else if (head.key === "max") lineAr = `أقل سعر مدرج ${fmt(fromPrice(avail) ?? 0)}، فوق حدّك ${fmt(filters.max!)}.`;
  else if (head.key === "beds") lineAr = `لا نماذج بـ${filters.beds} غرف في وحداتنا المدرجة.`;
  else if (head.key.startsWith("feat:")) lineAr = `لا وحدة متاحة فيها ${FEATURE_LABELS[head.key.slice(5) as FeatureKey] ?? head.key.slice(5)}.`;
  else if (head.key === "type") lineAr = `لا وحدات من هذا النوع مدرجة بعد.`;
  else lineAr = `هذا القيد يحذف ${head.removed} من ${avail.length} وحدات متاحة.`;
  const headline = { key: head.key, labelAr: HEAD_LABEL[head.key.startsWith("feat:") ? "feat" : head.key], removed: head.removed, lineAr };

  // Smallest subset of constraints whose loosening yields results.
  const keys = [...constraints].sort((a, b) => priorityOf(a.key) - priorityOf(b.key)).map((c) => c.key);
  let suggestions: EmptyStateSuggestion[] = [];
  const combos = (k: number): ConstraintKey[][] => {
    const out: ConstraintKey[][] = [];
    const rec = (start: number, acc: ConstraintKey[]) => {
      if (acc.length === k) { out.push(acc); return; }
      for (let i = start; i < keys.length; i++) rec(i + 1, [...acc, keys[i]]);
    };
    rec(0, []);
    return out;
  };
  for (let k = 1; k <= keys.length && !suggestions.length; k++) {
    for (const combo of combos(k)) {
      // drop every constraint of the combo first, then apply each loosening (next price / nearest rooms) on the rest
      let f: Partial<UnitFilters> = filters;
      for (const key of combo) f = withoutConstraint(f, key);
      const changes: Loosening[] = [];
      let ok = true;
      for (const key of combo) {
        const l = loosen(key, { ...f, ...pickConstraint(filters, key) }, avail);
        if (!l) { ok = false; break; }
        f = l.filters;
        changes.push(l);
      }
      if (!ok) continue;
      const count = filterUnits(f, overrides).available.length;
      if (count > 0) suggestions.push({ changes, labelAr: changes.map((c) => c.labelAr).join(" · "), filters: f, count, deltaAr: `+${unitsWord(count)}` });
    }
    suggestions = suggestions.sort((a, b) => b.count - a.count).slice(0, 3);
  }
  return { isEmpty, constraints, headline, suggestions, bestDistrict: best };
}
/** The original value of one constraint, to re-apply it before loosening it. */
function pickConstraint(f: Partial<UnitFilters>, key: ConstraintKey): Partial<UnitFilters> {
  if (key.startsWith("feat:")) return { feat: [key.slice(5)] };
  return { [key]: (f as Record<string, unknown>)[key] } as Partial<UnitFilters>;
}

// ---------------------------------------------------------------------------
// Map pins, guide, projects
// ---------------------------------------------------------------------------

export interface Pin {
  projectId: string;
  nameAr: string;
  districtSlug: string;
  districtAr: string;
  centre: { lat: number; lng: number };
  kind: "available" | "owner" | "soon";
  labelAr: string; // the chip under the pin: «جاردن الروضة» · «من مالك · الصفا» · «قريباً»
  count: number; // matching available units
  matched: Unit[];
  priceFrom: number | null;
  priceTo: number | null;
}
/** Hexagon pins for the results map: matching available units per project, plus the owner and coming-soon pins. */
export function pinCounts(filters: Partial<UnitFilters> = {}, overrides?: UnitOverrides): Pin[] {
  const { available } = filterUnits(filters, overrides);
  return projects
    .filter((p) => p.published || p.status === "draft")
    .map((p) => {
      const matched = available.filter((u) => u.projectId === p.id);
      const pr = priceRange(matched);
      const kind: Pin["kind"] = p.autoGroup ? "owner" : p.status === "draft" ? "soon" : "available";
      const dAr = districtAr(p.districtSlug);
      return {
        projectId: p.id,
        nameAr: p.nameAr,
        districtSlug: p.districtSlug,
        districtAr: dAr,
        centre: p.centre,
        kind,
        labelAr: kind === "owner" ? `من مالك · ${dAr}` : kind === "soon" ? "قريباً" : p.nameAr,
        count: matched.length,
        matched,
        priceFrom: pr?.min ?? null,
        priceTo: pr?.max ?? null,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export interface GuideTables {
  districtSlug: string;
  districtAr: string;
  live: boolean;
  updatedAt: string;
  listed: number;
  available: number;
  fromPrice: number | null;
  ppm: Range | null;
  area: Range | null;
  byBeds: BedsRow[];
  byType: TypeRow[];
  byProject: { project: Project; fromPrice: number | null; ppmFrom: number | null; available: number; listed: number }[];
  scale: Range; // the bar scale «400 ألف إلى 1.7 مليون», rounded outwards to 100,000
}
/** Price guide rows for a district (only الروضة is live with the fixtures). */
export function guideTables(districtSlug = "rawdah", overrides?: UnitOverrides): GuideTables {
  const inDistrict = (u: Unit) => unitDistrictSlug(u) === districtSlug;
  const listed = listedUnits(overrides).filter(inDistrict);
  const avail = listed.filter((u) => u.status === "available");
  const pr = priceRange(listed);
  const byProject = publicProjects()
    .filter((p) => p.districtSlug === districtSlug)
    .map((p) => {
      const pl = listed.filter((u) => u.projectId === p.id);
      const pa = pl.filter((u) => u.status === "available");
      return { project: p, fromPrice: fromPrice(pa), ppmFrom: ppmRange(pa)?.min ?? null, available: pa.length, listed: pl.length };
    });
  const bedsRows = rangeByBeds(overrides).map((r) => ({ ...r, units: r.units.filter(inDistrict) })).filter((r) => listed.some((u) => u.beds === r.beds));
  const typeRows = rangeByType(overrides).filter((r) => listed.some((u) => u.type === r.type));
  return {
    districtSlug,
    districtAr: districtAr(districtSlug),
    live: listed.length > 0,
    updatedAt: latestUpdate(listed),
    listed: listed.length,
    available: avail.length,
    fromPrice: fromPrice(avail),
    ppm: ppmRange(avail),
    area: areaRange(avail),
    byBeds: bedsRows,
    byType: typeRows,
    byProject,
    scale: pr ? { min: Math.floor(pr.min / 100000) * 100000, max: Math.ceil(pr.max / 100000) * 100000 } : { min: 0, max: 0 },
  };
}
/** The guide's district chips as designed: the live district first, then «قريباً» for every district without a guide. */
export const GUIDE_CHIP_SLUGS = ["rawdah", "faisaliyah", "obhur-north", "shati"];
export function guideDistricts(overrides?: UnitOverrides, slugs: string[] = GUIDE_CHIP_SLUGS): { district: District; live: boolean; listed: number }[] {
  const listed = listedUnits(overrides);
  return slugs
    .map((s) => districtBySlug(s))
    .filter((d): d is District => !!d)
    .map((d) => {
      const n = listed.filter((u) => unitDistrictSlug(u) === d.slug).length;
      return { district: d, live: n > 0, listed: n };
    });
}

export interface BuildingCount {
  code: "RZ" | "YS";
  nameAr: string;
  letter: string;
  listed: number;
  available: number;
  sold: number;
  apartments: number;
  roofs: number;
  from: number | null;
  to: number | null;
  units: Unit[];
}
/** «4 شقق (A إلى D) وفيلا روف · 5 من 5 متاحة» per building. */
export function projectBuildingCounts(projectId = "rwd-01", overrides?: UnitOverrides): BuildingCount[] {
  const p = projectById(projectId);
  if (!p) return [];
  const listed = listedUnits(overrides).filter((u) => u.projectId === projectId);
  return p.buildings.map((b) => {
    const bu = listed.filter((u) => u.building === b.code);
    const avail = bu.filter((u) => u.status === "available");
    const pr = priceRange(bu);
    return {
      code: b.code,
      nameAr: b.nameAr,
      letter: b.letter,
      listed: bu.length,
      available: avail.length,
      sold: bu.filter((u) => u.status === "sold").length,
      apartments: bu.filter((u) => u.type === "apartment").length,
      roofs: bu.filter((u) => u.type === "roof-villa").length,
      from: pr?.min ?? null,
      to: pr?.max ?? null,
      units: bu,
    };
  });
}
export interface ProjectStats {
  listed: number;
  available: number;
  sold: number;
  reserved: number;
  fromPrice: number | null;
  toPrice: number | null;
  ppm: Range | null;
  beds: Range | null;
  area: Range | null;
  updatedAt: string;
  buildings: number;
}
/** The project card and hero numbers (8 / 10, from 459,000, per m² from 3,819 …). */
export function projectStats(projectId = "rwd-01", overrides?: UnitOverrides): ProjectStats {
  const listed = listedUnits(overrides).filter((u) => u.projectId === projectId);
  const avail = listed.filter((u) => u.status === "available");
  const pr = priceRange(avail);
  return {
    listed: listed.length,
    available: avail.length,
    sold: listed.filter((u) => u.status === "sold").length,
    reserved: listed.filter((u) => u.status === "reserved").length,
    fromPrice: pr?.min ?? null,
    toPrice: pr?.max ?? null,
    ppm: ppmRange(avail),
    beds: bedsRange(listed),
    area: areaRange(listed),
    updatedAt: latestUpdate(listed),
    buildings: projectById(projectId)?.buildings.length ?? 0,
  };
}
/** Other listed models in the same building (Unit-D «نماذج أخرى في جاردن الروضة»). */
export function otherModelsInBuilding(unit: Unit, overrides?: UnitOverrides): Unit[] {
  return sortUnits(listedUnits(overrides).filter((u) => u.building === unit.building && u.code !== unit.code), "price");
}
/** Available units with the same bedroom count, cheapest first (Unit-Sold-M «متاح الآن بنفس الغرف»). */
export function similarAvailable(unit: Unit, overrides?: UnitOverrides): Unit[] {
  return sortUnits(availableUnits(overrides).filter((u) => u.beds === unit.beds && u.code !== unit.code), "price");
}
/** The other roof villa in the project (Unit-Roof-M «الروف الآخر في المشروع»). */
export function otherRoof(unit: Unit, overrides?: UnitOverrides): Unit | null {
  return listedUnits(overrides).find((u) => u.type === "roof-villa" && u.projectId === unit.projectId && u.code !== unit.code) ?? null;
}
/** Units per budget chip (Admin-Lists-D «حتى 500 ألف · 3 وحدات»). */
export function budgetChipCounts(overrides?: UnitOverrides): { key: string; labelAr: string; value: number; visible: boolean; count: number; noteAr?: string }[] {
  const avail = availableUnits(overrides);
  return lists.budgets.map((b) => ({ key: b.key, labelAr: b.labelAr, value: b.value ?? 0, visible: b.visible ?? true, noteAr: b.noteAr, count: avail.filter((u) => (b.key.startsWith("over") || /أكثر من/.test(b.labelAr) ? u.priceSar > (b.value ?? 0) : u.priceSar <= (b.value ?? 0))).length }));
}
/** «+1.8%» for the import preview: percentage change, one decimal. */
export function importDiffPct(from: number, to: number): number {
  return Math.round(((to - from) / from) * 1000) / 10;
}
/** «16% يبحثون بين 850 ألف ومليون ولا توجد وحدة في هذا النطاق (أقرب وحدة: 690 ألف ثم 1.6 مليون).» computed. */
export function supplyGapLine(period: AnalyticsPeriodKey = "30d", overrides?: UnitOverrides): { pct: number; band: Range; below: number | null; above: number | null; inBand: number; lineAr: string } {
  const p = analytics.periods[period];
  const band = { min: 850000, max: 1000000 };
  const pct = p.budgetBands.filter((b) => (b.min ?? 0) >= band.min && (b.max ?? Infinity) <= band.max).reduce((s, b) => s + b.pct, 0) || p.budgetBands[5].pct;
  const avail = availableUnits(overrides);
  const inBand = avail.filter((u) => u.priceSar >= band.min && u.priceSar <= band.max).length;
  const belowList = avail.filter((u) => u.priceSar < band.min).map((u) => u.priceSar);
  const aboveList = avail.filter((u) => u.priceSar > band.max).map((u) => u.priceSar);
  const below = belowList.length ? Math.max(...belowList) : null;
  const above = aboveList.length ? Math.min(...aboveList) : null;
  const compact = (n: number) => (n >= 1000000 ? `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)} مليون` : `${fmt(n / 1000)} ألف`);
  const lineAr = inBand === 0
    ? `${pct}% يبحثون بين 850 ألف ومليون ولا توجد وحدة في هذا النطاق (أقرب وحدة: ${below != null ? compact(below) : "—"} ثم ${above != null ? compact(above) : "—"}).`
    : `${pct}% يبحثون بين 850 ألف ومليون، ولدينا ${unitsWord(inBand)} في هذا النطاق.`;
  return { pct, band, below, above, inBand, lineAr };
}

// ---------------------------------------------------------------------------
// Owner form (أضف عقارك) and approvals
// ---------------------------------------------------------------------------

export interface OwnerComputed {
  ppmBuild: number | null; // «سعر المتر على البناء»
  ppmLand: number | null; // «سعر المتر على الأرض»
  ppm: number | null; // apartments / villas / land: price ÷ area
  yieldPct: number | null; // «العائد السنوي الإجمالي» = income ÷ price, one decimal
}
/** Per-m² on build and land, and gross yield, from the step-2 inputs. */
export function ownerFormComputed(input: { askedPriceSar: number; buildM2?: number | null; landM2?: number | null; areaM2?: number | null; incomeYearSar?: number | null }): OwnerComputed {
  const price = input.askedPriceSar || 0;
  const ppmBuild = input.buildM2 && price ? round(price / input.buildM2) : null;
  const ppmLand = input.landM2 && price ? round(price / input.landM2) : null;
  const area = input.areaM2 || input.landM2;
  const ppm = area && price ? round(price / area) : null;
  const yieldPct = input.incomeYearSar && price ? Math.round((input.incomeYearSar / price) * 1000) / 10 : null;
  return { ppmBuild, ppmLand, ppm, yieldPct };
}
export function approvalComputed(a: Approval): OwnerComputed {
  return ownerFormComputed({ askedPriceSar: a.askedPriceSar, buildM2: a.buildM2, landM2: a.landM2, areaM2: a.areaM2, incomeYearSar: a.incomeYearSar });
}
/** An asked per-m² against the district's available median; null = «لا مرجع في الحي». */
export function vsDistrict(ppm: number, districtSlug: string, overrides?: UnitOverrides): { medianPpm: number; pct: number; lineAr: string } | null {
  const vals = availableUnits(overrides).filter((u) => unitDistrictSlug(u) === districtSlug).map(unitPpm).sort((a, b) => a - b);
  if (!vals.length) return null;
  const median = vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
  const pct = Math.round(((ppm - median) / median) * 100);
  return { medianPpm: round(median), pct, lineAr: `${pct >= 0 ? "+" : "−"}${Math.abs(pct)}% عن الحي` };
}
export function effectiveApprovalStatus(a: Approval, overrides?: Record<string, ApprovalStatus>): ApprovalStatus {
  return overrides?.[a.id] ?? a.status;
}
/** Hours since submission at `now`. */
export function approvalAgeHours(a: Approval, now: string | Date = NOW): number {
  return Math.max(0, Math.floor((toDate(now).getTime() - new Date(a.submittedAt).getTime()) / 3600000));
}
/** Items still unchecked for a role («بقي بندان في التحقق»). */
export function checklistRemaining(a: Approval, role: ApprovalRole = a.role, done?: Record<number, boolean>): number {
  return a.checklist[role].filter((it, i) => !(done?.[i] ?? it.done)).length;
}
export function approvalCounts(overrides?: Record<string, ApprovalStatus>): { open: number; new: number; awaitingPhotos: number; approved: number; rejected: number; withdrawn: number; closed: number } {
  const st = (a: Approval) => effectiveApprovalStatus(a, overrides);
  const all = allApprovals;
  const nw = all.filter((a) => st(a) === "new").length;
  const aw = all.filter((a) => st(a) === "awaiting-photos").length;
  const approved = all.filter((a) => st(a) === "approved").length;
  const withdrawn = all.filter((a) => st(a) === "rejected" && a.withdrawn).length;
  const rejected = all.filter((a) => st(a) === "rejected" && !a.withdrawn).length;
  return { open: nw + aw, new: nw, awaitingPhotos: aw, approved, rejected, withdrawn, closed: approved + rejected + withdrawn };
}

// ---------------------------------------------------------------------------
// Alliance: coverage, directory, radar, ledger, routing, protection, report
// ---------------------------------------------------------------------------

/** Active members covering each district: { count, officeIds }. */
export function coverageByDistrict(members: Office[] = activeOffices()): Record<string, { count: number; officeIds: string[] }> {
  const out: Record<string, { count: number; officeIds: string[] }> = {};
  for (const d of districts) out[d.slug] = { count: 0, officeIds: [] };
  for (const o of members) for (const s of o.districts) if (out[s]) { out[s].count++; out[s].officeIds.push(o.id); }
  return out;
}
export interface SectorCoverage {
  sector: District["sector"];
  labelAr: string;
  offices: number; // «شمال جدة · 5 مكاتب»
  districts: { district: District; count: number; officeIds: string[]; wanted: boolean }[];
}
/** The coverage hexagon grid, sector by sector (Alliance-D, AllianceApply-Step2-D). `wanted` = demand with no member. */
export function coverageBySector(members: Office[] = activeOffices()): SectorCoverage[] {
  const cov = coverageByDistrict(members);
  return SECTOR_ORDER.map((sector) => ({
    sector,
    labelAr: SECTORS[sector].ar,
    offices: members.filter((o) => o.sector === sector).length,
    districts: districtsBySector(sector).map((district) => ({
      district,
      count: cov[district.slug]?.count ?? 0,
      officeIds: cov[district.slug]?.officeIds ?? [],
      wanted: (cov[district.slug]?.count ?? 0) === 0 && (analytics.districtSessions30d[district.slug] ?? 0) >= 20,
    })),
  }));
}
/** Members shown in the public directory: active and opted in, abjad order. */
export function directory(members: Office[] = offices): Office[] {
  return members.filter((o) => o.status === "active" && o.inDirectory);
}
/** «12 عضواً موثّقاً · 5 جهات · N حياً» */
export function memberCounts(members: Office[] = offices): { members: number; active: number; suspended: number; sectors: number; districtsCovered: number; joinedThisMonth: number } {
  const active = members.filter((o) => o.status === "active");
  return {
    members: members.length,
    active: active.length,
    suspended: members.length - active.length,
    sectors: new Set(active.map((o) => o.sector)).size,
    districtsCovered: new Set(active.flatMap((o) => o.districts)).size,
    joinedThisMonth: members.filter((o) => o.joinedThisMonth).length,
  };
}
/** «معطٍ» / «مستقبِل» / «متوازن»: gave = offers + requests given, received = requests received. */
export function ledgerNet(office: Office): { gave: number; received: number; net: "giver" | "receiver" | "balanced"; labelAr: string; lineAr: string } {
  const gave = office.ledger.offersGiven + office.ledger.requestsGiven;
  const received = office.ledger.requestsReceived;
  const net = gave > received ? "giver" : gave < received ? "receiver" : "balanced";
  const labelAr = net === "giver" ? "معطٍ" : net === "receiver" ? "مستقبِل" : "متوازن";
  return { gave, received, net, labelAr, lineAr: `${labelAr} · ${gave} مقابل ${received}` };
}
/** «1 س 40 د» · «بلا رد» for 0 */
export function replyLabel(minutes: number): string {
  if (!minutes) return "بلا رد";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} س ${String(m).padStart(2, "0")} د` : `${m} د`;
}
/** Alliance-wide response numbers: mean and median reply minutes of active members, the fastest member. */
export function allianceReplyStats(members: Office[] = activeOffices()): { meanMinutes: number; medianMinutes: number; fastest: Office | null } {
  const vals = members.map((o) => o.ledger.avgReplyMinutes).filter((m) => m > 0).sort((a, b) => a - b);
  if (!vals.length) return { meanMinutes: 0, medianMinutes: 0, fastest: null };
  const mean = round(vals.reduce((s, v) => s + v, 0) / vals.length);
  const median = vals.length % 2 ? vals[(vals.length - 1) / 2] : round((vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2);
  const fastest = members.filter((o) => o.ledger.avgReplyMinutes > 0).sort((a, b) => a.ledger.avgReplyMinutes - b.ledger.avgReplyMinutes)[0] ?? null;
  return { meanMinutes: mean, medianMinutes: median, fastest };
}

const SPECIALTY_FOR_TYPE: [RegExp, string][] = [
  [/روف/, "فلل"],
  [/شقة|شقق/, "شقق"],
  [/فيلا|فلل/, "فلل"],
  [/أرض مطورة|أراضي مطورة/, "أراضي مطورة"],
  [/أرض خام|أراضي خام/, "أراضي خام"],
  [/أرض/, "أراضي مطورة"],
  [/عمارة تجارية|عماير تجارية/, "عماير تجارية"],
  [/عمارة|عماير/, "عماير سكنية"],
  [/مكتب/, "مكاتب"],
  [/مستودع/, "مستودعات"],
];
/** The specialty a request type maps to («شقة» → «شقق»). */
export function specialtyForType(type: string): string | null {
  return SPECIALTY_FOR_TYPE.find(([re]) => re.test(type))?.[1] ?? null;
}
export interface RoutedOffice {
  office: Office;
  rank: number;
  score: number;
  ledgerScore: number;
  speedScore: number;
  specialtyMatch: boolean;
  rankAr: string; // «الأول» · «الثاني»
}
const RANK_AR = ["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
/** Active members covering a district, ordered by the routing weights (ledger 50 · speed 30 · specialty 20). */
export function routingOrder(districtSlug: string, requestType = "", weights = allianceSettings.routing.weights, members: Office[] = activeOffices()): RoutedOffice[] {
  const covering = members.filter((o) => o.districts.includes(districtSlug));
  if (!covering.length) return [];
  const nets = covering.map((o) => ledgerNet(o).gave - ledgerNet(o).received);
  const minNet = Math.min(...nets);
  const maxNet = Math.max(...nets);
  const speeds = covering.map((o) => o.ledger.avgReplyMinutes || 24 * 60);
  const minS = Math.min(...speeds);
  const maxS = Math.max(...speeds);
  const spec = specialtyForType(requestType);
  const total = weights.ledger + weights.speed + weights.specialty || 1;
  return covering
    .map((office, i) => {
      const ledgerScore = maxNet === minNet ? 1 : (nets[i] - minNet) / (maxNet - minNet);
      const speedScore = maxS === minS ? 1 : 1 - (speeds[i] - minS) / (maxS - minS);
      const specialtyMatch = spec ? office.specialties.includes(spec) : false;
      const score = (weights.ledger * ledgerScore + weights.speed * speedScore + weights.specialty * (specialtyMatch ? 1 : 0)) / total;
      return { office, rank: 0, score, ledgerScore, speedScore, specialtyMatch, rankAr: "" };
    })
    .sort((a, b) => b.score - a.score || a.office.id.localeCompare(b.office.id))
    .map((r, i) => ({ ...r, rank: i + 1, rankAr: RANK_AR[i + 1] ?? `${i + 1}` }));
}
/** «ترتيبه في أبحر الشمالية: الأول» */
export function rankInDistrict(officeId: string, districtSlug: string, requestType = ""): RoutedOffice | null {
  return routingOrder(districtSlug, requestType).find((r) => r.office.id === officeId) ?? null;
}

export interface RadarRow {
  rank: number;
  district: District;
  sessions: number;
  smqUnits: number; // available SMQ units in the district
  members: number; // active members covering it
  memberIds: string[];
  suspendedIds: string[]; // «(ل موقوف)»
  openRequests: number;
  score: number; // sessions × (1 if no SMQ units) × members
  action: "send" | "needs-members" | "self";
  actionAr: string;
  detail?: (typeof analytics.radarDistricts)[string];
}
/** The radar table: districts ranked by opportunity = sessions × (1 if SMQ has no units there) × members covering. */
export function radarRanking(period: "30d" | "90d" = "30d", overrides?: UnitOverrides, requestOverrides?: Record<string, { stage?: RequestStage }>): RadarRow[] {
  const sessions = period === "90d" ? analytics.districtSessions90d : analytics.districtSessions30d;
  const cov = coverageByDistrict();
  const avail = availableUnits(overrides);
  const suspended = offices.filter((o) => o.status === "suspended");
  return districts
    .map((district) => {
      const s = sessions[district.slug] ?? 0;
      const smqUnits = avail.filter((u) => unitDistrictSlug(u) === district.slug).length;
      const members = cov[district.slug]?.count ?? 0;
      const openRequests = requests.filter((r) => r.districtSlug === district.slug && (requestOverrides?.[r.id]?.stage ?? r.stage) !== "closed").length;
      const score = s * (smqUnits === 0 ? 1 : 0) * members;
      const action: RadarRow["action"] = smqUnits > 0 ? "self" : members === 0 ? "needs-members" : "send";
      return {
        rank: 0,
        district,
        sessions: s,
        smqUnits,
        members,
        memberIds: cov[district.slug]?.officeIds ?? [],
        suspendedIds: suspended.filter((o) => o.districts.includes(district.slug)).map((o) => o.id),
        openRequests,
        score,
        action,
        actionAr: action === "self" ? "نغطيه بأنفسنا" : action === "needs-members" ? "يحتاج أعضاء" : "أرسل للمكاتب",
        detail: analytics.radarDistricts[district.slug],
      };
    })
    .filter((r) => r.sessions > 0)
    .sort((a, b) => b.score - a.score || b.sessions - a.sessions)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

/** Days of protection left at `today`; 0 once the deal closed or the period ended. */
export function protectionDaysLeft(referral: Referral, today: string | Date = TODAY, stageOverride?: ReferralStage): number {
  const stage = stageOverride ?? referral.stage;
  if (stage === "transfer" || stage === "failed") return 0;
  const elapsed = Math.floor((toDate(today).getTime() - new Date(referral.introducedOn + "T00:00:00+03:00").getTime()) / 86400000);
  return Math.max(0, referral.protectionDays - elapsed);
}
/** «90 يوماً حتى 2027/01/08» → the end date (YYYY-MM-DD). */
export function protectionUntil(referral: Referral): string {
  const d = new Date(referral.introducedOn + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + referral.protectionDays);
  return d.toISOString().slice(0, 10);
}
export function effectiveReferralStage(r: Referral, overrides?: Record<string, { stage: ReferralStage; note?: string }>): ReferralStage {
  return overrides?.[r.id]?.stage ?? r.stage;
}
/** «سجلات جارية 3 · قيمة الصفقات الجارية 4,690,000 · أُفرغت 2 · 3,900,000 · نزاعات 1» */
export function referralSummary(overrides?: Record<string, { stage: ReferralStage; note?: string }>, created: Referral[] = []): { ongoing: Referral[]; ongoingValue: number; transferred: Referral[]; transferredValue: number; disputes: number; all: Referral[] } {
  const all = [...created, ...referrals.filter((r) => !created.some((c) => c.id === r.id))];
  const st = (r: Referral) => effectiveReferralStage(r, overrides);
  const ongoing = all.filter((r) => ["intro", "viewing", "negotiation"].includes(st(r)));
  const transferred = all.filter((r) => st(r) === "transfer");
  return {
    ongoing,
    ongoingValue: ongoing.reduce((s, r) => s + r.valueSar, 0),
    transferred,
    transferredValue: transferred.reduce((s, r) => s + (r.finalValueSar ?? r.valueSar), 0),
    disputes: all.filter((r) => r.dispute && ["intro", "viewing", "negotiation"].includes(st(r))).length,
    all,
  };
}
/** Report slices: anything under `min` sessions is hidden from members (Admin-AllianceReport-D). */
export function reportSlices(slices: ReportSlice[], min = 20): { visible: ReportSlice[]; hidden: ReportSlice[] } {
  return { visible: slices.filter((s) => s.sessions >= min), hidden: slices.filter((s) => s.sessions < min) };
}

// Requests
export interface RequestOverride {
  stage?: RequestStage;
  offers?: AllianceRequest["offers"];
  referralId?: string;
}
/** The request with the store's stage / offers / referral merged in. */
export function effectiveRequest(r: AllianceRequest, overrides?: Record<string, RequestOverride>): AllianceRequest {
  const o = overrides?.[r.id];
  if (!o) return r;
  return { ...r, stage: o.stage ?? r.stage, offers: o.offers ?? r.offers, referralId: o.referralId ?? r.referralId };
}
export function requestsByStage(overrides?: Record<string, RequestOverride>): Record<RequestStage, AllianceRequest[]> {
  const out: Record<RequestStage, AllianceRequest[]> = { new: [], sent: [], offers: [], intro: [], closed: [] };
  for (const r of requests.map((x) => effectiveRequest(x, overrides))) out[r.stage].push(r);
  for (const k of Object.keys(out) as RequestStage[]) out[k].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}
/** Active members covering a request's district, in routing order (the «أُرسل إلى · مرتّبين بالميزان» list). */
export function requestCoverage(r: AllianceRequest): RoutedOffice[] {
  return routingOrder(r.districtSlug, r.type);
}
/** A member's view of a request: open · answered · expired (route-map «mreq»). */
export function memberRequestState(r: AllianceRequest, officeId: string, now: string | Date = NOW, overrides?: Record<string, RequestOverride>): "open" | "answered" | "expired" {
  const eff = effectiveRequest(r, overrides);
  if (eff.offers.some((o) => o.officeId === officeId)) return "answered";
  const entry = eff.sentTo.find((s) => s.officeId === officeId);
  if (entry?.status === "replied" || entry?.status === "none") return "answered";
  if (entry?.status === "expired" || eff.stage === "closed") return "expired";
  return toDate(now).getTime() < new Date(eff.expiresAt).getTime() ? "open" : "expired";
}
/** Requests waiting for this office's answer (Member-Ledger-M «طلبات مفتوحة في أحيائك»). */
export function openRequestsForOffice(officeId: string, now: string | Date = NOW, overrides?: Record<string, RequestOverride>): AllianceRequest[] {
  return requests.filter((r) => r.sentTo.some((s) => s.officeId === officeId) && memberRequestState(r, officeId, now, overrides) === "open");
}
/** «ينتهي بعد يومين و4 ساعات» */
export function expiresInLabel(expiresAt: string, now: string | Date = NOW): string {
  const ms = new Date(expiresAt).getTime() - toDate(now).getTime();
  if (ms <= 0) return "منتهٍ";
  const totalH = Math.floor(ms / 3600000);
  const d = Math.floor(totalH / 24);
  const h = totalH % 24;
  const dw = d === 0 ? "" : d === 1 ? "يوم" : d === 2 ? "يومين" : d <= 10 ? `${d} أيام` : `${d} يوماً`;
  const hw = h === 0 ? "" : h === 1 ? "ساعة" : h === 2 ? "ساعتين" : h <= 10 ? `${h} ساعات` : `${h} ساعة`;
  return [dw, hw].filter(Boolean).join(" و") || "أقل من ساعة";
}
/** The alliance room's overview tiles (Admin-Alliance-D, Admin-Alliance-M). */
export function allianceOverview(opts: { requestOverrides?: Record<string, RequestOverride>; referralOverrides?: Record<string, { stage: ReferralStage; note?: string }>; applicationOverrides?: Record<string, ApplicationStatus>; createdReferrals?: Referral[] } = {}) {
  const reqs = requests.map((r) => effectiveRequest(r, opts.requestOverrides));
  const open = reqs.filter((r) => r.stage !== "closed");
  const apps = applications.map((a) => ({ ...a, status: opts.applicationOverrides?.[a.id] ?? a.status }));
  const refs = referralSummary(opts.referralOverrides, opts.createdReferrals);
  const mc = memberCounts();
  return {
    members: mc.active,
    sectors: mc.sectors,
    districtsCovered: mc.districtsCovered,
    pendingApplications: apps.filter((a) => a.status === "review" || a.status === "missing").length,
    importedApplications: allApplications.filter((a) => a.status === "imported").length,
    openRequests: open.length,
    visitorOpenRequests: open.filter((r) => r.source === "visitor").length,
    awaitingDecision: reqs.filter((r) => r.stage === "offers").length,
    ongoingReferrals: refs.ongoing.length,
    viewing: refs.ongoing.filter((r) => effectiveReferralStage(r, opts.referralOverrides) === "viewing").length,
    negotiating: refs.ongoing.filter((r) => effectiveReferralStage(r, opts.referralOverrides) === "negotiation").length,
    closedDeals: refs.transferred.length,
    closedValue: refs.transferredValue,
    disputes: refs.disputes,
  };
}
export function applicationCounts(overrides?: Record<string, ApplicationStatus>): Record<ApplicationStatus, number> & { pending: number } {
  const out = { review: 0, missing: 0, verified: 0, rejected: 0, imported: 0, pending: 0 };
  for (const a of allApplications) out[overrides?.[a.id] ?? a.status]++;
  out.pending = out.review + out.missing;
  return out;
}

// ---------------------------------------------------------------------------
// Leads, marketers
// ---------------------------------------------------------------------------

export function effectiveLeadStatus(l: Lead, overrides?: Record<string, { status: LeadStatus; closedReason?: string }>): LeadStatus {
  return overrides?.[l.id]?.status ?? l.status;
}
/** 12 · 41 · 86 · 139 with the fixtures. */
export function leadCounts(overrides?: Record<string, { status: LeadStatus; closedReason?: string }>): { unanswered: number; answered: number; closed: number; total: number } {
  const st = leads.map((l) => effectiveLeadStatus(l, overrides));
  return { unanswered: st.filter((s) => s === "unanswered").length, answered: st.filter((s) => s === "answered").length, closed: st.filter((s) => s === "closed").length, total: st.length };
}
export function effectiveMarketerStage(m: Marketer, overrides?: Record<string, MarketerStage>): MarketerStage {
  return overrides?.[m.id] ?? m.stage;
}
export function marketersByStage(overrides?: Record<string, MarketerStage>): Record<MarketerStage, Marketer[]> {
  const out: Record<MarketerStage, Marketer[]> = { new: [], interview: [], accepted: [], active: [], suspended: [] };
  for (const m of marketers) out[effectiveMarketerStage(m, overrides)].push(m);
  return out;
}
/** «نشطون 4 · زيارات 1,284 · طلبات منسوبة 19 · صفقات قيد التفاوض 1» summed over active marketers. */
export function marketerSummary(overrides?: Record<string, MarketerStage>): { active: number; visits30d: number; whatsapp30d: number; leads: number; negotiating: number; avgConversionPct: number } {
  const active = marketers.filter((m) => effectiveMarketerStage(m, overrides) === "active");
  const visits = active.reduce((s, m) => s + m.stats.visits30d, 0);
  const wa = active.reduce((s, m) => s + m.stats.whatsapp30d, 0);
  return {
    active: active.length,
    visits30d: visits,
    whatsapp30d: wa,
    leads: active.reduce((s, m) => s + m.stats.leads, 0),
    negotiating: active.reduce((s, m) => s + m.stats.negotiating, 0),
    avgConversionPct: visits ? Math.round((wa / visits) * 100) : 0,
  };
}
/** A marketer's WhatsApp conversion: «9% · متوسط المسوّقين 6%» */
export function marketerConversion(m: Marketer, overrides?: Record<string, MarketerStage>): { pct: number; avgPct: number } {
  const others = marketers.filter((x) => x.id !== m.id && effectiveMarketerStage(x, overrides) === "active" && x.stats.visits30d);
  const avg = others.length ? Math.round(others.reduce((s, x) => s + x.stats.whatsapp30d / x.stats.visits30d, 0) / others.length * 100) : 0;
  return { pct: m.stats.visits30d ? Math.round((m.stats.whatsapp30d / m.stats.visits30d) * 100) : 0, avgPct: avg };
}

// ---------------------------------------------------------------------------
// Record numbers for created records
// ---------------------------------------------------------------------------

const nextNumber = (ids: string[], prefix: string, width: number) => {
  const max = ids.filter((id) => id.startsWith(prefix)).map((id) => parseInt(id.slice(prefix.length), 10)).filter((n) => !Number.isNaN(n)).reduce((m, n) => Math.max(m, n), 0);
  return `${prefix}${String(max + 1).padStart(width, "0")}`;
};
/** REQ-2026-0419 after the fixtures (pass the ids already created in the store to keep counting). */
export function nextRequestNumber(createdIds: string[] = []): string {
  return nextNumber([...requests.map((r) => r.id), ...createdIds], "REQ-2026-", 4);
}
/** 2026-1044 */
export function nextApprovalNumber(createdIds: string[] = []): string {
  return nextNumber([...allApprovals.map((a) => a.id), ...createdIds], "2026-", 4);
}
/** REF-2026-0118 */
export function nextReferralNumber(createdIds: string[] = []): string {
  return nextNumber([...referrals.map((r) => r.id), ...createdIds], "REF-2026-", 4);
}
/** ALL-2026-0039 */
export function nextApplicationNumber(createdIds: string[] = []): string {
  return nextNumber([...applications.map((a) => a.id), ...createdIds], "ALL-2026-", 4);
}

// ---------------------------------------------------------------------------
// Time: business hours, relative labels
// ---------------------------------------------------------------------------

function toDate(d: string | Date): Date {
  return typeof d === "string" ? new Date(d) : d;
}
function partsIn(d: Date, timeZone = TZ): { weekday: number; hour: number; minute: number; ymd: string } {
  const f = new Intl.DateTimeFormat("en-US", { timeZone, hour12: false, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(d).filter((x) => x.type !== "literal").map((x) => [x.type, x.value]));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { weekday, hour: parseInt(p.hour, 10) % 24, minute: parseInt(p.minute, 10), ymd: `${p.year}-${p.month}-${p.day}` };
}
/** «9:05 مساءً» */
export function timeLabelAr(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "صباحاً" : "مساءً"}`;
}
export interface ReplyTime {
  within: boolean;
  nowLabel: string;
  lineAr: string; // «الآن الساعة 9:05 مساءً، فالرد غداً في أول ساعة عمل.»
  hoursAr: string; // «السبت إلى الخميس من 9 صباحاً إلى 6 مساءً»
}
/** The contact success line, from the clock and the business hours (Contact-Success-M). */
export function replyTimeLine(now: string | Date = NOW, hours = settings.businessHours ?? { days: [6, 0, 1, 2, 3, 4], open: 9, close: 18, timeZone: TZ }): ReplyTime {
  const p = partsIn(toDate(now), hours.timeZone);
  const workday = hours.days.includes(p.weekday);
  const within = workday && p.hour >= hours.open && p.hour < hours.close;
  const nowLabel = timeLabelAr(p.hour, p.minute);
  const hoursAr = `السبت إلى الخميس من ${hours.open} صباحاً إلى ${hours.close - 12} مساءً`;
  let lineAr: string;
  if (within) lineAr = `الآن الساعة ${nowLabel}، فالرد خلال ساعات العمل اليوم.`;
  else if (!workday) lineAr = `اليوم الجمعة، فالرد يوم السبت في أول ساعة عمل.`;
  else if (p.hour < hours.open) lineAr = `الآن الساعة ${nowLabel}، فالرد في أول ساعة عمل اليوم.`;
  else if (p.weekday === 4) lineAr = `الآن الساعة ${nowLabel}، فالرد يوم السبت في أول ساعة عمل.`;
  else lineAr = `الآن الساعة ${nowLabel}، فالرد غداً في أول ساعة عمل.`;
  return { within, nowLabel, lineAr, hoursAr };
}
/** «قبل 14 د» · «قبل ساعة» · «قبل ساعتين» · «قبل 3 ساعات» · «أمس» · «قبل يومين» · «2026/10/02» */
export function agoLabel(iso: string, now: string | Date = NOW): string {
  const a = new Date(iso);
  const n = toDate(now);
  const mins = Math.max(0, Math.floor((n.getTime() - a.getTime()) / 60000));
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} د`;
  const pa = partsIn(a);
  const pn = partsIn(n);
  const dayDiff = Math.round((Date.parse(pn.ymd) - Date.parse(pa.ymd)) / 86400000);
  const h = Math.floor(mins / 60);
  if (dayDiff === 0 || (dayDiff === 1 && h < 6)) return h === 1 ? "قبل ساعة" : h === 2 ? "قبل ساعتين" : h <= 10 ? `قبل ${h} ساعات` : `قبل ${h} ساعة`;
  if (dayDiff === 1) return "أمس";
  if (dayDiff === 2) return "قبل يومين";
  if (dayDiff <= 10) return `قبل ${dayDiff} أيام`;
  return pa.ymd.replaceAll("-", "/");
}
/** «اليوم 10:40» · «أمس 17:40» · «الخميس 21:15» · «2026/10/02» */
export function whenLabel(iso: string, now: string | Date = NOW): string {
  const a = new Date(iso);
  const pa = partsIn(a);
  const pn = partsIn(toDate(now));
  const dayDiff = Math.round((Date.parse(pn.ymd) - Date.parse(pa.ymd)) / 86400000);
  const t = `${pa.hour}:${String(pa.minute).padStart(2, "0")}`;
  if (dayDiff === 0) return `اليوم ${t}`;
  if (dayDiff === 1) return `أمس ${t}`;
  if (dayDiff < 7) return `${["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][pa.weekday]} ${t}`;
  return pa.ymd.replaceAll("-", "/");
}
