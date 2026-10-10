import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { HexDot } from "./HexCell";

/** Member-Report tiles: label · big value · note. The ink tone carries the gold value and a small cut. */
export function ReportTile({ label, value, note, tone = "paper", className }: { label: string; value: ReactNode; note?: ReactNode; tone?: "paper" | "ink"; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-0.5 px-2.5 py-3", tone === "ink" ? "bg-ink text-paper cut-s" : "bg-paper border-interactive", className)}>
      <span className={cx("text-caption", tone === "ink" ? "text-on-ink-muted" : "text-muted")}>{label}</span>
      <span className={cx("text-[22px] font-extrabold leading-tight tnum", tone === "ink" && "text-gold")}>{value}</span>
      {note != null && <span className={cx("text-caption", tone === "ink" ? "text-on-ink-muted" : "text-muted")}>{note}</span>}
    </div>
  );
}

/** One row of the report's share bars: label · bar · percentage. Gold = «لا عرض يكفي»; muted = «أخرى». */
export function ReportBarRow({ label, pct, tone = "ink", max = 100, className }: { label: string; pct: number; tone?: "ink" | "gold" | "muted"; /** the bar scale: the largest share in the block */ max?: number; className?: string }) {
  const fill = tone === "gold" ? "bg-gold" : tone === "muted" ? "bg-on-ink-muted" : "bg-ink";
  const w = max > 0 ? Math.min(100, Math.round((pct / max) * 100)) : 0;
  return (
    <div className={cx("grid items-center gap-2 py-[5px] text-[12px]", className)} style={{ gridTemplateColumns: "92px 1fr 44px" }}>
      <span>{label}</span>
      <div className="relative h-4 bg-slot">
        <span className={cx("absolute top-0 start-0 h-full", fill)} style={{ width: `${w}%` }} />
      </div>
      <strong className="text-end tnum">{pct}%</strong>
    </div>
  );
}

/** «حيث وجد الطلب لا عرض» rows: a numbered gold-outlined hexagon, a bold line and a muted note. */
export function ReportGapRow({ n, title, note, className }: { n: number; title: ReactNode; note?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-center gap-2.5 bg-paper px-3 py-2.5 border-interactive", className)}>
      <span className="relative inline-block h-[34px] w-[34px] shrink-0 hex-flat bg-gold">
        <span className="absolute inset-0.5 hex-flat bg-paper" />
        <span className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold tnum">{n}</span>
      </span>
      <span className="flex min-w-0 flex-col gap-px">
        <b className="text-[13px] font-extrabold">{title}</b>
        {note && <small className="text-caption text-muted">{note}</small>}
      </span>
    </div>
  );
}

/** The legend dot used beside report headings («الذهبي: لا عرض يكفي»). */
export function GoldDot({ className }: { className?: string }) {
  return <HexDot size={9} className={className} />;
}
