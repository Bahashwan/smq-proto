"use client";
// G7 · the small token-only charts the admin boards draw: budget bars, horizontal share bars, the hours strip.
import type { AnalyticsPeriod } from "@/data/types";
import { cx } from "@/lib/format";
import { peakBand } from "./util";

export function BudgetBars({ p, compact }: { p: AnalyticsPeriod; compact?: boolean }) {
  const peak = peakBand(p);
  const max = Math.max(...p.budgetBands.map((b) => b.pct));
  const desc = p.budgetBands.map((b) => `${b.labelAr} ${b.pct}%`).join("، ");
  return (
    <div>
      <div role="img" aria-label={`توزيع الميزانيات المبحوثة: ${desc}`} className={cx("flex items-end gap-0.5 border-b border-line", compact ? "h-20" : "h-[140px]")}>
        {p.budgetBands.map((b, i) => (
          <div key={b.labelAr} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            {i === peak && !compact && <span className="text-caption font-extrabold tnum">{b.pct}%</span>}
            <span className={cx("w-full", i === peak ? "bg-gold" : "bg-ink")} style={{ height: `${(b.pct / max) * (compact ? 100 : 82)}%` }} />
          </div>
        ))}
      </div>
      <div className={cx("mt-2 flex text-caption text-muted", compact && "mt-1")}>
        {p.budgetBands.map((b, i) => (
          <span key={b.labelAr} className={cx("min-w-0 flex-1 text-center tnum", !compact && "md:whitespace-nowrap", i === peak && "font-extrabold text-ink")}>
            {compact ? shortBandLabel(i, p.budgetBands.length, b.max) : b.labelAr}
          </span>
        ))}
      </div>
    </div>
  );
}
/** Phone axis labels: «<400 · 500 · 600 · 700 · 850 · مليون · +» (the upper bound of each band, in thousands). */
export function shortBandLabel(i: number, n: number, max: number | null): string {
  if (i === 0) return `<${(max ?? 0) / 1000}`;
  if (i === n - 1) return "+";
  if (max === 1_000_000) return "مليون";
  return String((max ?? 0) / 1000);
}


/** Sand track with an ink fill (gold when `gold`); width = value ÷ max. */
export function HBar({ value, max = 100, gold, className }: { value: number; max?: number; gold?: boolean; className?: string }) {
  return (
    <span className={cx("block h-3 bg-sand", className)} aria-hidden>
      <span className={cx("block h-full", gold ? "bg-gold" : "bg-ink")} style={{ width: `${Math.max(1.5, (value / (max || 1)) * 100)}%` }} />
    </span>
  );
}
