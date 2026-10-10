"use client";
import { useId, type CSSProperties } from "react";
import { cx } from "@/lib/format";
import { getGeometry, type MapVariant, type ViewWindow } from "./geometry";

/** The schematic drawing layer: the board's pixel grid (an SVG pattern in `--smq-line`) and the coastline/road
 *  strokes stretched to the box (preserveAspectRatio none, as the boards draw them). Decorative: aria-hidden. */
export function SchematicDrawing({
  variant = "desktop",
  window,
  grid,
  showRoads = true,
  roadsOpacity = 1,
  className,
  style,
}: {
  variant?: MapVariant;
  /** crop of the drawing in viewBox units; default the whole drawing */
  window?: ViewWindow;
  /** grid cell in CSS px; default the board's (48 desktop · 40 phone) */
  grid?: number;
  showRoads?: boolean;
  roadsOpacity?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const g = getGeometry(variant);
  const win = window ?? { x: 0, y: 0, w: g.viewBox.w, h: g.viewBox.h };
  const cell = grid ?? g.grid;
  const patternId = `smq-grid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div aria-hidden="true" className={cx("absolute inset-0", className)} style={style}>
      <svg className="absolute inset-0 block h-full w-full">
        <defs>
          <pattern id={patternId} width={cell} height={cell} patternUnits="userSpaceOnUse">
            <path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" stroke="var(--smq-line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url("#${patternId}")`} />
      </svg>
      {showRoads && (
        <svg
          viewBox={`${win.x} ${win.y} ${win.w} ${win.h}`}
          preserveAspectRatio="none"
          className="absolute inset-0 block h-full w-full"
          fill="none"
          stroke="var(--smq-on-ink-muted)"
          strokeWidth={g.strokeWidth}
          style={roadsOpacity === 1 ? undefined : { opacity: roadsOpacity }}
        >
          {g.paths.map((p, i) => (
            <path key={i} d={p.d} strokeWidth={p.strokeWidth} />
          ))}
        </svg>
      )}
    </div>
  );
}
