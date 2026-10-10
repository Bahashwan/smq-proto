// Toast views (Components2 · 11, Admin-Pieces-D · 5). Presentational only: the live stack is the store's
// `useStore().toast(text)` rendered by components/presenter/Toasts.tsx (bottom-left, one at a time, 6 s, no motion
// beyond appear / disappear). Three kinds only: success (gold bar), info with undo (white bar), error (gold frame on
// cream); plus the persistent loading line. No green and no red anywhere.
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { IconCheck } from "./icons";

export type ToastKind = "success" | "info" | "error" | "loading";

export interface ToastViewProps {
  kind: ToastKind;
  children: ReactNode;
  /** Link or button after the text (gold on ink; gold-text on cream). */
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function ToastView({ kind, children, action, onClose, className }: ToastViewProps) {
  const onInk = kind !== "error";
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      aria-busy={kind === "loading" || undefined}
      className={cx(
        "flex max-w-[420px] items-center gap-3 px-3.5 py-3 text-label font-bold",
        kind === "success" && "border-s-[5px] border-gold bg-ink text-paper",
        kind === "info" && "border-s-[5px] border-paper bg-ink text-paper",
        kind === "loading" && "border-s-[5px] border-gold bg-ink text-paper",
        kind === "error" && "border-2 border-gold bg-cream-focus text-ink",
        className,
      )}
    >
      {kind === "success" && (
        <span aria-hidden className="hex-flat flex size-[18px] shrink-0 items-center justify-center bg-gold text-ink">
          <IconCheck />
        </span>
      )}
      {kind === "error" && <span aria-hidden className="hex-point size-2.5 shrink-0 bg-gold" />}
      {kind === "loading" && <span aria-hidden className="hex-flat size-2.5 shrink-0 bg-gold" />}
      <span className="min-w-0 flex-1">{children}</span>
      {action && <span className={cx("shrink-0 font-extrabold", onInk ? "text-gold" : "text-gold-text")}>{action}</span>}
      {onClose && kind !== "loading" && (
        <button type="button" aria-label="إغلاق" onClick={onClose} className={cx("shrink-0 cursor-pointer bg-transparent text-[16px] leading-none", onInk ? "text-paper" : "text-ink")}>
          ×
        </button>
      )}
    </div>
  );
}
