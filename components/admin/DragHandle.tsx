// Drag handle and drop target (Components2 · 4). States: default (muted), hover (ink on sand), dragging (ink on gold).
import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/format";
import { IconGrip } from "./icons";

export interface DragHandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  dragging?: boolean;
}

export function DragHandle({ dragging, className, ...rest }: DragHandleProps) {
  return (
    <button
      type="button"
      aria-label="مقبض السحب"
      aria-pressed={dragging || undefined}
      className={cx(
        "flex size-9 shrink-0 cursor-grab items-center justify-center motion-hover transition-colors active:cursor-grabbing",
        dragging ? "bg-gold text-ink" : "text-muted hover:bg-sand hover:text-ink",
        className,
      )}
      {...rest}
    >
      <IconGrip />
    </button>
  );
}

/** Dashed slot with the gold line on top: where the dragged row will land. */
export function DropTarget({ className, height = 36 }: { className?: string; height?: number }) {
  return (
    <span aria-hidden className={cx("relative block border-[1.5px] border-dashed border-ink bg-sand", className)} style={{ height }}>
      <span className="absolute inset-x-0 -top-0.5 h-[3px] bg-gold" />
    </span>
  );
}
