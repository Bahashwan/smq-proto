import { cx, fmtDate } from "@/lib/format";
import { HexDot } from "./HexCell";
import { daysLabel } from "./lib";

/**
 * «رخصة فال موثّقة». The small gold hexagon is the mark. The public page shows only the verified state;
 * the admin states (expiry, expiring, waiting, suspended) are for the alliance room. Never used for anything
 * but the فال licence.
 */
export interface FalBadgeProps {
  /** false → «بانتظار التحقق» (admin only) */
  verified?: boolean;
  /** licence expiry, ISO; printed as «· حتى 2027/06/30» when `showDate` */
  date?: string;
  showDate?: boolean;
  /** ≤ 30 → «تنتهي بعد 24 يوماً» (admin only) */
  expiringInDays?: number;
  /** «موقوف» (admin only) */
  suspended?: boolean;
  /** white background when the badge sits on ink */
  onInk?: boolean;
  className?: string;
}

export function FalBadge({ verified = true, date, showDate, expiringInDays, suspended, onInk, className }: FalBadgeProps) {
  const base = "inline-flex items-center gap-[5px] whitespace-nowrap px-2 py-[3px] text-caption font-extrabold leading-tight";
  if (suspended) {
    return (
      <span className={cx(base, "bg-sand text-muted", className)}>
        <HexDot size={9} /> موقوف
      </span>
    );
  }
  if (!verified) {
    return (
      <span className={cx(base, "bg-paper border-interactive text-ink", className)}>
        <HexDot size={9} /> بانتظار التحقق
      </span>
    );
  }
  if (expiringInDays != null && expiringInDays <= 30) {
    return (
      <span className={cx(base, "bg-cream-focus text-gold-text", className)} style={{ border: "1.5px solid var(--smq-gold)" }}>
        <HexDot size={9} /> تنتهي بعد {daysLabel(expiringInDays)}
      </span>
    );
  }
  return (
    <span className={cx(base, onInk ? "bg-paper" : "bg-sand", "text-ink", className)}>
      <HexDot size={9} /> رخصة فال موثّقة{showDate && date ? <span className="tnum"> · حتى {fmtDate(date)}</span> : null}
    </span>
  );
}
