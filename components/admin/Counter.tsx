// Nav counter (Admin-Overview-D sidebar): gold = needs action (approvals, alliance), outline = informational.
import { cx } from "@/lib/format";
import { fmtNum } from "@/lib/format";

export type CounterTone = "gold" | "outline";

export interface CounterProps {
  value: number;
  tone?: CounterTone;
  className?: string;
  "aria-label"?: string;
}

export function Counter({ value, tone = "outline", className, ...aria }: CounterProps) {
  return (
    <span
      className={cx(
        "inline-flex h-[22px] min-w-[22px] items-center justify-center px-1.5 text-caption font-extrabold leading-none tnum",
        tone === "gold" ? "bg-gold text-ink" : "border-[1.5px] border-ink text-ink",
        className,
      )}
      {...aria}
    >
      {fmtNum(value)}
    </span>
  );
}

/** The small badge on the bell: gold square, ink digits, 10px. */
export function Badge({ value, className }: { value: number; className?: string }) {
  if (value <= 0) return null;
  return <span className={cx("flex h-4 min-w-4 items-center justify-center bg-gold px-1 text-[10px] font-extrabold leading-none text-ink tnum", className)}>{fmtNum(value)}</span>;
}
