// Empty state (Admin-Pieces-D · 4): dashed ink frame on white, a hexagon (ring = nothing yet, gold = all done),
// a bold title, a muted line and the actions.
import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export interface EmptyStateProps {
  title: string;
  text?: ReactNode;
  /** Buttons / links. */
  action?: ReactNode;
  icon?: "ring" | "gold";
  className?: string;
}

export function EmptyState({ title, text, action, icon = "ring", className }: EmptyStateProps) {
  return (
    <div className={cx("flex flex-col items-center gap-2.5 border-[1.5px] border-dashed border-ink bg-paper px-6 py-8 text-center", className)}>
      {icon === "gold" ? (
        <span aria-hidden className="hex-flat size-9 bg-gold" />
      ) : (
        <span aria-hidden className="hex-flat flex size-9 items-center justify-center bg-ink">
          <span className="hex-flat block size-[30px] bg-paper" />
        </span>
      )}
      <span className="text-[16px] font-extrabold leading-tight">{title}</span>
      {text && <span className="max-w-[340px] text-label font-normal leading-[1.6] text-muted">{text}</span>}
      {action && <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}
