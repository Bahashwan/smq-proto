"use client";
// Dialog (Components2 · 10, Admin-Pieces-D · 3). A 6px gold top edge tells it apart from the drawer. The primary
// button is ink, never gold: gold is not used for a destructive action. The destructive variant asks the user to
// type the code («اكتب RZ-C للتأكيد») before «احذف RZ-C» enables; deleting a question or a user needs no typing.
import { useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/format";
import { useHasHydrated } from "@/lib/location";
import { AdminButton } from "./buttons";
import { trapTab, useModalBehaviour } from "./Drawer";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  /** Type-to-confirm code (unit code, project number). Omit for a destructive dialog that needs no typing. */
  confirmCode?: string;
  /** «البديل الآمن:» followed by this node (usually a link). */
  safeAlternative?: ReactNode;
  confirmDisabled?: boolean;
  /** Render inside a `relative` parent instead of the viewport (styleguide). */
  inline?: boolean;
  width?: number;
  className?: string;
}

export function Dialog({ open, onClose, title, children, confirmLabel, cancelLabel = "إلغاء", onConfirm, destructive, confirmCode, safeAlternative, confirmDisabled, inline, width = 420, className }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [typed, setTyped] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setTyped("");
  }
  const canPortal = useHasHydrated();
  useModalBehaviour(open && !inline, onClose, panel, !inline);

  if (!open) return null;
  const needsCode = !!confirmCode;
  const codeOk = !needsCode || typed.trim().toUpperCase() === confirmCode!.toUpperCase();
  const disabled = confirmDisabled || !codeOk;

  const node = (
    <div className={cx(inline ? "relative min-h-full px-6 py-10" : "fixed inset-0 z-50 p-4", "flex items-center justify-center", className)}>
      <div aria-hidden onClick={onClose} className={cx("absolute inset-0", !inline && "bg-ink-2/50")} />
      <div
        ref={panel}
        role="dialog"
        aria-modal={!inline || undefined}
        aria-labelledby={titleId}
        onKeyDown={(e) => trapTab(e, panel.current)}
        style={{ maxWidth: width }}
        className="relative flex w-full flex-col gap-3.5 border-interactive border-t-[6px] border-t-gold bg-paper px-[22px] pb-[18px] pt-5"
      >
        <span id={titleId} className={cx("font-extrabold leading-tight", destructive ? "text-h3" : "text-[15px]")}>
          {title}
        </span>
        {children && <div className="text-label leading-[1.7] text-ink-2 [&_p]:m-0">{children}</div>}
        {needsCode && (
          <label className="flex flex-col gap-1.5 text-[12px] font-bold text-muted">
            <span>
              اكتب{" "}
              <code dir="ltr" className="font-mono text-ink">
                {confirmCode}
              </code>{" "}
              للتأكيد
            </span>
            <input
              data-autofocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              aria-label={`اكتب ${confirmCode} للتأكيد`}
              className="h-11 w-full border-2 border-gold bg-cream-focus px-3 text-right font-mono text-[15px] font-bold text-ink focus-visible:outline-0"
            />
          </label>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <AdminButton variant="ink" size="sm" onClick={onConfirm} disabled={disabled} data-autofocus={needsCode ? undefined : true} className="disabled:bg-ink disabled:text-paper disabled:opacity-40">
            {confirmLabel}
          </AdminButton>
          <AdminButton variant="outline" size="sm" onClick={onClose}>
            {cancelLabel}
          </AdminButton>
          {safeAlternative && (
            <span className="ms-auto self-center text-caption font-semibold text-muted">
              البديل الآمن: <span className="font-bold text-gold-text">{safeAlternative}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
  if (inline || !canPortal) return node;
  return createPortal(node, document.body);
}
