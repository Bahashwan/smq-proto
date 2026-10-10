import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/format";

/**
 * District / office cell. State is carried by the border and the words, never by colour alone:
 * muted = no demand (line 1.5px) · normal = known district, no members (ink 1.5px) · demand = demand, no members
 * (ink 1.5px on sand) · gap / rank-n = demand with no SMQ supply (gold 2.5px) · required = «مطلوب» on launch day
 * (gold 1.5px) · active = covered by members (solid ink). Hexagons are clip-path layers (no border can follow a
 * clip-path and shadows are not allowed), so a bordered cell is a border-coloured hexagon under a smaller fill.
 */
export type HexState = "muted" | "normal" | "demand" | "gap" | "required" | "active" | "rank-1" | "rank-2" | "rank-3";

export interface HexCellProps {
  label: ReactNode;
  /** second line: a number, «44 · لا أعضاء», «مطلوب» … */
  value?: ReactNode;
  /** big = the coverage count (15px, gold on ink) · small = the radar numbers */
  valueSize?: "small" | "big";
  state?: HexState;
  /** gold ring (3px, 2px gap); the gap takes --hex-surface (paper by default) */
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  /** px, 84 on desktop sheets, 60 on phone, 40 in the phone hero */
  size?: number;
  title?: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

interface Look {
  border?: string;
  width: number;
  fill: string;
  color: string;
  small: string;
}
const GAP: Look = { border: "var(--smq-gold)", width: 2.5, fill: "var(--smq-paper)", color: "var(--smq-ink)", small: "var(--smq-gold-text)" };
const LOOKS: Record<HexState, Look> = {
  muted: { border: "var(--smq-line)", width: 1.5, fill: "var(--smq-paper)", color: "var(--smq-muted)", small: "var(--smq-muted)" },
  normal: { border: "var(--smq-ink)", width: 1.5, fill: "var(--smq-paper)", color: "var(--smq-ink)", small: "var(--smq-muted)" },
  demand: { border: "var(--smq-ink)", width: 1.5, fill: "var(--smq-sand)", color: "var(--smq-ink)", small: "var(--smq-ink)" },
  gap: GAP,
  "rank-1": GAP,
  "rank-2": GAP,
  "rank-3": GAP,
  required: { border: "var(--smq-gold)", width: 1.5, fill: "var(--smq-paper)", color: "var(--smq-ink)", small: "var(--smq-gold-text)" },
  active: { width: 0, fill: "var(--smq-ink)", color: "var(--smq-paper)", small: "var(--smq-gold)" },
};

export function hexLook(state: HexState): Look {
  return LOOKS[state];
}

export function HexCell({ label, value, valueSize = "small", state = "normal", selected, onClick, href, size = 84, title, ariaLabel, className, style }: HexCellProps) {
  const look = LOOKS[state];
  const big = size >= 72;
  const fontSize = big ? 11 : 10;
  const smallSize = valueSize === "big" ? (big ? 15 : 12) : big ? 10 : 9;
  const inner = (
    <>
      {selected && <span aria-hidden className="absolute hex-flat bg-gold" style={{ inset: -5 }} />}
      {selected && <span aria-hidden className="absolute hex-flat" style={{ inset: -2, background: "var(--hex-surface, var(--smq-paper))" }} />}
      {look.width > 0 && <span aria-hidden className="absolute inset-0 hex-flat" style={{ background: look.border }} />}
      <span
        className="absolute hex-flat flex flex-col items-center justify-center text-center font-extrabold"
        style={{ inset: look.width, background: look.fill, color: look.color, fontSize, lineHeight: 1.15, gap: 1 }}
      >
        <span className="block px-[13%] text-balance">{label}</span>
        {value != null && value !== "" && (
          <span className="block tnum px-[10%]" style={{ color: look.small, fontSize: smallSize, fontWeight: valueSize === "big" ? 800 : 700, lineHeight: 1.2 }}>
            {value}
          </span>
        )}
      </span>
    </>
  );
  const base = cx("relative inline-block shrink-0 p-0 border-0 bg-transparent text-inherit align-top", selected && "z-10", className);
  const box: CSSProperties = { width: size, height: size, ...style };
  if (onClick) {
    return (
      <button type="button" className={cx(base, "cursor-pointer")} style={box} onClick={onClick} aria-pressed={selected ?? false} title={title} aria-label={ariaLabel}>
        {inner}
      </button>
    );
  }
  if (href) {
    return (
      <a href={href} className={base} style={box} title={title} aria-label={ariaLabel} aria-current={selected ? "true" : undefined}>
        {inner}
      </a>
    );
  }
  return (
    <span className={base} style={box} title={title} aria-label={ariaLabel}>
      {inner}
    </span>
  );
}

/** A small hexagon marker (hex-flat): the gold dot of the badge, the stage cells, the legend swatches. */
export function HexDot({ size = 9, tone = "gold", border, className }: { size?: number; tone?: "gold" | "ink" | "paper" | "sand" | "line" | "ink2"; border?: "line" | "ink" | "gold"; className?: string }) {
  const fill = { gold: "var(--smq-gold)", ink: "var(--smq-ink)", paper: "var(--smq-paper)", sand: "var(--smq-sand)", line: "var(--smq-line)", ink2: "var(--smq-ink-2)" }[tone];
  if (!border) return <i aria-hidden className={cx("inline-block shrink-0 hex-flat", className)} style={{ width: size, height: size, background: fill }} />;
  const bc = { line: "var(--smq-line)", ink: "var(--smq-ink)", gold: "var(--smq-gold)" }[border];
  const bw = border === "line" ? 1.5 : 2;
  return (
    <i aria-hidden className={cx("relative inline-block shrink-0 hex-flat", className)} style={{ width: size, height: size, background: bc }}>
      <i className="absolute hex-flat" style={{ inset: bw, background: fill }} />
    </i>
  );
}

/** A pointed hexagon (hex-point): markers, the dispute flag's «diamond». */
export function PointDot({ size = 8, tone = "gold", className }: { size?: number; tone?: "gold" | "ink" | "paper"; className?: string }) {
  const fill = { gold: "var(--smq-gold)", ink: "var(--smq-ink)", paper: "var(--smq-paper)" }[tone];
  return <i aria-hidden className={cx("inline-block shrink-0 hex-point", className)} style={{ width: size, height: size, background: fill }} />;
}
