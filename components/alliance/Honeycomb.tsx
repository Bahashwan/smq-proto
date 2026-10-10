import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import styles from "./alliance.module.css";

/** ink2 = a member cell on the ink hero · gold = joined this month · outline = an empty cell (launch day) */
export type HoneyTone = "ink2" | "gold" | "outline" | "paper";

export interface HoneycombProps {
  /** flat list, row by row */
  cells: HoneyTone[];
  /** row lengths, e.g. [4, 5, 4] (desktop hero) or [3, 3, 3, 3] (phone hero); default: rows of `columns` */
  rows?: number[];
  columns?: number;
  size?: number;
  gap?: number;
  rowGap?: number;
  /** fill cell by cell on mount (1400ms stagger from --smq-motion-skeleton); reduced motion renders the end state */
  animate?: boolean;
  /** center = rows of different lengths nest into a honeycomb · start = alternate rows move half a cell */
  align?: "center" | "start";
  caption?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

const FILL: Record<HoneyTone, string> = {
  ink2: "var(--smq-ink-2)",
  gold: "var(--smq-gold)",
  outline: "transparent",
  paper: "var(--smq-paper)",
};

export function Honeycomb({ cells, rows, columns = 4, size = 84, gap = 4, rowGap = 4, animate = false, align = "center", caption, className, ariaLabel }: HoneycombProps) {
  const lengths = rows ?? Array.from({ length: Math.ceil(cells.length / columns) }, () => columns);
  const n = cells.length;
  let i = 0;
  const grid: HoneyTone[][] = lengths.map((len) => cells.slice(i, (i += len)));
  const offset = size / 2 + gap / 2;
  return (
    <div className={cx("flex flex-col", align === "center" ? "items-center" : "items-start", className)} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true}>
      <div className="flex flex-col" style={{ gap: rowGap }}>
        {grid.map((row, r) => (
          <div key={r} className="flex" style={{ gap, marginInlineStart: align === "start" && r % 2 === 1 ? offset : 0 }}>
            {row.map((tone, c) => {
              const idx = lengths.slice(0, r).reduce((a, b) => a + b, 0) + c;
              const style = animate ? ({ width: size, height: size, "--i": idx, "--n": n } as React.CSSProperties) : { width: size, height: size };
              return (
                <span key={c} className={cx("relative block shrink-0", animate && styles.fill)} style={style}>
                  {tone === "outline" ? (
                    <>
                      <span className="absolute inset-0 hex-flat" style={{ background: "var(--smq-muted)" }} />
                      <span className="absolute hex-flat" style={{ inset: 1.5, background: "var(--smq-ink)" }} />
                    </>
                  ) : (
                    <span className="absolute inset-0 hex-flat" style={{ background: FILL[tone] }} />
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {caption && <span className="mt-1.5 text-caption text-muted">{caption}</span>}
    </div>
  );
}
