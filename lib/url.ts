// /units and /units/map URL parameters · docs/data-model.md «URL parameters»
export type UnitTypeParam = "apt" | "roof" | "villa" | "duplex";
export type SortParam = "price" | "ppm" | "area" | "delivery";

export interface UnitFilters {
  district: string | null; // slug or null = all
  min: number | null;
  max: number | null;
  type: UnitTypeParam[];
  beds: number | null; // 5 = 5+
  amin: number | null;
  amax: number | null;
  pstatus: "ready" | "construction" | null;
  delivery: "2026-end" | "2027-mid" | "2027-end" | null;
  feat: string[]; // maid, driver, balcony, roof, smart
  sort: SortParam;
  sheet: "filters" | null;
  pin: string | null;
}

export const DEFAULT_FILTERS: UnitFilters = {
  district: null, min: null, max: null, type: [], beds: null, amin: null, amax: null,
  pstatus: null, delivery: null, feat: [], sort: "price", sheet: null, pin: null,
};

const num = (v: string | null) => (v && /^\d+$/.test(v) ? parseInt(v, 10) : null);

export function parseFilters(q: URLSearchParams): UnitFilters {
  const type = (q.get("type") ?? "").split(",").filter((t): t is UnitTypeParam => ["apt", "roof", "villa", "duplex"].includes(t));
  const sort = q.get("sort");
  const district = q.get("district");
  return {
    district: district && district !== "all" ? district : null,
    min: num(q.get("min")),
    max: num(q.get("max")),
    type,
    beds: num(q.get("beds")),
    amin: num(q.get("amin")),
    amax: num(q.get("amax")),
    pstatus: q.get("pstatus") === "ready" || q.get("pstatus") === "construction" ? (q.get("pstatus") as UnitFilters["pstatus"]) : null,
    delivery: ["2026-end", "2027-mid", "2027-end"].includes(q.get("delivery") ?? "") ? (q.get("delivery") as UnitFilters["delivery"]) : null,
    feat: (q.get("feat") ?? "").split(",").filter(Boolean),
    sort: sort === "ppm" || sort === "area" || sort === "delivery" ? sort : "price",
    sheet: q.get("sheet") === "filters" ? "filters" : null,
    pin: q.get("pin"),
  };
}

export function filtersToParams(f: Partial<UnitFilters>): URLSearchParams {
  const p = new URLSearchParams();
  if (f.district) p.set("district", f.district);
  if (f.min != null) p.set("min", String(f.min));
  if (f.max != null) p.set("max", String(f.max));
  if (f.type && f.type.length) p.set("type", f.type.join(","));
  if (f.beds != null) p.set("beds", String(f.beds));
  if (f.amin != null) p.set("amin", String(f.amin));
  if (f.amax != null) p.set("amax", String(f.amax));
  if (f.pstatus) p.set("pstatus", f.pstatus);
  if (f.delivery) p.set("delivery", f.delivery);
  if (f.feat && f.feat.length) p.set("feat", f.feat.join(","));
  if (f.sort && f.sort !== "price") p.set("sort", f.sort);
  if (f.sheet) p.set("sheet", f.sheet);
  if (f.pin) p.set("pin", f.pin);
  return p;
}

export function unitsUrl(f: Partial<UnitFilters>, base = "/units"): string {
  const s = filtersToParams(f).toString();
  return s ? `${base}?${s}` : base;
}

export function compareUrl(slugs: string[]): string {
  return slugs.length ? `/compare?u=${slugs.join(",")}` : "/compare";
}
