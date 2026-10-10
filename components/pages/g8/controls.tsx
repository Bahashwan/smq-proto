"use client";
// G8 · small form pieces shared by the content editors: the framed controls (ink frame, gold when it is the field
// being edited or carries [للتأكيد]), the label shell, and the pointer + keyboard reordering of rows.
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cx } from "@/lib/format";

export type CtlTone = "admin" | "tbc" | "active" | "computed" | "error";

const FRAME: Record<CtlTone, string> = {
  admin: "border-ink bg-paper",
  tbc: "border-gold bg-cream-focus",
  active: "border-gold bg-paper",
  computed: "border-line bg-sand text-muted",
  error: "border-gold bg-cream-focus border-2",
};

/** Control classes: 44px inputs, 1.5px frame, gold focus. */
export function ctl(tone: CtlTone = "admin", extra?: string) {
  return cx(
    "w-full min-w-0 border-[1.5px] px-3 text-[14px] font-semibold text-ink placeholder:font-normal placeholder:text-disabled focus:border-gold focus:bg-cream-focus focus-visible:outline-0 disabled:text-disabled",
    FRAME[tone],
    extra,
  );
}
export const INPUT_H = "h-11";

/** Label above a control, optional line under it (gold when `noteTone="gold"`). */
export function Field({ label, children, note, noteTone, className, as = "label", id }: { label: ReactNode; children: ReactNode; note?: ReactNode; noteTone?: "muted" | "gold"; className?: string; as?: "label" | "div"; id?: string }) {
  const Tag = as;
  return (
    <Tag id={id} className={cx("flex min-w-0 flex-col gap-1.5 text-[12px] font-bold text-muted", className)}>
      <span>{label}</span>
      {children}
      {note && <span className={cx("text-[12px] font-semibold", noteTone === "gold" ? "text-gold-text" : "text-muted")}>{note}</span>}
    </Tag>
  );
}

/** Pointer drag on a handle reorders the ids live; ArrowUp / ArrowDown on the focused handle moves one step. */
export function useDragSort(ids: string[], onChange: (next: string[]) => void) {
  const rows = useRef(new Map<string, HTMLElement>());
  const latest = useRef(ids);
  latest.current = ids;
  const [dragging, setDragging] = useState<string | null>(null);

  const rowRef = (id: string) => (el: HTMLElement | null) => {
    if (el) rows.current.set(id, el);
    else rows.current.delete(id);
  };

  const place = (id: string, y: number) => {
    const order = latest.current;
    const rest = order.filter((x) => x !== id);
    let at = rest.length;
    for (let i = 0; i < rest.length; i++) {
      const el = rows.current.get(rest[i]);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        at = i;
        break;
      }
    }
    const next = [...rest.slice(0, at), id, ...rest.slice(at)];
    if (next.join() !== order.join()) onChange(next);
  };

  const handleProps = (id: string, label = "اسحب لإعادة الترتيب") => ({
    "aria-label": label,
    dragging: dragging === id,
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(id);
    },
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => {
      if (dragging === id) place(id, e.clientY);
    },
    onPointerUp: () => setDragging(null),
    onPointerCancel: () => setDragging(null),
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const order = latest.current;
      const i = order.indexOf(id);
      const j = e.key === "ArrowUp" ? i - 1 : i + 1;
      if (j < 0 || j >= order.length) return;
      const next = [...order];
      next.splice(i, 1);
      next.splice(j, 0, id);
      onChange(next);
    },
  });

  return { rowRef, handleProps, dragging };
}
