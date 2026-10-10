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
function MapIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M12 21s6-6.2 6-11a6 6 0 1 0-12 0c0 4.8 6 11 6 11z" />
      <path d="M9.5 10l2.5-1.5 2.5 1.5-2.5 1.5z" />
    </svg>
  );
}

/** «الفلاتر» ink button with the gold count (phone) · «الفلاتر · 3» on the map */
export function FiltersButton({ count, href, variant = "list", className }: { count: number; href: string; variant?: "list" | "map"; className?: string }) {
  return (
    <Link href={href} scroll={false} className={cx("inline-flex h-11 shrink-0 items-center gap-2 bg-ink px-3.5 text-label font-bold text-paper no-underline hover:bg-ink-2 motion-hover transition-colors", variant === "list" ? "cut-s" : "border-interactive", className)}>
      <FilterIcon />
      {variant === "map" ? <span>الفلاتر{count > 0 ? ` · ${count}` : ""}</span> : <span>الفلاتر</span>}
      {variant === "list" && count > 0 && <CountBadge>{count}</CountBadge>}
    </Link>
  );
}

/** «الترتيب: السعر، الأقل أولاً ▾» · a ghost control over a native select */
export function SortControl({ value, onChange, options, label = "الترتيب", prefix = "الترتيب:", className }: { value: SortParam; onChange: (s: SortParam) => void; options?: { value: SortParam; label: string }[]; label?: string; prefix?: string | null; className?: string }) {
  const opts = options ?? (Object.keys(SORT_LABELS) as SortParam[]).map((k) => ({ value: k, label: SORT_LABELS[k] }));
  const current = opts.find((o) => o.value === value) ?? opts[0];
  return (
    <span className={cx("relative inline-flex h-11 min-w-0 items-center gap-2 border-interactive bg-paper px-3 text-label font-bold text-ink", className)}>
      <span className="truncate">
        {prefix && <span className="font-medium text-muted">{prefix} </span>}
        {current.label}
      </span>
      <ChevronDownIcon size={16} />
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
export function ViewToggle({ active, gridHref, mapHref, labels, className }: { active: "grid" | "map"; gridHref: string; mapHref: string; labels?: boolean | "map"; className?: string }) {
  const item = "inline-flex h-full items-center gap-1.5 px-3 text-label font-bold no-underline";
  const words = labels === true || labels === "map";
  return (
    <div aria-label="طريقة العرض" className={cx("inline-flex h-11 shrink-0 items-stretch border-interactive bg-paper", className)}>
      {active === "grid" ? (
        <span aria-current="true" className={cx(item, "bg-ink text-paper")}>
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
        <span aria-current="true" className={cx(item, "bg-ink text-paper")}>
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

/** Active filter chips with «مسح الكل» */
export function ActiveChips({ filters, clearLabel = "مسح الكل", mode = "replace", className }: { filters: UnitFilters; clearLabel?: string | null; mode?: "push" | "replace"; className?: string }) {
  const chips = activeConstraints(filters);
  if (!chips.length) return null;
  return (
    <div className={cx("flex flex-wrap items-center gap-2", className)}>
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

/** the list and map URLs that keep the current query */
export function viewHrefs(filters: UnitFilters): { grid: string; map: string; sheet: string } {
  const clean = { ...filters, sheet: null };
  return { grid: unitsUrl({ ...clean, pin: null }), map: unitsUrl(clean, "/units/map"), sheet: unitsUrl({ ...clean, sheet: "filters" }, filters.pin ? "/units/map" : "/units") };
}
