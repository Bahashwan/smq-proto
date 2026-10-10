"use client";
// Rows, accordion, breadcrumb, eyebrow, headings, numbered hexagons · Components sheet §6 and the page boards.
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/format";
import { isExternalHref } from "./constants";
import { Mark } from "./Mark";

export interface RowGroupProps {
  children: ReactNode;
  /** header cells (11/700 muted) */
  header?: ReactNode[];
  /** CSS grid-template-columns shared by the header and the rows that do not set their own */
  columns?: string;
  /** 1.5px ink frame around the group (table style) or hairlines only (spec list) */
  framed?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** A framed or hairlined stack of rows */
export function RowGroup({ children, header, columns, framed = true, className, ...aria }: RowGroupProps) {
  const style: CSSProperties | undefined = columns ? { gridTemplateColumns: columns } : undefined;
  return (
    <div className={cx("flex flex-col", framed ? "border-interactive" : "border-t-[1.5px] border-ink", className)} {...aria}>
      {header && (
        <div className={cx("grid gap-2 px-3.5 py-2.5 border-b-[1.5px] border-ink text-caption font-bold text-muted", !columns && "grid-cols-3")} style={style}>
          {header.map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

export interface RowProps {
  /** grid cells; when `label` / `value` are given instead, the row is a two-column key/value line */
  cells?: ReactNode[];
  label?: ReactNode;
  value?: ReactNode;
  /** `[للتأكيد]` chip after the value */
  tbc?: boolean;
  href?: string;
  onClick?: () => void;
  /** struck-through, muted row (sold) */
  muted?: boolean;
  columns?: string;
  /** QA only */
  state?: "hover";
  /** hairline under the row (default true; the last row of a framed group turns it off) */
  divider?: boolean;
  className?: string;
}

/** One row: clickable (hover sand) or static. Key/value rows carry the spec lists of the unit page. */
export function Row({ cells, label, value, tbc, href, onClick, muted, columns, state, divider = true, className }: RowProps) {
  const interactive = !!href || !!onClick;
  const kv = cells === undefined;
  const style: CSSProperties | undefined = columns ? { gridTemplateColumns: columns } : undefined;
  const cls = cx(
    kv ? "flex items-baseline justify-between gap-4" : cx("grid gap-2 items-center", !columns && "grid-cols-3"),
    "px-3.5 py-3 text-label font-normal no-underline",
    divider && "border-b border-line",
    muted ? "text-muted" : "text-ink",
    interactive && "hover:bg-sand motion-hover transition-colors",
    state === "hover" && "bg-sand",
    className,
  );
  const inner = kv ? (
    <>
      <span className={cx("text-caption md:text-label font-semibold", muted ? "text-muted" : "text-muted")}>{label}</span>
      <span className={cx("font-extrabold text-end tnum", muted && "line-through")}>
        {value}
        {tbc && <Mark>[للتأكيد]</Mark>}
      </span>
    </>
  ) : (
    cells.map((c, i) => <span key={i}>{c}</span>)
  );
  if (href) {
    return isExternalHref(href) ? (
      <a href={href} className={cls} style={style}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={cls} style={style}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cx(cls, "w-full text-start")} style={style}>
        {inner}
      </button>
    );
  }
  return (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}

export interface AccordionItem {
  id: string;
  q: ReactNode;
  a: ReactNode;
  /** `[مسودة إجابة]` chip after the question */
  draft?: boolean;
  defaultOpen?: boolean;
}

/** FAQ accordion on <details>: the hexagon turns from an ink ring «+» to filled gold «−» when open */
export function Accordion({ items, className, onToggle }: { items: AccordionItem[]; className?: string; onToggle?: (id: string, open: boolean) => void }) {
  return (
    <div className={cx("flex flex-col border-t-[1.5px] border-ink", className)}>
      {items.map((it) => (
        <details key={it.id} id={it.id} open={it.defaultOpen} className="group border-b border-line" onToggle={(e) => onToggle?.(it.id, (e.currentTarget as HTMLDetailsElement).open)}>
          <summary className="flex items-center justify-between gap-3 py-3 text-label font-bold cursor-pointer list-none [&::-webkit-details-marker]:hidden min-h-11">
            <span>
              {it.q}
              {it.draft && <Mark>[مسودة إجابة]</Mark>}
            </span>
            <span aria-hidden className="relative inline-flex items-center justify-center size-6 shrink-0 hex-flat bg-ink group-open:bg-gold text-body leading-none">
              <span className="absolute inset-[1.5px] hex-flat bg-paper group-open:bg-gold" />
              <span className="relative group-open:hidden">+</span>
              <span className="relative hidden group-open:inline">−</span>
            </span>
          </summary>
          <div className="pb-3 text-label font-normal leading-relaxed text-muted">{it.a}</div>
        </details>
      ))}
    </div>
  );
}

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

/** «جدة / الروضة / جاردن الروضة»: the last item is the current page */
export function Breadcrumb({ items, className, label = "المسار" }: { items: BreadcrumbItem[]; className?: string; label?: string }) {
  return (
    <nav aria-label={label} className={cx("flex flex-wrap items-center gap-1.5 text-caption md:text-label md:font-normal text-muted", className)}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="inline-flex items-center gap-1.5">
            {it.href && !last ? (
              <Link href={it.href} className="no-underline hover:text-ink hover:underline">
                {it.label}
              </Link>
            ) : (
              <span className={cx(last && "text-ink font-bold")} aria-current={last ? "page" : undefined}>
                {it.label}
              </span>
            )}
            {!last && <span aria-hidden>/</span>}
          </span>
        );
      })}
    </nav>
  );
}

/** Small gold line above a heading («مكتب تسويق واستثمار عقاري · جدة») */
export function Eyebrow({ children, onInk, onGold, className, as: Tag = "p" }: { children: ReactNode; onInk?: boolean; onGold?: boolean; className?: string; as?: "p" | "span" | "div" }) {
  return <Tag className={cx("m-0 text-caption md:text-label font-bold leading-snug", onInk ? "text-gold" : onGold ? "text-on-gold-muted" : "text-gold-text", className)}>{children}</Tag>;
}

export interface SectionHeadingProps {
  title: ReactNode;
  /** line-end link («كل التفاصيل», «كل المشاريع») */
  link?: { label: ReactNode; href: string };
  /** s = strip title (h3 size) · m = h2 · l = h1 */
  size?: "s" | "m" | "l";
  as?: "h1" | "h2" | "h3";
  eyebrow?: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
  onInk?: boolean;
}

/** Section title with an optional line-end link, baseline aligned */
export function SectionHeading({ title, link, size = "m", as, eyebrow, description, id, className, onInk }: SectionHeadingProps) {
  const Tag = as ?? (size === "l" ? "h1" : size === "s" ? "h3" : "h2");
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      {eyebrow && <Eyebrow onInk={onInk}>{eyebrow}</Eyebrow>}
      <div className="flex items-baseline justify-between gap-4">
        <Tag id={id} className={cx("m-0", size === "l" ? "text-h1" : size === "m" ? "text-h2" : "text-label md:text-h3")}>
          {title}
        </Tag>
        {link && (
          <Link href={link.href} className={cx("shrink-0 text-caption md:text-label font-bold no-underline hover:underline", onInk ? "text-gold" : "text-gold-text hover:text-ink")}>
            {link.label}
          </Link>
        )}
      </div>
      {description && <p className={cx("m-0 text-label font-normal", onInk ? "text-on-ink-muted" : "text-muted")}>{description}</p>}
    </div>
  );
}

/** Numbered step in a flat hexagon: gold with ink digits, or ink with white digits */
export function HexNumber({ children, tone = "gold", size = 40, className }: { children: ReactNode; tone?: "gold" | "ink" | "ink-2"; size?: 32 | 40 | 48 | 56; className?: string }) {
  const s = size === 32 ? "size-8 text-caption" : size === 40 ? "size-10 text-label" : size === 48 ? "size-12 text-body" : "size-14 text-h3";
  return (
    <span className={cx("inline-flex items-center justify-center shrink-0 hex-flat font-extrabold tnum leading-none", s, tone === "gold" ? "bg-gold text-ink" : tone === "ink" ? "bg-ink text-paper" : "bg-ink-2 text-paper", className)} aria-hidden>
      {children}
    </span>
  );
}

/** Progressive loading: a ghost button that becomes the end line «هذه كل الوحدات» */
export function LoadMore({ label, onClick, done, doneLabel = "هذه كل الوحدات", className }: { label: ReactNode; onClick: () => void; done?: boolean; doneLabel?: ReactNode; className?: string }) {
  if (done) return <p className={cx("m-0 text-center text-caption font-semibold text-muted", className)}>{doneLabel}</p>;
  return (
    <button type="button" onClick={onClick} className={cx("inline-flex items-center justify-center h-11 px-4 text-label font-bold border-interactive bg-paper hover:bg-sand motion-hover transition-colors", className)}>
      {label}
    </button>
  );
}
