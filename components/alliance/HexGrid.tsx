import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { HexCell, type HexCellProps } from "./HexCell";
import { chunk } from "./lib";

export interface HexGridProps {
  cells: (HexCellProps & { key?: string })[];
  /** cells per row: 6 on desktop sheets, 5 on phone */
  columns?: number;
  /** phone column count (renders a second, phone-only copy of the grid) */
  columnsSm?: number;
  size?: number;
  sizeSm?: number;
  /** gap between cells (5px; 4px at phone size) */
  gap?: number;
  rowGap?: number;
  /** honeycomb: alternate rows move half a cell inline-start. "odd" shifts the second row, "even" the first. */
  shift?: "odd" | "even" | "none";
  align?: "start" | "center";
  className?: string;
  ariaLabel?: string;
  /** rendered after the rows (notes, legends) */
  children?: ReactNode;
}

function Rows({ cells, columns, size, gap, rowGap, shift, align }: Required<Pick<HexGridProps, "cells" | "columns" | "size" | "gap" | "rowGap" | "shift" | "align">>) {
  const rows = chunk(cells, columns);
  const offset = size / 2 + gap / 2;
  return (
    <div className={cx("flex flex-col", align === "center" ? "items-center" : "items-start")} style={{ gap: rowGap }}>
      {rows.map((row, r) => {
        const shifted = shift === "none" ? false : shift === "odd" ? r % 2 === 1 : r % 2 === 0;
        return (
          <div key={r} className="flex" style={{ gap, marginInlineStart: shifted && align === "start" ? offset : 0 }}>
            {row.map(({ key, ...cell }, i) => (
              <HexCell key={key ?? `${r}-${i}`} size={size} {...cell} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** Rows of hexagon cells, the second row moved half a cell (the Components3 honeycomb rule). */
export function HexGrid({ cells, columns = 6, columnsSm, size = 84, sizeSm, gap, rowGap = 3, shift = "odd", align = "start", className, ariaLabel, children }: HexGridProps) {
  const g = gap ?? (size <= 60 ? 4 : 5);
  const desktop = <Rows cells={cells} columns={columns} size={size} gap={g} rowGap={rowGap} shift={shift} align={align} />;
  if (!columnsSm && !sizeSm) {
    return (
      <div className={className} role={ariaLabel ? "group" : undefined} aria-label={ariaLabel}>
        {desktop}
        {children}
      </div>
    );
  }
  const s = sizeSm ?? size;
  const phone = <Rows cells={cells} columns={columnsSm ?? columns} size={s} gap={gap ?? (s <= 60 ? 4 : 5)} rowGap={rowGap} shift={shift} align={align} />;
  return (
    <div className={className} role={ariaLabel ? "group" : undefined} aria-label={ariaLabel}>
      <div className="md:hidden">{phone}</div>
      <div className="hidden md:block">{desktop}</div>
      {children}
    </div>
  );
}
