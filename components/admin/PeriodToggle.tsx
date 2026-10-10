"use client";
// Period toggle (Admin-Overview-D header): a segmented group, ink frame, the pressed option filled ink.
import { cx } from "@/lib/format";

export interface PeriodOption<V extends string = string> {
  value: V;
  label: string;
}

export interface PeriodToggleProps<V extends string = string> {
  options: PeriodOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Accessible group name, default «الفترة». */
  label?: string;
  size?: "md" | "sm";
  /** the pressed option: ink (default) or gold with ink text (Admin-Leads-D status filter) */
  tone?: "ink" | "gold";
  className?: string;
}

export function PeriodToggle<V extends string = string>({ options, value, onChange, label = "الفترة", size = "md", tone = "ink", className }: PeriodToggleProps<V>) {
  return (
    <div role="group" aria-label={label} className={cx("inline-flex border-interactive bg-paper", className)}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cx(
              "cursor-pointer whitespace-nowrap motion-hover transition-colors tnum",
              size === "md" ? "h-10 px-3.5 text-[12px] font-bold" : "h-7 px-2.5 text-caption font-extrabold",
              i < options.length - 1 && "border-e-[1.5px] border-ink",
              on ? (tone === "gold" ? "bg-gold text-ink" : "bg-ink text-paper") : "bg-paper text-ink hover:bg-sand",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
