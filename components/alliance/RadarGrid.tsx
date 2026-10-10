import type { ReactNode } from "react";
import type { Sector } from "@/data/types";
import { cx, fmtNum } from "@/lib/format";
import { HexDot, type HexCellProps, type HexState } from "./HexCell";
import { HexGrid } from "./HexGrid";
import { membersLabel, SECTOR_LABELS, SECTOR_ORDER, unitsLabel } from "./lib";

/**
 * The radar hexagon grid (Admin-AllianceRadar-D): one cell per district grouped by sector, alternate sector rows
 * moved half a cell. The cell reads «district · sessions · SMQ units · members». State by border: no demand ·
 * demand (sand) · demand with no SMQ supply (gold, the opportunity, ranked 1–3) · covered (ink).
 */
export interface RadarDistrict {
  slug: string;
  ar: string;
  sector: Sector;
  /** search sessions in the period */
  sessions: number;
  /** SMQ units available there */
  units?: number;
  /** member offices covering it */
  members?: number;
  /** open member offers there («1 عرض») */
  offers?: number;
  /** opportunity rank (1 = top); ranks 1–3 draw the gold border */
  rank?: number;
  /** explicit state overrides the derivation */
  state?: HexState;
  /** explicit second line overrides the derivation */
  note?: string;
}

export interface RadarGridProps {
  districts: RadarDistrict[];
  selected?: string | null;
  onSelect?: (slug: string) => void;
  /** sessions from which a district counts as demand */
  demandMin?: number;
  columns?: number;
  /** phone column count (5) and cell size (60): the board is desktop-only, the grid still has to fit a phone */
  columnsSm?: number;
  size?: number;
  sizeSm?: number;
  /** the four-swatch legend in the header */
  legend?: boolean;
  title?: ReactNode;
  caption?: ReactNode;
  className?: string;
}

export function radarState(d: RadarDistrict, demandMin = 30): HexState {
  if (d.state) return d.state;
  const units = d.units ?? 0;
  const members = d.members ?? 0;
  if (units > 0) return "active";
  if (d.sessions < demandMin) return "muted";
  if (d.rank != null && d.rank >= 1 && d.rank <= 3) return `rank-${d.rank}` as HexState;
  if (members > 0) return "gap";
  return "demand";
}

export function radarNote(d: RadarDistrict, demandMin = 30): string {
  if (d.note) return d.note;
  if (d.sessions < demandMin) return fmtNum(d.sessions);
  const parts = [fmtNum(d.sessions), unitsLabel(d.units ?? 0)];
  if (d.offers) parts.push(d.offers === 1 ? "1 عرض" : `${d.offers} عروض`);
  else parts.push(membersLabel(d.members ?? 0));
  return parts.join(" · ");
}

export function RadarLegend({ className }: { className?: string }) {
  const items: { label: string; dot: ReactNode }[] = [
    { label: "بلا طلب", dot: <HexDot size={14} tone="paper" border="line" /> },
    { label: "طلب", dot: <HexDot size={14} tone="sand" border="ink" /> },
    { label: "طلب بلا عرض", dot: <HexDot size={14} tone="paper" border="gold" /> },
    { label: "يغطيه أعضاء", dot: <HexDot size={14} tone="ink" /> },
  ];
  return (
    <div className={cx("flex flex-wrap items-center gap-3.5", className)} aria-label="مفتاح الشبكة">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-caption font-bold">
          {it.dot}
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function RadarGrid({ districts, selected, onSelect, demandMin = 30, columns = 6, columnsSm = 5, size = 86, sizeSm = 60, legend, title, caption, className }: RadarGridProps) {
  const groups = SECTOR_ORDER.map((sector) => ({ sector, items: districts.filter((d) => d.sector === sector) })).filter((g) => g.items.length);
  return (
    <section className={cx("flex flex-col gap-3", className)} style={{ "--hex-surface": "var(--smq-paper)" } as React.CSSProperties}>
      {(title || legend) && (
        <header className="flex flex-wrap items-center justify-between gap-3">
          {title && <span className="text-[14px] font-extrabold">{title}</span>}
          {legend && <RadarLegend />}
        </header>
      )}
      <div className="flex flex-col gap-2.5">
        {groups.map((g, gi) => {
          const cells: (HexCellProps & { key: string })[] = g.items.map((d) => ({
            key: d.slug,
            label: d.ar,
            value: radarNote(d, demandMin),
            state: radarState(d, demandMin),
            selected: selected === d.slug,
            onClick: onSelect ? () => onSelect(d.slug) : undefined,
            ariaLabel: `${d.ar} · ${radarNote(d, demandMin)}`,
          }));
          return (
            <div key={g.sector} className="flex flex-col gap-1">
              <span className="text-caption font-extrabold text-gold-text">{SECTOR_LABELS[g.sector]}</span>
              <HexGrid cells={cells} columns={columns} columnsSm={columnsSm} size={size} sizeSm={sizeSm} shift={gi % 2 === 1 ? "even" : "odd"} />
            </div>
          );
        })}
      </div>
      {caption && <span className="text-caption text-muted">{caption}</span>}
    </section>
  );
}
