"use client";
// Budget stepper and slider · Components sheet §3 and the B-Hero finder. The stepper moves 50,000 up to a million
// then 100,000; the slider moves 10,000; the field accepts typing and formats on blur.
import { useEffect, useId, useState } from "react";
import { cx, fmtNum } from "@/lib/format";
import { RiyalSign } from "./RiyalSign";

export const BUDGET_MIN = 100_000;
export const BUDGET_MAX = 5_000_000;

/** 50,000 below a million, 100,000 from a million up (the sheet's rule) */
export function budgetStep(value: number, direction: 1 | -1): number {
  if (direction > 0) return value >= 1_000_000 ? 100_000 : 50_000;
  return value > 1_000_000 ? 100_000 : 50_000;
}

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** fixed step, or the budget rule when omitted */
  step?: number;
  /** accessible name of the field */
  label?: string;
  decLabel?: string;
  incLabel?: string;
  /** m = sheet (price-s) · l = hero (price) */
  size?: "m" | "l";
  /** riyal sign before the number (hero) */
  sign?: boolean;
  /** text colour of the figure on coloured blocks */
  onGold?: boolean;
  id?: string;
  className?: string;
}

export function Stepper({ value, onChange, min = BUDGET_MIN, max = BUDGET_MAX, step, label = "الميزانية", decLabel, incLabel, size = "m", sign, onGold, id, className }: StepperProps) {
  const auto = useId();
  const fid = id ?? `stepper-${auto}`;
  const [text, setText] = useState(fmtNum(value));
  useEffect(() => setText(fmtNum(value)), [value]);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const dec = () => onChange(clamp(value - (step ?? budgetStep(value, -1))));
  const inc = () => onChange(clamp(value + (step ?? budgetStep(value, 1))));
  const commit = () => {
    const n = parseInt(text.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(n)) onChange(clamp(n));
    else setText(fmtNum(value));
  };
  const stepWord = step ? fmtNum(step) : "50,000";
  const btn = cx("flex-none inline-flex items-center justify-center bg-ink text-paper cut-s font-bold leading-none hover:bg-ink-2 motion-hover transition-colors", size === "l" ? "size-12 text-h2" : "size-12 text-h2");
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <button type="button" aria-label={decLabel ?? `أنقص ${label} ${stepWord}`} onClick={dec} className={btn} disabled={value <= min}>
        −
      </button>
      <div className="flex flex-1 min-w-0 items-center justify-center gap-2">
        {sign && <RiyalSign className={cx("flex-none", size === "l" ? "text-h2" : "text-h3", onGold ? "text-ink" : "text-ink")} />}
        <label htmlFor={fid} className="sr-only">
          {label}
        </label>
        <input
          id={fid}
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "ArrowUp") {
              e.preventDefault();
              inc();
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              dec();
            }
          }}
          className={cx("w-full min-w-0 h-12 text-center bg-transparent border-0 border-b-[3px] border-ink tnum font-extrabold leading-none outline-none focus-visible:border-gold", size === "l" ? "text-price" : "text-price-s", onGold ? "text-ink" : "text-ink")}
        />
      </div>
      <button type="button" aria-label={incLabel ?? `زد ${label} ${stepWord}`} onClick={inc} className={btn} disabled={value >= max}>
        +
      </button>
    </div>
  );
}

export interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  className?: string;
}

/** Slider with the gold pointed-hexagon knob over a 2px track (native range input underneath for keyboard and touch) */
export function RangeSlider({ value, onChange, min, max, step = 10_000, label, className }: RangeSliderProps) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className={cx("relative h-6 w-full", className)}>
      <div aria-hidden className="absolute inset-x-0 top-[11px] h-0.5 bg-line" />
      <div aria-hidden className="absolute start-0 top-[11px] h-0.5 bg-ink" style={{ width: `${pct}%` }} />
      <span aria-hidden className="absolute top-0 size-6 bg-gold hex-point -translate-x-1/2 rtl:translate-x-1/2" style={{ insetInlineStart: `${pct}%` }} />
      <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0" />
    </div>
  );
}
