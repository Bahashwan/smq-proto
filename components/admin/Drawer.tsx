"use client";
// Side drawer (Components2 · 9). Opens from the inline-end side (the left in RTL) so the row it came from stays
// visible; 420–520 wide on desktop, a full-width bottom sheet on the phone. 200ms, Esc, overlay click, focus trap.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/format";
import { useHasHydrated } from "@/lib/location";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "end" | "start";
  /** Desktop width in px (420 to 520). */
  width?: number;
  /** Render inside a `relative overflow-hidden` parent instead of the viewport (styleguide, previews). */
  inline?: boolean;
  "aria-label"?: string;
  className?: string;
  bodyClassName?: string;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useModalBehaviour(open: boolean, onClose: () => void, panel: React.RefObject<HTMLElement | null>, autoFocus: boolean) {
  const restore = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    if (autoFocus) {
      const first = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      window.setTimeout(() => first?.focus(), 30);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      restore.current?.focus?.();
    };
  }, [open, onClose, panel, autoFocus]);
}

/** Tab / Shift+Tab stay inside the panel. */
export function trapTab(e: KeyboardEvent<HTMLElement>, panel: HTMLElement | null) {
  if (e.key !== "Tab" || !panel) return;
  const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export function Drawer({ open, onClose, title, children, footer, side = "end", width = 480, inline, className, bodyClassName = "p-3.5", ...aria }: DrawerProps) {
  // mounted stays true for 200ms after `open` turns false so the panel can slide out; visible drives the transform.
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setMounted(true);
    else setVisible(false);
  }
  const panel = useRef<HTMLElement>(null);
  const titleId = useId();
  const canPortal = useHasHydrated();

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    const t = window.setTimeout(() => setMounted(false), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || inline) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, inline]);

  useModalBehaviour(open && !inline, onClose, panel, !inline);

  if (!mounted) return null;

  const node = (
    <div className={cx(inline ? "absolute" : "fixed", "inset-0 z-40", className)}>
      <div aria-hidden onClick={onClose} className={cx("absolute inset-0 bg-ink-2/50 motion-sheet transition-opacity", visible ? "opacity-100" : "opacity-0")} />
      <aside
        ref={panel}
        role="dialog"
        aria-modal={!inline || undefined}
        aria-labelledby={typeof title === "string" ? titleId : undefined}
        aria-label={typeof title === "string" ? undefined : aria["aria-label"]}
        onKeyDown={(e) => trapTab(e, panel.current)}
        style={{ "--drawer-w": `${width}px` } as React.CSSProperties}
        className={cx(
          "absolute flex flex-col bg-paper motion-sheet transition-transform",
          "inset-x-0 bottom-0 max-h-[88dvh] border-t-[1.5px] border-ink",
          "md:inset-y-0 md:max-h-none md:w-[var(--drawer-w)] md:max-w-[calc(100%-32px)] md:border-t-0",
          side === "end" ? "md:start-auto md:end-0 md:border-s-[1.5px] md:border-ink" : "md:end-auto md:start-0 md:border-e-[1.5px] md:border-ink",
          visible ? "translate-x-0 translate-y-0" : cx("translate-y-full md:translate-y-0", side === "end" ? "md:-translate-x-full" : "md:translate-x-full"),
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink px-3.5 py-3 text-label font-extrabold">
          <span id={titleId} className="min-w-0 truncate">
            {title}
          </span>
          <button type="button" aria-label="إغلاق" onClick={onClose} data-autofocus className="flex size-8 shrink-0 cursor-pointer items-center justify-center border-interactive bg-paper text-[15px] font-extrabold hover:bg-sand">
            ×
          </button>
        </header>
        <div className={cx("min-h-0 flex-1 overflow-y-auto", bodyClassName)}>{children}</div>
        {footer && <footer className="flex gap-2 border-t-[1.5px] border-ink px-3.5 py-3">{footer}</footer>}
      </aside>
    </div>
  );

  if (inline || !canPortal) return node;
  return createPortal(node, document.body);
}
