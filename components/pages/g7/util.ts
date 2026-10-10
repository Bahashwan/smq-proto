// G7 · small helpers shared by the admin-core pages: Arabic counting words, approval and lead lines composed from the
// fixtures (never typed from the boards), the budget bars and the peak-hours window.
import type { AnalyticsPeriod, Approval, Lead, Unit } from "@/data/types";
import { LEAD_KIND_LABELS, LEAD_STATUS_LABELS } from "@/data/leads";
import { unitByCode } from "@/data/units";
import { districtAr } from "@/data/districts";
import { approvalAgeHours, approvalComputed, listedUnits, unitDistrictSlug, vsDistrict } from "@/data/selectors";
import { fmtNum, plural } from "@/lib/format";

/** «منذ ساعة» · «منذ ساعتين» · «منذ 9 ساعات» · «منذ 26 ساعة» */
export function sinceHours(h: number): string {
  if (h <= 1) return "منذ ساعة";
  if (h === 2) return "منذ ساعتين";
  if (h <= 10) return `منذ ${h} ساعات`;
  return `منذ ${h} ساعة`;
}
/** «صورة واحدة» · «صورتان» · «3 صور» · «12 صورة» */
export function photosWord(n: number): string {
  return plural(n, { one: "صورة واحدة", two: "صورتان", few: "صور", many: "صورة" });
}
/** «0 وحدات» · «وحدة واحدة» · «10 وحدات» (the boards write zero with the plural) */
export function unitsWord(n: number): string {
  if (n === 0) return "0 وحدات";
  return plural(n, { one: "وحدة واحدة", two: "وحدتان", few: "وحدات", many: "وحدة" });
}

/** «D · روز» */
export function unitShort(u: Pick<Unit, "model" | "buildingNameAr" | "type">): string {
  return `${u.type === "roof-villa" ? "روف" : u.model} · ${u.buildingNameAr}`;
}
/** «نموذج D روز» · «فيلا روف ياسمين» */
export function unitName(u: Pick<Unit, "model" | "buildingNameAr" | "type">): string {
  return u.type === "roof-villa" ? `فيلا روف ${u.buildingNameAr}` : `نموذج ${u.model} ${u.buildingNameAr}`;
}

/** Listed units per district slug (الروضة: 10). */
export function listedInDistrict(slug: string): number {
  return listedUnits().filter((u) => unitDistrictSlug(u) === slug).length;
}

// ---------------------------------------------------------------------------- approvals

/** «شقة 3 غرف · الروضة» from the fixture title. */
export function approvalTitle(a: Approval): string {
  return a.titleAr ?? `${a.typeLabelAr ?? ""} · ${districtAr(a.districtSlug)}`;
}
/** Hours since submission at the prototype clock. */
export function approvalAge(a: Approval): number {
  return approvalAgeHours(a);
}
/** The per-m² facts line of a submission: «120 م² · 5,167 للمتر · +4% عن الحي». */
export function approvalFacts(a: Approval): string[] {
  const c = approvalComputed(a);
  const out: string[] = [];
  if (a.areaM2) out.push(`${fmtNum(a.areaM2)} م²`);
  if (a.kind === "building") {
    if (c.ppmBuild) out.push(`${fmtNum(c.ppmBuild)} للمتر على البناء`);
  } else if (c.ppm) out.push(`${fmtNum(c.ppm)} للمتر`);
  if (a.kind !== "land" && a.kind !== "building" && c.ppm) {
    const vs = vsDistrict(c.ppm, a.districtSlug);
    out.push(vs ? vs.lineAr : "لا مرجع في الحي");
  }
  return out;
}

// ---------------------------------------------------------------------------- leads

/** Title and detail lines of a lead as the overview rows write them («واتساب · نموذج D روز» / «من بطاقة الوحدة · …»). */
export function leadLines(l: Lead): { title: string; detail: string } {
  const unit = l.unitCode ? unitByCode(l.unitCode) : undefined;
  const strip = (s: string) =>
    s
      .split(" · ")
      .filter((p) => !(l.code && p.includes(l.code)))
      .join(" · ");
  if (l.kind === "form") {
    const parts = l.detail.split(" · ");
    return { title: `${LEAD_KIND_LABELS.form} · ${parts[parts.length - 1]}`, detail: l.title };
  }
  if (l.kind === "notify") {
    const parts = l.detail.split(" · ");
    const sold = unit && unit.status === "sold" ? " (مباع)" : "";
    return { title: "أبلغني عند توفر مشابه", detail: `${unit ? unitName(unit) + sold : l.title} · ${parts[parts.length - 1]}` };
  }
  if ((l.kind === "whatsapp" || l.kind === "call") && unit) {
    const kind = l.kind === "whatsapp" ? "واتساب" : "اتصال";
    return { title: `${kind} · ${unitName(unit)}`, detail: strip(l.detail) };
  }
  return { title: l.title, detail: strip(l.detail) };
}

/** The word on the status pill: «بلا رد» · «تم الرد» · «تنبيه محفوظ» · «مغلق». */
export function leadStatusWord(l: Lead, status: Lead["status"]): string {
  if (status === "answered" && l.statusDetailAr && l.kind === "notify") return l.statusDetailAr;
  return LEAD_STATUS_LABELS[status];
}

// ---------------------------------------------------------------------------- analytics

/** The share of searches above a budget bound (850 ألف) from the period's bands. */
export function pctAbove(period: AnalyticsPeriod, bound: number): number {
  return period.budgetBands.filter((b) => b.min !== null && b.min >= bound).reduce((s, b) => s + b.pct, 0);
}
/** Index of the tallest budget band. */
export function peakBand(period: AnalyticsPeriod): number {
  let best = 0;
  period.budgetBands.forEach((b, i) => {
    if (b.pct > period.budgetBands[best].pct) best = i;
  });
  return best;
}
/** «9 إلى 11 مساءً»: the two-hour window with the most searches. */
export function peakHoursLabel(hours: number[]): string {
  let best = 0;
  for (let i = 0; i < 24; i++) if (hours[i] + hours[(i + 1) % 24] > hours[best] + hours[(best + 1) % 24]) best = i;
  const end = (best + 2) % 24;
  const h12 = (h: number) => (h % 12 === 0 ? 12 : h % 12);
  const part = (h: number) => (h < 12 ? "صباحاً" : h < 17 ? "ظهراً" : "مساءً");
  return part(best) === part(end) ? `${h12(best)} إلى ${h12(end)} ${part(end)}` : `${h12(best)} ${part(best)} إلى ${h12(end)} ${part(end)}`;
}
