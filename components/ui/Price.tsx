import { RiyalSign } from "./RiyalSign";
import { fmtNum, cx } from "@/lib/format";

/** A price with the riyal sign before the number and a 0.25em gap. Sign colour via `signClassName`. */
export function Price({ value, className, signClassName, sign = true }: { value: number; className?: string; signClassName?: string; sign?: boolean }) {
  return (
    <span className={cx("inline-flex items-baseline gap-[0.25em] tnum whitespace-nowrap", className)} dir="ltr">
      {sign && <RiyalSign className={signClassName} />}
      <span>{fmtNum(value)}</span>
    </span>
  );
}
