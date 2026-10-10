import type { ReactNode } from "react";
import type { District, Sector } from "@/data/types";
import { cx } from "@/lib/format";
import type { HexCellProps } from "./HexCell";
import { HexGrid } from "./HexGrid";
import { officesCount, SECTOR_LABELS, SECTOR_ORDER } from "./lib";

/**
 * «تغطية جدة بجهاتها الخمس» (Alliance-D/M): one hexagon per district grouped by sector, alternate sector rows
 * moved half a cell. Ink = covered by members with the count in gold; outlined = no member yet («0»).
 * Launch day: every cell is empty and the required districts carry «مطلوب» in a gold border.
 */
export interface CoverageGridProps {
  districts: District[];
  /** district slug → member count */
  counts: Record<string, number>;
  /** launch day: districts to mark «مطلوب» */
  required?: string[];
  /** members per sector for the headings («شمال جدة · 5 مكاتب»); omitted = counted from `counts`? no: the page passes it */
  sectorMembers?: Partial<Record<Sector, number>>;
  /** launch day: no counts, «مطلوب» cells */
  launch?: boolean;
  columns?: number;
  columnsSm?: number;
  size?: number;
  sizeSm?: number;
  /** the heading row of each sector */
  headings?: boolean;
  caption?: ReactNode;
  className?: string;
}

export function CoverageGrid({ districts, counts, required = [], sectorMembers, launch, columns = 6, columnsSm = 5, size = 84, sizeSm = 60, headings = true, caption, className }: CoverageGridProps) {
  const groups = SECTOR_ORDER.map((sector) => ({ sector, items: districts.filter((d) => d.sector === sector) })).filter((g) => g.items.length);
  return (
    <div className={cx("flex flex-col gap-2.5", className)}>
      {groups.map((g, gi) => {
        const cells: (HexCellProps & { key: string })[] = g.items.map((d) => {
          const n = counts[d.slug] ?? 0;
          if (launch) {
            const want = required.includes(d.slug);
            return { key: d.slug, label: d.ar, value: want ? "مطلوب" : undefined, state: want ? "required" : "muted", ariaLabel: want ? `${d.ar} · مطلوب` : d.ar };
          }
          return n > 0
            ? { key: d.slug, label: d.ar, value: String(n), valueSize: "big", state: "active", ariaLabel: `${d.ar} · ${officesCount(n)}` }
            : { key: d.slug, label: d.ar, value: "0", state: "normal", ariaLabel: `${d.ar} · 0 مكاتب` };
        });
        const members = sectorMembers?.[g.sector];
        return (
          <div key={g.sector} className="flex flex-col gap-1">
            {headings && (
              <span className="text-caption font-extrabold text-gold-text">
                {SECTOR_LABELS[g.sector]}
                {!launch && members != null ? ` · ${officesCount(members)}` : ""}
              </span>
            )}
            <HexGrid cells={cells} columns={columns} columnsSm={columnsSm} size={size} sizeSm={sizeSm} shift={gi % 2 === 1 ? "even" : "odd"} />
          </div>
        );
      })}
      {caption && <span className="text-caption text-muted">{caption}</span>}
    </div>
  );
}
