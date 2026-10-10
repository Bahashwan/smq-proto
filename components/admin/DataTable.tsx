"use client";
// Data table (Components2 · 1). A CSS-grid table with ARIA table roles: sand head with sort marks, hairline rows,
// states hover (cream), selected (sand + gold bar at the start edge), focus (gold outline), changed (cream-focus),
// hidden/muted (muted text, the status keeps its shape). Selection, bulk actions slot, sticky head, row click.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "@/lib/format";

export interface Column<T> {
  key: string;
  label: ReactNode;
  /** Grid track, e.g. "90px", "1fr", "minmax(0,1fr)". Default "1fr". */
  width?: string;
  align?: "start" | "end" | "center";
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  /** Cell is LTR (codes, numbers) and right-aligned as the boards draw it. */
  ltr?: boolean;
  bold?: boolean;
  className?: string;
  /** Hide below md (phone); the table also scrolls horizontally. */
  hideOnPhone?: boolean;
}

export interface RowState {
  selected?: boolean;
  muted?: boolean;
  warning?: boolean;
  /** Row cannot be selected (hidden units). */
  selectionDisabled?: boolean;
}

export interface SortState {
  key: string;
  dir: "asc" | "desc";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Checkbox column with «تحديد الكل». */
  selectable?: boolean;
  /** Controlled selection (row keys). Uncontrolled when omitted. */
  selected?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Rendered in a sand bar above the rows while something is selected. */
  bulkActions?: (selectedKeys: string[]) => ReactNode;
  stickyHead?: boolean;
  onRowClick?: (row: T) => void;
  rowState?: (row: T) => RowState;
  sort?: SortState;
  onSort?: (key: string) => void;
  /** Trailing cell (e.g. the «تحرير» link) in its own track. */
  actions?: (row: T) => ReactNode;
  actionsWidth?: string;
  /** Accessible name of the table. */
  label: string;
  /** Minimum width before the table scrolls horizontally (phone). */
  minWidth?: number;
  /** Shown instead of the rows when `rows` is empty. */
  empty?: ReactNode;
  className?: string;
  /** Dense rows (py-2) for long lists. */
  dense?: boolean;
}

