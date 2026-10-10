// G2 · shared helpers of the results pages: URL writing, derived copy (delivery, project lines, counts),
// map pins. Every number comes from data/selectors.ts; the words follow the boards.
import type { Project, Unit } from "@/data/types";
import { projectById } from "@/data/projects";
import { districts, districtAr } from "@/data/districts";
import { modelLabel, UNIT_TYPE_AR } from "@/data/units";
import { bedsWord, deliveryQuarterIndex, pinCounts, type Pin, type UnitOverrides } from "@/data/selectors";
import { filtersToParams, type UnitFilters } from "@/lib/url";
import { setQuery } from "@/lib/location";
import { fmtNum } from "@/lib/format";
import type { MapPin } from "@/components/map";

export const FILTER_KEYS = ["district", "min", "max", "type", "beds", "amin", "amax", "pstatus", "delivery", "feat", "sort", "sheet", "pin"] as const;

/** Write a whole filter set to the URL: keys the set does not carry are removed. `extra` wins. */
export function writeFilters(f: Partial<UnitFilters>, mode: "push" | "replace" = "push", extra: Record<string, string | null> = {}): void {
  const p = filtersToParams(f);
  const changes: Record<string, string | null> = {};
  for (const k of FILTER_KEYS) changes[k] = p.get(k);
  Object.assign(changes, extra);
  setQuery(changes, mode);
}

/** A stable key of the filters that change the result set (not the sheet or the pin). */
export function filtersKey(f: Partial<UnitFilters>): string {
  const p = filtersToParams({ ...f, sheet: null, pin: null });
  return p.toString();
}

/** «تسليم الربع 2 · 2027» from the project's «التسليم» milestone (2027/Q2). */
export function deliveryShort(project: Project | undefined): string | undefined {
  const q = deliveryQuarterIndex(project);
  if (q == null) return undefined;
  const year = Math.floor((q - 1) / 4);
  const quarter = q - year * 4;
  return `تسليم الربع ${quarter} · ${year}`;
}
/** "Delivery Q2 2027" */
export function deliveryShortEn(project: Project | undefined): string | undefined {
  const q = deliveryQuarterIndex(project);
  if (q == null) return undefined;
  const year = Math.floor((q - 1) / 4);
  return `Delivery Q${q - year * 4} ${year}`;
}

/** «عمارتا روز وياسمين» · «عمارة روز» · «3 عمارات» */
export function buildingsPhrase(project: Project): string {
  const names = project.buildings.map((b) => b.nameAr);
  if (names.length === 1) return `عمارة ${names[0]}`;
  if (names.length === 2) return `عمارتا ${names[0]} و${names[1]}`;
  return `${names.length} عمارات`;
}
/** «عمارتان» · «عمارة واحدة» · «3 عمارات» */
export function buildingsCountWord(n: number): string {
  if (n === 1) return "عمارة واحدة";
  if (n === 2) return "عمارتان";
  return `${n} عمارات`;
}

/** «حي الروضة · عمارتا روز وياسمين · قيد الإنشاء» (+ « · تسليم الربع 2 · 2027» on the desktop board) */
export function projectLine(project: Project, withDelivery = false): string {
  const parts = [`حي ${districtAr(project.districtSlug)}`, buildingsPhrase(project), project.statusAr];
  const d = withDelivery ? deliveryShort(project) : undefined;
  if (d) parts.push(d);
  return parts.join(" · ");
}

/** «وحدة واحدة» · «وحدتان» · «6 وحدات» · «12 وحدة» (nominative, as the selectors print) */
export function unitsWord(n: number): string {
  if (n === 1) return "وحدة واحدة";
  if (n === 2) return "وحدتان";
  if (n >= 3 && n <= 10) return `${n} وحدات`;
  return `${n} وحدة`;
}
/** «اعرض 6 وحدات» (the filters sheet button) */
export function showUnitsLabel(n: number): string {
  if (n === 0) return "لا نتائج مطابقة";
  if (n === 1) return "اعرض وحدة واحدة";
  if (n === 2) return "اعرض وحدتين";
  if (n <= 10) return `اعرض ${n} وحدات`;
  return `اعرض ${n} وحدة`;
}
/** «عرض 3 وحدات أخرى» (load more) */
export function moreUnitsLabel(n: number): string {
  if (n === 1) return "عرض وحدة واحدة أخرى";
  if (n === 2) return "عرض وحدتين أخريين";
  if (n <= 10) return `عرض ${n} وحدات أخرى`;
  return `عرض ${n} وحدة أخرى`;
}
const ORDINALS = ["", "", "الوحدتين", "الثلاث", "الأربع", "الخمس", "الست", "السبع", "الثماني", "التسع", "العشر"];
/** «اعرض الوحدات السبع» · «اعرض الوحدة» · «اعرض الوحدتين» · «اعرض 12 وحدة» */
export function showTheUnitsLabel(n: number): string {
  if (n === 1) return "اعرض الوحدة";
  if (n === 2) return "اعرض الوحدتين";
  if (n >= 3 && n <= 10) return `اعرض الوحدات ${ORDINALS[n]}`;
  return `اعرض ${n} وحدة`;
}
/** «مشروعين» · «مشروع واحد» · «3 مشاريع» */
export function projectsWord(n: number): string {
  if (n === 1) return "مشروع واحد";
  if (n === 2) return "مشروعين";
  if (n >= 3 && n <= 10) return `${n} مشاريع`;
  return `${n} مشروعاً`;
}

