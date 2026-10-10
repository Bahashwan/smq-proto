"use client";
// Bottom sheet (Results-Filters-M, map pin cards, phone drawers): ink scrim, paper panel with the cut on its top
// line-end corner, 200ms motion, focus trap, Esc and scrim close, body scroll locked. Centred dialog on desktop
// when `desktop="dialog"`.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/format";
import { useFocusTrap, usePresence, useScrollLock } from "./hooks";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** nodes at the line end of the header, before the close button («مسح الكل») */
  actions?: ReactNode;
  children: ReactNode;
  /** sheet on every width (default) or a centred dialog from md up */
  desktop?: "sheet" | "dialog";
  /** panel height on the phone: content height (default) or the full viewport */
  size?: "auto" | "full";
  closeLabel?: string;
  /** when false the sheet is rendered in place instead of a body portal */
  portal?: boolean;
  labelledBy?: string;
  className?: string;
  /** footer slot pinned under the scrolling content */
  footer?: ReactNode;
}

export function BottomSheet({ open, onClose, title, actions, children, desktop = "sheet", size = "auto", closeLabel = "إغلاق", portal = true, labelledBy, className, footer }: BottomSheetProps) {
  const [mounted, shown] = usePresence(open, 200);
  const panel = useRef<HTMLDivElement>(null);
  const [canPortal, setCanPortal] = useState(false);
  useEffect(() => setCanPortal(true), []);
  useFocusTrap(panel, open, onClose);
  useScrollLock(open);
  if (!mounted) return null;
  const titleId = labelledBy ?? "sheet-title";
  const node = (
    <div className={cx("fixed inset-0 z-50 flex", desktop === "dialog" ? "items-end md:items-center md:justify-center" : "items-end")} role="presentation">
      <div aria-hidden onClick={onClose} className={cx("absolute inset-0 bg-ink/55 motion-sheet transition-opacity", shown ? "opacity-100" : "opacity-0")} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cx(
          "relative flex flex-col w-full bg-paper text-ink outline-none motion-sheet transition-transform cut-l",
          size === "full" ? "h-dvh" : "max-h-[92dvh]",
          desktop === "dialog" && "md:w-[560px] md:max-h-[85dvh] md:h-auto",
          shown ? "translate-y-0" : "translate-y-full",
          className,
        )}
      >
        {(title || actions) && (
          <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
            {title && (
              <h2 id={titleId} className="m-0 text-h3">
                {title}
              </h2>
            )}
            <div className="flex items-center gap-2 ms-auto">
              {actions}
              <button type="button" onClick={onClose} aria-label={closeLabel} className="inline-flex items-center justify-center size-11 -me-2 text-h2 leading-none text-ink hover:bg-sand motion-hover transition-colors">
                ×
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">{children}</div>
        {footer && <div className="border-t border-line px-4 py-3 bg-paper">{footer}</div>}
      </div>
    </div>
  );
  return portal && canPortal ? createPortal(node, document.body) : node;
}
