import { cx } from "@/lib/format";

export type PinKind = "available" | "owner" | "soon";

/** The hexagon pin of the Results-Map boards (hex-flat via clip-path, no shadow):
 *  gold with the count in ink for available units; white with a 2px ink ring (a nested hexagon, since the
 *  board's inset box-shadow is not a token) for «من مالك» (count) and «قريباً» (word, muted).
 *  `selected` adds the board's ink outline as a 3px ring 2px outside the hexagon. Purely visual: aria-hidden. */
export function HexPin({
  kind,
  count,
  size = 52,
  textSize = 15,
  selected = false,
  className,
}: {
  kind: PinKind;
  count?: number;
  /** hexagon box in px (board: 52 desktop · 44 phone · +8 when selected) */
  size?: number;
  /** count font size in px (board: 15 desktop · 13 phone · +2 when selected) */
  textSize?: number;
  selected?: boolean;
  className?: string;
}) {
  const ring = kind !== "available";
  return (
    <span aria-hidden="true" className={cx("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      {selected && <span className="hex-flat absolute bg-ink" style={{ inset: -5 }} />}
      {selected && <span className="hex-flat absolute bg-paper" style={{ inset: -2 }} />}
      <span className={cx("hex-flat absolute inset-0", ring ? "bg-ink" : "bg-gold")} />
      {ring && <span className="hex-flat absolute bg-paper" style={{ inset: 2 }} />}
      <span
        className={cx("tnum relative font-extrabold leading-none", kind === "soon" ? "text-muted" : "text-ink")}
        style={{ fontSize: kind === "soon" ? Math.max(11, textSize - 4) : textSize }}
      >
        {kind === "soon" ? "قريباً" : count}
      </span>
    </span>
  );
}

/** The small gold marker used by the drawings and the pickers (hex-flat 26 × 30 on the boards). */
export function PinMarker({ width = 26, height = 30, shape = "flat", className }: { width?: number; height?: number; shape?: "flat" | "point"; className?: string }) {
  return <span aria-hidden="true" className={cx(shape === "point" ? "hex-point" : "hex-flat", "block shrink-0 bg-gold", className)} style={{ width, height }} />;
}
