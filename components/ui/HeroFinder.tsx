"use client";
// The finder / hero block of the chosen direction (B-Hero): a gold cut block asking «كم ميزانيتك؟» with the stepper
// and budget presets, then the ink answer block (count, from-price, ranges), two select buttons and the CTA.
// Every number and label is passed in by the page (computed from the fixtures).
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Price } from "./Price";
import { Stepper } from "./Stepper";
import { ChevronDownIcon } from "./icons";

export interface BudgetPreset {
  label: string;
  value: number;
}

export interface BudgetBlockProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  value: number;
  onChange: (value: number) => void;
  presets?: BudgetPreset[];
  /** the heading element (h1 on the hero board, h2 on the Home board) */
  as?: "h1" | "h2";
  /** stepper size: l = hero (price), m = narrow columns (price-s) */
  size?: "m" | "l";
  /** heading size: h1 (32 phone / 40 desktop) or display (56 on the Home-D block) */
  titleSize?: "h1" | "display";
  children?: ReactNode;
  className?: string;
}

/** Gold block with the 60° cut at its bottom line-end corner */
export function BudgetBlock({ eyebrow, title, description, value, onChange, presets, as: Tag = "h1", size = "l", titleSize = "h1", children, className }: BudgetBlockProps) {
  return (
    <section className={cx("flex flex-col gap-3.5 bg-gold text-ink cut-xl px-5 pt-6 pb-8 md:px-10 md:pt-10 md:pb-12", className)}>
      {eyebrow && <p className="m-0 text-caption md:text-label font-bold text-on-gold-muted">{eyebrow}</p>}
      <Tag className={cx("m-0 font-extrabold", titleSize === "display" ? "text-h1 md:text-display" : "text-h1")}>{title}</Tag>
      {description && <p className="m-0 text-body text-on-gold-muted">{description}</p>}
      <Stepper value={value} onChange={onChange} label="الميزانية" inputLabel="الميزانية بالريال" sign onGold size={size} className="mt-1" />
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Chip key={p.value} size="s" onColour active={p.value === value} onClick={() => onChange(p.value)}>
              {p.label}
            </Chip>
          ))}
        </div>
      )}
      {children}
    </section>
  );
}

export interface AnswerBlockProps {
  count: number;
  /** «وحدات متاحة» */
  countLabel: ReactNode;
  /** «ضمن ميزانيتك في حي الروضة» / «حتى 700,000 في حي الروضة» */
  line: ReactNode;
  fromLabel?: ReactNode;
  from?: number;
  /** «غرفتان إلى 3 غرف · 80 إلى 147 م²» */
  ranges?: ReactNode;
  className?: string;
}

/** Ink answer block: the count in gold, the from-price and the ranges */
export function AnswerBlock({ count, countLabel, line, fromLabel = "تبدأ من", from, ranges, className }: AnswerBlockProps) {
  return (
    <div className={cx("flex items-stretch bg-ink text-paper cut-l", className)} role="status" aria-live="polite">
      <div className="flex flex-col items-center justify-center px-4.5 py-4 border-e border-ink-2">
        <span className="text-price font-extrabold leading-none text-gold tnum">{count}</span>
        <span className="mt-1 text-caption font-semibold">{countLabel}</span>
      </div>
      <div className="flex flex-col justify-center gap-1 px-4 py-3.5 min-w-0">
        <span className="text-caption text-on-ink-muted">{line}</span>
        {from !== undefined && (
          <span className="flex items-baseline gap-1.5">
            <span className="text-caption text-on-ink-muted">{fromLabel}</span>
            <Price value={from} sign={false} className="text-h2 font-extrabold text-paper" />
          </span>
        )}
        {ranges && <span className="text-caption text-on-ink-muted">{ranges}</span>}
      </div>
    </div>
  );
}

export interface SelectButtonProps {
  label: ReactNode;
  value: ReactNode;
  onClick?: () => void;
  href?: string;
  "aria-haspopup"?: "listbox" | "dialog";
  className?: string;
}

/** The «الحي / الغرف» picker buttons: label above value, chevron at the line end */
export function SelectButton({ label, value, onClick, className, ...aria }: SelectButtonProps) {
  return (
    <button type="button" onClick={onClick} className={cx("flex items-center justify-between gap-2 h-12 px-3.5 border-interactive bg-paper text-ink text-label font-semibold hover:bg-sand motion-hover transition-colors", className)} {...aria}>
      <span className="flex flex-col items-start leading-tight text-start">
        <span className="text-caption font-medium text-muted">{label}</span>
        <span>{value}</span>
      </span>
      <ChevronDownIcon />
    </button>
  );
}

export interface HeroFinderProps {
  budget: BudgetBlockProps;
  answer: AnswerBlockProps;
  /** the picker buttons (SelectButton) or any controls */
  pickers?: ReactNode;
  cta: { label: ReactNode; href: string };
  footnote?: ReactNode;
  className?: string;
}

/** The B-Hero composition: budget block + answer + pickers + CTA */
export function HeroFinder({ budget, answer, pickers, cta, footnote, className }: HeroFinderProps) {
  return (
    <div className={cx("flex flex-col", className)}>
      <BudgetBlock {...budget} />
      <section className="flex flex-col gap-3.5 px-5 pt-5.5 md:px-0">
        <AnswerBlock {...answer} />
        {pickers && <div className="grid grid-cols-2 gap-2.5">{pickers}</div>}
        <Button variant="secondary" size="l" href={cta.href} arrow between className="text-body font-bold">
          {cta.label}
        </Button>
        {footnote && <p className="m-0 text-caption text-muted">{footnote}</p>}
      </section>
    </div>
  );
}