/** «نموذج D روز» · «روف ياسمين» (compare bar names, Results-D) */
export function compareName(unit: Unit): string {
  return unit.type === "roof-villa" ? `${modelLabel(unit)} ${unit.buildingNameAr}` : `نموذج ${modelLabel(unit)} ${unit.buildingNameAr}`;
}

/** The sold strip's order: the latest sale first (Results-M/D: «A · ياسمين» 2026/09 before «C · ياسمين» 2026/08) */
export function latestSoldFirst(list: Unit[]): Unit[] {
  return [...list].sort((a, b) => (b.soldOn ?? "").localeCompare(a.soldOn ?? ""));
}

/** «غرفتان و3 غرف» from a list of units */
export function bedsPhrase(list: Unit[]): string {
  const beds = [...new Set(list.map((u) => u.beds))].sort((a, b) => a - b);
  return beds.map(bedsWord).join(" و");
}
/** «شقة وفيلا روف» · «فيلا روف» */
export function typesPhrase(list: Unit[]): string {
  const types = [...new Set(list.map((u) => u.type))];
  return types.map((t) => UNIT_TYPE_AR[t]).join(" و");
}

/** Nearest district (by centre) for a pin without a board position, e.g. the owner group placed at الصفا. */
export function nearestDistrictSlug(centre: { lat: number; lng: number }): string {
  let best = districts[0]?.slug ?? "rawdah";
  let bestD = Infinity;
  for (const d of districts) {
    const dd = (d.centre.lat - centre.lat) ** 2 + (d.centre.lng - centre.lng) ** 2;
    if (dd < bestD) {
      bestD = dd;
      best = d.slug;
    }
  }
  return best;
}

export interface ResultPin extends MapPin {
  pin: Pin;
}
/** The hexagon pins of the map view: one per project with its computed count; owner groups with no match are hidden. */
export function buildPins(filters: Partial<UnitFilters>, overrides?: UnitOverrides): ResultPin[] {
  return pinCounts(filters, overrides)
    .filter((p) => !(p.kind === "owner" && p.count === 0))
    .map((p) => {
      const project = projectById(p.projectId);
      const slug = project?.autoGroup ? nearestDistrictSlug(p.centre) : p.districtSlug;
      const dAr = districtAr(slug);
      return {
        id: p.projectId,
        districtSlug: slug,
        kind: p.kind,
        count: p.kind === "soon" ? undefined : p.count,
        label: p.kind === "owner" ? `من مالك · ${dAr}` : p.nameAr,
        pin: { ...p, districtSlug: slug, districtAr: dAr },
      };
    });
}

/** The board's phone map title: «8 وحدات · حتى 700 ألف» */
export function budgetShort(max: number | null): string | null {
  if (max == null) return null;
  if (max >= 1_000_000) {
    const m = max / 1_000_000;
    return `حتى ${Number.isInteger(m) ? m : m.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} مليون`;
  }
  return `حتى ${Math.round(max / 1000)} ألف`;
}

/** «05X XXX 3390» from a typed number (the buyer's number never reaches a member) */
export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 6) return "05X XXX XXXX";
  return `${d.slice(0, 2)}X XXX ${d.slice(-4)}`;
}

/** «+6 وحدات» · «+2 وحدة» · «+12 وحدة» (the board's pill form) */
export function deltaUnits(n: number): string {
  return `+${n} ${n >= 3 && n <= 10 ? "وحدات" : "وحدة"}`;
}

/** «بيعت 2026/09» from the unit's sale date */
export function soldMonth(u: Unit): string | null {
  return u.soldOn ? `بيعت ${u.soldOn.slice(0, 7).replace("-", "/")}` : null;
}

function millions(n: number): string {
  return String(Math.round((n / 1_000_000) * 100) / 100);
}
/** The map side list's last line: «و2 وحدة أخرى · فيلتا الروف خارج الميزانية (1.6 و1.65 مليون)» */
export function otherUnitsNote(others: Unit[], max: number | null): string | null {
  const n = others.length;
  if (!n) return null;
  const count = `و${n} ${n >= 3 && n <= 10 ? "وحدات أخرى" : "وحدة أخرى"}`;
  const overBudget = max != null && others.every((u) => u.priceSar > max);
  const types = [...new Set(others.map((u) => u.type))];
  let what = "";
  if (types.length === 1) {
    if (types[0] === "roof-villa") what = n === 1 ? "فيلا الروف" : n === 2 ? "فيلتا الروف" : "فلل الروف";
    else what = n === 1 ? "الشقة" : n === 2 ? "الشقتان" : "الشقق";
  }
  const reason = overBudget ? "خارج الميزانية" : "خارج فلاترك";
  const prices = [...others.map((u) => u.priceSar)].sort((a, b) => a - b);
  let priceNote = "";
  if (overBudget && n <= 3) {
    priceNote = prices.every((p) => p >= 1_000_000) ? ` (${prices.map(millions).join(" و")} مليون)` : ` (${prices.map(fmtNum).join(" و")})`;
  }
  return `${count} · ${what ? `${what} ` : ""}${reason}${priceNote}`;
}

/** One-sided 1.5px ink rules from the border token (the boards' section dividers) */
export const RULE_B = "[border-block-end:var(--smq-border-interactive)]";
export const RULE_T = "[border-block-start:var(--smq-border-interactive)]";
export const RULE_E = "[border-inline-end:var(--smq-border-interactive)]";
