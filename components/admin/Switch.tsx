"use client";
// Switch (Components2 · 3). Hexagon knob: gold on the left = on, ink on the right = off (physical sides, as drawn).
// The word beside the switch is mandatory when the control has no heading of its own.
import { cx } from "@/lib/format";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Visible word beside the control. Required unless `aria-label` or `aria-labelledby` is given. */
  label?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  disabled?: boolean;
  className?: string;
  /** Put the word after the control (default: before, so it reads first in RTL). */
  labelAfter?: boolean;
  id?: string;
}

export function Switch({ checked, onChange, label, disabled, className, labelAfter, id, ...aria }: SwitchProps) {
  const control = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={label ? undefined : aria["aria-label"]}
      aria-labelledby={aria["aria-labelledby"]}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cx(
        "relative inline-block h-[22px] w-10 shrink-0 cursor-pointer motion-hover transition-colors disabled:cursor-default",
        checked ? "bg-ink" : "border-[1.5px] border-ink bg-paper",
        disabled && "opacity-40",
      )}
    >
      <span
        aria-hidden
        className={cx(
          "hex-flat absolute size-4 motion-hover transition-[left,right,background-color]",
          checked ? "left-[3px] top-[3px] bg-gold" : "right-[1.5px] top-[1.5px] bg-ink",
        )}
      />
    </button>
  );
  if (!label) return <span className={cx("inline-flex", className)}>{control}</span>;
  return (
    <label className={cx("inline-flex items-center gap-2 text-[12px] font-bold text-ink", disabled && "text-disabled", className)}>
      {!labelAfter && label}
      {control}
      {labelAfter && label}
    </label>
  );
}