const ALIGN = { start: "text-start justify-start", end: "text-end justify-end", center: "text-center justify-center" } as const;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  selectable,
  selected,
  onSelectionChange,
  bulkActions,
  stickyHead,
  onRowClick,
  rowState,
  sort,
  onSort,
  actions,
  actionsWidth = "80px",
  label,
  minWidth = 640,
  empty,
  className,
  dense,
}: DataTableProps<T>) {
  const [internal, setInternal] = useState<string[]>([]);
  const sel = selected ?? internal;
  const setSel = (next: string[]) => {
    if (selected === undefined) setInternal(next);
    onSelectionChange?.(next);
  };

  const template = useMemo(() => {
    const tracks: string[] = [];
    if (selectable) tracks.push("36px");
    for (const c of columns) tracks.push(c.width ?? "1fr");
    if (actions) tracks.push(actionsWidth);
    return tracks.join(" ");
  }, [columns, selectable, actions, actionsWidth]);
  const gridStyle: CSSProperties = { gridTemplateColumns: template };

  const states = useMemo(() => rows.map((r) => rowState?.(r) ?? {}), [rows, rowState]);
  const selectableKeys = rows.filter((_, i) => !states[i].selectionDisabled).map(rowKey);
  const allSelected = selectableKeys.length > 0 && selectableKeys.every((k) => sel.includes(k));
  const someSelected = sel.length > 0 && !allSelected;
  const allRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggleAll = () => setSel(allSelected ? [] : selectableKeys);
  const toggleOne = (k: string) => setSel(sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>, row: T) => {
    if (!onRowClick) return;
    if (e.key === "Enter" || e.key === " ") {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "A" || (e.target as HTMLElement).tagName === "BUTTON") return;
      e.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className={cx("min-w-0 overflow-x-auto border-interactive bg-paper", className)}>
      <div role="table" aria-label={label} style={{ minWidth }} className="text-label">
        {selectable && sel.length > 0 && bulkActions && (
          <div className="flex flex-wrap items-center gap-3 border-b-[1.5px] border-ink bg-sand px-3.5 py-2 text-[12px] font-bold" role="toolbar" aria-label={label}>
            {bulkActions(sel)}
          </div>
        )}
        <div role="rowgroup" className={cx(stickyHead && "sticky top-0 z-10")}>
          <div role="row" style={gridStyle} className="grid items-center gap-3 border-b-[1.5px] border-ink bg-sand px-3.5 py-2.5 text-caption font-extrabold text-muted">
            {selectable && (
              <span role="columnheader" className="flex items-center">
                <input ref={allRef} type="checkbox" aria-label="تحديد الكل" checked={allSelected} onChange={toggleAll} className="size-4 accent-ink" />
              </span>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const mark = c.sortable ? (active ? (sort?.dir === "desc" ? "↓" : "↑") : "↕") : null;
              const content = (
                <>
                  {c.label}
                  {mark && <span aria-hidden> {mark}</span>}
                </>
              );
              return (
                <span key={c.key} role="columnheader" aria-sort={active ? (sort?.dir === "desc" ? "descending" : "ascending") : undefined} className={cx("min-w-0", ALIGN[c.align ?? "start"], c.hideOnPhone && "hidden md:block")}>
                  {c.sortable && onSort ? (
                    <button type="button" onClick={() => onSort(c.key)} className="cursor-pointer whitespace-nowrap font-extrabold hover:text-ink">
                      {content}
                    </button>
                  ) : (
                    content
                  )}
                </span>
              );
            })}
            {actions && <span role="columnheader" />}
          </div>
        </div>
        <div role="rowgroup">
          {rows.length === 0 && empty && <div className="p-4">{empty}</div>}
          {rows.map((row, i) => {
            const k = rowKey(row);
            const st = states[i];
            const isSel = st.selected ?? sel.includes(k);
            const clickable = !!onRowClick;
            return (
              <div
                key={k}
                role="row"
                style={gridStyle}
                tabIndex={clickable ? 0 : undefined}
                aria-selected={selectable ? isSel : undefined}
                onClick={clickable ? () => onRowClick(row) : undefined}
                onKeyDown={clickable ? (e) => onKey(e, row) : undefined}
                className={cx(
                  "relative grid items-center gap-3 border-b border-line px-3.5 last:border-b-0 motion-hover transition-colors",
                  dense ? "py-2" : "py-2.5",
                  clickable && "cursor-pointer",
                  isSel ? "bg-sand" : st.warning ? "bg-cream-focus" : "bg-paper hover:bg-cream",
                  st.muted && "text-muted",
                  "focus-visible:outline-2 focus-visible:outline-gold focus-visible:-outline-offset-2",
                )}
              >
                {isSel && <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />}
                {selectable && (
                  <span role="cell" className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label="تحديد" checked={isSel} disabled={st.selectionDisabled} onChange={() => toggleOne(k)} className="size-4 accent-ink" />
                  </span>
                )}
                {columns.map((c) => (
                  <span
                    key={c.key}
                    role="cell"
                    dir={c.ltr ? "ltr" : undefined}
                    className={cx("min-w-0", c.ltr ? "text-right" : ALIGN[c.align ?? "start"], c.bold && "font-extrabold", c.ltr && "tnum", c.hideOnPhone && "hidden md:block", c.className)}
                  >
                    {c.render ? c.render(row, i) : String((row as Record<string, unknown>)[c.key] ?? "")}
                  </span>
                ))}
                {actions && (
                  <span role="cell" className="flex items-center justify-start text-[12px] font-extrabold" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** A single presentational row with the same grid and states, for tables that are built by hand. */
export interface TableRowProps {
  template: string;
  /** `focus` and `hover` force those states (QA sheet). */
  state?: RowState & { focus?: boolean; hover?: boolean };
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  dense?: boolean;
}

export function TableRow({ template, state = {}, children, className, onClick, dense }: TableRowProps) {
  return (
    <div
      role="row"
      style={{ gridTemplateColumns: template }}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cx(
        "relative grid items-center gap-3 border-b border-line px-3.5 text-label last:border-b-0 motion-hover transition-colors",
        dense ? "py-2" : "py-2.5",
        onClick && "cursor-pointer",
        state.selected ? "bg-sand" : state.warning ? "bg-cream-focus" : state.hover ? "bg-cream" : "bg-paper hover:bg-cream",
        state.muted && "text-muted",
        state.focus && "outline-2 outline-gold -outline-offset-2",
        "focus-visible:outline-2 focus-visible:outline-gold focus-visible:-outline-offset-2",
        className,
      )}
    >
      {state.selected && <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />}
      {children}
    </div>
  );
}

export function TableHead({ template, children, className, sticky }: { template: string; children: ReactNode; className?: string; sticky?: boolean }) {
  return (
    <div role="row" style={{ gridTemplateColumns: template }} className={cx("grid items-center gap-3 border-b-[1.5px] border-ink bg-sand px-3.5 py-2.5 text-caption font-extrabold text-muted", sticky && "sticky top-0 z-10", className)}>
      {children}
    </div>
  );
}
