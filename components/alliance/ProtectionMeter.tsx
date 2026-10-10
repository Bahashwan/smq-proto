import { cx, fmtNum } from "@/lib/format";

/** «الحماية المتبقية»: a 60×8 slot bar with an ink fill and «70 من 90». Closed records print a word instead («انتهت بالإفراغ»). */
export function ProtectionMeter({ daysLeft, total = 90, label, className }: { daysLeft: number; total?: number; /** replaces the bar, e.g. «انتهت بالإفراغ» · «أُغلقت» */ label?: string; className?: string }) {
  if (label) return <span className={cx("text-[12px] text-muted", className)}>{label}</span>;
  const ratio = total > 0 ? Math.min(1, Math.max(0, daysLeft / total)) : 0;
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-bold tnum", className)} role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={daysLeft} aria-label={`الحماية المتبقية ${fmtNum(daysLeft)} من ${fmtNum(total)} يوماً`}>
      <b className="relative inline-block h-2 w-[60px] bg-slot">
        <span className="absolute top-0 start-0 h-full bg-ink" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </b>
      {fmtNum(daysLeft)} من {fmtNum(total)}
    </span>
  );
}
