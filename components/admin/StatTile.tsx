// Stat tile (Admin-Overview-D «المؤشرات», Admin-M, Admin-Alliance-M). White with the ink frame; the one that
// needs the manager's action is ink with a cut corner and a gold number; the alliance «تنتظر» tile has a gold frame.
import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  /** Small muted suffix after the value, e.g. «/ 10». */
  suffix?: ReactNode;
  /** Change line, e.g. «+18% عن الأسبوع السابق». */
  delta?: ReactNode;
  note?: ReactNode;
  variant?: "paper" | "ink" | "gold";
  /** sm = 18px value (3-up phone tiles), md = 24px (phone), lg = 32px (desktop); responsive = md on phone, lg from md. */
  size?: "sm" | "md" | "lg" | "responsive";
  className?: string;
  id?: string;
}

const VALUE = {
  sm: "text-[18px]",
  md: "text-2xl",
  lg: "text-[32px]",
  responsive: "text-2xl md:text-[32px]",
};
const LABEL = {
  sm: "text-caption",
  md: "text-caption",
  lg: "text-[12px]",
  responsive: "text-caption md:text-[12px]",
};
const PAD = {
  sm: "gap-0.5 px-3 py-2.5",
  md: "gap-0.5 px-3.5 py-3",
  lg: "gap-1.5 px-5 py-[18px]",
  responsive: "gap-0.5 px-3.5 py-3 md:gap-1.5 md:px-5 md:py-[18px]",
};

export function StatTile({ label, value, suffix, delta, note, variant = "paper", size = "responsive", className, id }: StatTileProps) {
  const ink = variant === "ink";
  return (
    <div
      id={id}
      className={cx(
        "flex min-w-0 flex-col",
        PAD[size],
        ink ? "cut-m bg-ink text-paper" : variant === "gold" ? "border-[1.5px] border-gold bg-paper" : "border-interactive bg-paper",
        className,
      )}
    >
      <span className={cx(LABEL[size], "font-bold", ink ? "text-on-ink-muted" : "text-muted")}>{label}</span>
      <span className={cx(VALUE[size], "font-extrabold leading-none tnum", ink ? "text-gold" : variant === "gold" ? "text-gold-text" : "text-ink")}>
        {value}
        {suffix && <span className={cx("font-semibold", size === "sm" ? "text-caption" : "text-[12px] md:text-[14px]", ink ? "text-on-ink-muted" : "text-muted")}> {suffix}</span>}
      </span>
      {(delta || note) && (
        <span className={cx("leading-snug", size === "sm" ? "text-caption" : "text-[12px]", ink ? "text-on-ink-muted" : "text-muted")}>
          {delta}
          {delta && note ? " · " : null}
          {note}
        </span>
      )}
    </div>
  );
}

/** Grid for the tiles: two columns on a phone-wide container, auto-fit 190px columns from 600px (container query). */
export function StatGrid({ children, className, label = "المؤشرات", columns }: { children: ReactNode; className?: string; label?: string; columns?: 2 | 3 | 4 }) {
  return (
    <section aria-label={label} className={cx("@container", className)}>
      <div className={cx("grid gap-2 @min-[600px]:gap-3", columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : "grid-cols-2 @min-[600px]:[grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr))]")}>{children}</div>
    </section>
  );
}
