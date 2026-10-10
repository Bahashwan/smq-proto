"use client";
// Chips, segmented controls, tabs, the compare checkbox and the switch · Components sheet §2.
// Shapes follow the sheet: 1.5px ink frames, selected = filled ink, hover = sand, disabled = line frame + muted text.
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { isExternalHref } from "./constants";

export interface ChipProps {
  /** selected state (aria-pressed) */
  active?: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** 38px (default) or 34px tall; both ≥ the 32–38px chip tap target */
  size?: "m" | "s";
  /** apply the small cut (only visible on the filled, selected chip) */
  cut?: boolean;
  /** transparent background on coloured blocks (budget chips on the gold hero) */
  onColour?: boolean;
  /** QA only */
  state?: "hover" | "focus";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

/** Toggle chip: budget presets, feature filters, «قريباً» districts */
export function Chip({ active, href, onClick, disabled, size = "m", cut, onColour, state, className, children, ...aria }: ChipProps) {
  const cls = cx(
    "inline-flex items-center justify-center shrink-0 gap-1.5 whitespace-nowrap no-underline text-label font-bold border-interactive motion-hover transition-colors select-none",
    size === "m" ? "h-9.5 px-3.5" : "h-8.5 px-3",
    disabled
      ? "border-line text-disabled bg-paper cursor-not-allowed"
      : active
        ? cx("bg-ink text-paper", cut && "cut-s")
        : cx(onColour ? "bg-transparent" : "bg-paper", "text-ink hover:bg-sand", state === "hover" && "bg-sand"),
    state === "focus" && "outline-2 outline-gold outline-offset-2",
    className,
  );
  if (href && !disabled) {
    return isExternalHref(href) ? (
      <a href={href} className={cls} aria-current={active ? "true" : undefined} {...aria}>
        {children}
      </a>
    ) : (
      <Link href={href} className={cls} aria-current={active ? "true" : undefined} {...aria}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-pressed={active} {...aria}>
      {children}
    </button>
  );
}

/** Active filter chip with a remove button («الروضة ×»); 32px tall, sand background */
export function FilterChip({ children, onRemove, href, className }: { children: ReactNode; onRemove?: () => void; href?: string; className?: string }) {
  const cls = cx("inline-flex items-center gap-1.5 h-8 px-2.5 text-caption font-bold border-interactive bg-sand text-ink hover:bg-paper motion-hover transition-colors no-underline", className);
  const inner = (
    <>
      <span>{children}</span>
      <span aria-label="إزالة" className="text-label leading-none">
        ×
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} scroll={false}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onRemove}>
      {inner}
    </button>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** accessible name of the group («عدد الغرف», «طريقة العرض») */
  label: string;
  /** equal-width cells or content width */
  stretch?: boolean;
  size?: "m" | "s";
  className?: string;
}

/** Segmented control: one ink frame, 1.5px dividers, selected cell filled ink */
export function Segmented<T extends string>({ options, value, onChange, label, stretch, size = "m", className }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className={cx("inline-flex border-interactive divide-x-[1.5px] divide-ink", stretch && "flex w-full", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cx(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold motion-hover transition-colors",
              size === "m" ? "h-10 min-w-11.5 px-3 text-label" : "h-9 min-w-10 px-2.5 text-caption",
              stretch && "flex-1",
              active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-sand",
              o.disabled && "text-disabled hover:bg-paper cursor-not-allowed",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export interface TabItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  /** QA only */
  state?: "hover";
  id?: string;
}

/** Tabs under a 1.5px ink rule; the active tab carries the 3px gold rule */
export function Tabs({ items, label, className, size = "m" }: { items: TabItem[]; label: string; className?: string; size?: "m" | "l" }) {
  return (
    <nav aria-label={label} className={cx("flex items-end border-b-[1.5px] border-ink overflow-x-auto", className)}>
      {items.map((t, i) => {
        const cls = cx(
          "inline-flex items-center shrink-0 whitespace-nowrap no-underline font-bold motion-hover transition-colors -mb-[1.5px]",
          size === "m" ? "px-3 py-2.5 text-label" : "px-4 py-3 text-body font-bold",
          t.active ? "text-ink border-b-[3px] border-gold" : "text-muted hover:text-ink hover:bg-sand",
          t.state === "hover" && "text-ink bg-sand",
        );
        if (t.href) {
          return (
            <Link key={t.id ?? i} href={t.href} className={cls} aria-current={t.active ? "page" : undefined} id={t.id}>
              {t.label}
            </Link>
          );
        }
        return (
          <button key={t.id ?? i} type="button" onClick={t.onClick} className={cls} aria-current={t.active ? "true" : undefined} id={t.id}>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

export interface CompareToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** the list is full (3/3) or the unit cannot be compared */
  disabled?: boolean;
  /** «ممتلئة (3/3)» replaces «قارن» when the list is full */
  full?: boolean;
  /** the unit cannot be compared (reserved / sold): «قارن» stays, the box is disabled */
  unavailable?: boolean;
  size?: "s" | "m" | "l";
  lang?: "ar" | "en";
  /** the visible word when it is not «قارن» («أضف للمقارنة» on the unit page); the full state still reads «ممتلئة (3/3)» */
  label?: string;
  className?: string;
}

/** The «قارن» checkbox label of the cards: paper → sand when checked, line frame when disabled */
export function CompareToggle({ checked, onChange, disabled, full, unavailable, size = "m", lang = "ar", label, className }: CompareToggleProps) {
  const off = disabled || full || unavailable;
  const text = full ? (lang === "en" ? "Full (3/3)" : "ممتلئة (3/3)") : label ?? (lang === "en" ? "Compare" : "قارن");
  const aria = unavailable ? "غير متاح للمقارنة" : checked ? "في المقارنة" : lang === "en" ? "Add to compare" : "أضف إلى المقارنة";
  return (
    <label
      className={cx(
        "inline-flex items-center justify-center gap-2 shrink-0 text-label font-bold select-none motion-hover transition-colors",
        size === "s" ? "h-11 px-3" : size === "m" ? "h-11.5 px-3" : "h-12.5 px-3.5",
        off ? "border-interactive border-line text-muted cursor-not-allowed" : cx("border-interactive cursor-pointer", checked ? "bg-sand" : "bg-paper hover:bg-sand"),
        className,
      )}
    >
      <input type="checkbox" className="size-4 m-0 accent-ink" checked={checked} disabled={off && !checked} aria-label={aria} onChange={(e) => onChange?.(e.target.checked)} />
      <span>{text}</span>
    </label>
  );
}

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** visible word next to the switch (required unless the control has a heading) */
  label?: ReactNode;
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

/** Switch with a hexagon knob: gold at the line end = on, ink at the line start = off */
export function Switch({ checked, onChange, label, disabled, className, ...aria }: SwitchProps) {
  return (
    <label className={cx("inline-flex items-center justify-between gap-6 min-h-11 text-body font-semibold", disabled ? "text-disabled" : "cursor-pointer", className)}>
      {label && <span>{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={aria["aria-label"]}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx("relative inline-flex items-center shrink-0 w-11 h-6 border-interactive motion-hover transition-colors", checked ? "bg-ink" : "bg-paper", disabled && "border-line")}
      >
        <span aria-hidden className={cx("absolute top-0.5 size-4 hex-flat motion-hover transition-[inset-inline-start,background-color]", checked ? "start-5.5 bg-gold" : "start-0.5 bg-ink", disabled && "bg-disabled")} />
      </button>
    </label>
  );
}
