"use client";
// Results toolbar pieces (Results-M/D, Results-Map-M/D): the filters button with its count, the sort control,
// the grid / map view toggle and the active chips row with «مسح الكل».
import Link from "next/link";
import { ChevronDownIcon, CountBadge, FilterChip } from "@/components/ui";
import { cx } from "@/lib/format";
import { DEFAULT_FILTERS, unitsUrl, type SortParam, type UnitFilters } from "@/lib/url";
import { activeConstraints, withoutConstraint, SORT_LABELS } from "@/data/selectors";
import { writeFilters } from "./shared";

export function FilterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
      <path d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  );
}
function GridIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
    </svg>
  );
}
/** the folded map of the boards' view toggle */
function MapIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="miter">
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

/** «الفلاتر» ink button with the gold count (list) · «الفلاتر · 3» (map: `variant="map"`, 34px) */
export function FiltersButton({ count, href, variant = "list", className }: { count: number; href: string; variant?: "list" | "map"; className?: string }) {
  const map = variant === "map";
  return (
    <Link
      href={href}
      scroll={false}
      className={cx(
        "inline-flex shrink-0 items-center gap-2 bg-ink font-bold text-paper no-underline hover:bg-ink-2 motion-hover transition-colors",
        map ? "h-[34px] border-interactive px-3 text-caption font-extrabold" : "h-11 px-3 text-label cut-s",
        className,
      )}
    >
      <FilterIcon size={map ? 14 : 16} />
      {map ? <span>الفلاتر{count > 0 ? ` · ${count}` : ""}</span> : <span>الفلاتر</span>}
      {!map && count > 0 && <CountBadge>{count}</CountBadge>}
    </Link>
  );
}

/**
 * «الترتيب: السعر، الأقل أولاً ▾» · a ghost control over a native select. `stacked` (the phone toolbar) puts the
 * prefix above the value so both fit the 136px the row leaves.
 */
export function SortControl({ value, onChange, options, label = "الترتيب", prefix = "الترتيب:", stacked, size = "m", className }: { value: SortParam; onChange: (s: SortParam) => void; options?: { value: SortParam; label: string }[]; label?: string; prefix?: string | null; stacked?: boolean; size?: "m" | "s"; className?: string }) {
  const opts = options ?? (Object.keys(SORT_LABELS) as SortParam[]).map((k) => ({ value: k, label: SORT_LABELS[k] }));
  const current = opts.find((o) => o.value === value) ?? opts[0];
  const box = stacked ? "h-11 gap-1 px-2" : size === "s" ? "h-10 gap-2 px-2.5 text-[12px] font-bold" : "h-11 gap-2 px-3 text-label font-bold";
  return (
    <span className={cx("relative inline-flex min-w-0 items-center justify-between border-interactive bg-paper text-ink", box, className)}>
      {stacked ? (
        <span className="flex min-w-0 flex-col items-start">
          {prefix && <span className="text-caption font-medium leading-tight text-muted">{prefix}</span>}
          <span className="max-w-full truncate text-[12px] font-bold leading-tight">{current.label}</span>
        </span>
      ) : (
        <span className="truncate">
          {prefix && <span className="font-medium text-muted">{prefix} </span>}
          {current.label}
        </span>
      )}
      <ChevronDownIcon size={stacked ? 14 : 16} />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as SortParam)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

/** Grid / map toggle: the active side is ink; the other side links to the other view with the same query */
export function ViewToggle({ active, gridHref, mapHref, labels, size = "m", className }: { active: "grid" | "map"; gridHref: string; mapHref: string; labels?: boolean | "map"; size?: "m" | "s"; className?: string }) {
  const item = cx("inline-flex h-full items-center justify-center gap-1.5 no-underline", labels ? "px-3" : "w-11", size === "s" ? "text-caption font-bold" : "text-label font-bold");
  const words = labels === true || labels === "map";
  return (
    <div role="group" aria-label="طريقة العرض" className={cx("inline-flex shrink-0 items-stretch border-interactive bg-paper", size === "s" ? "h-[34px]" : "h-11", className)}>
      {active === "grid" ? (
        <span aria-current="true" aria-label={words ? undefined : "شبكة"} className={cx(item, "bg-ink text-paper")}>
          <GridIcon />
          {labels === true && <span>شبكة</span>}
        </span>
      ) : (
        <Link href={gridHref} aria-label={words ? undefined : "قائمة"} className={cx(item, "text-ink hover:bg-sand motion-hover transition-colors")}>
          {labels === "map" ? <span>قائمة</span> : <GridIcon />}
          {labels === true && <span>شبكة</span>}
        </Link>
      )}
      {active === "map" ? (
        <span aria-current="true" className={cx(item, "bg-ink font-extrabold text-paper")}>
          {labels === "map" ? <span>خريطة</span> : <MapIcon />}
          {labels === true && <span>خريطة</span>}
        </span>
      ) : (
        <Link href={mapHref} aria-label={words ? undefined : "خريطة"} className={cx(item, "text-ink hover:bg-sand motion-hover transition-colors")}>
          <MapIcon />
          {labels === true && <span>خريطة</span>}
        </Link>
      )}
    </div>
  );
}

/** Active filter chips with «مسح الكل»; `scroll` keeps them on one line that scrolls sideways (phone boards) */
export function ActiveChips({ filters, clearLabel = "مسح الكل", mode = "replace", scroll, className }: { filters: UnitFilters; clearLabel?: string | null; mode?: "push" | "replace"; scroll?: boolean; className?: string }) {
  const chips = activeConstraints(filters);
  if (!chips.length) return null;
  return (
    <div className={cx("flex items-center gap-1.5", scroll ? "-mx-4 overflow-x-auto px-4 pb-0.5 [&>*]:shrink-0" : "flex-wrap gap-2", className)}>
      {chips.map((c) => (
        <FilterChip key={c.key} onRemove={() => writeFilters({ ...filters, ...withoutConstraint(filters, c.key) }, mode)}>
          {c.chipAr}
        </FilterChip>
      ))}
      {clearLabel && (
        <button type="button" onClick={() => writeFilters({ ...DEFAULT_FILTERS, sort: filters.sort, pin: filters.pin }, mode)} className="h-8 px-1.5 text-caption font-bold text-gold-text underline hover:text-ink motion-hover transition-colors">
          {clearLabel}
        </button>
      )}
    </div>
  );
}

/** the list and map URLs that keep the current query; `sheet` opens the filters sheet over the current view */
export function viewHrefs(filters: UnitFilters, view: "grid" | "map" = "grid"): { grid: string; map: string; sheet: string } {
  const clean = { ...filters, sheet: null };
  return { grid: unitsUrl({ ...clean, pin: null }), map: unitsUrl(clean, "/units/map"), sheet: unitsUrl({ ...clean, sheet: "filters" }, view === "map" ? "/units/map" : "/units") };
}
