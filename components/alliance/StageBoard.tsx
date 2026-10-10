"use client";
import { useState, type ReactNode } from "react";
import { cx, fmtNum } from "@/lib/format";
import { A } from "./A";

/**
 * «عمود اللوحة»: a header with a 2px ink rule and a sand counter; the column that needs a decision has a gold rule
 * and a gold counter. Drop target: a dashed sand rectangle «أفلت هنا». On phone the columns become tabs.
 */
export interface BoardColumnProps {
  title: string;
  count: number;
  needsDecision?: boolean;
  /** show the dashed «أفلت هنا» target under the cards */
  dropTarget?: boolean;
  dropLabel?: string;
  /** «عرض 23 أخرى» */
  more?: { label: string; href?: string; onClick?: () => void };
  children?: ReactNode;
  className?: string;
}

export function BoardColumn({ title, count, needsDecision, dropTarget, dropLabel = "أفلت هنا", more, children, className }: BoardColumnProps) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-2", className)}>
      <header className="flex items-center justify-between gap-2 px-2.5 py-2 text-[12px] font-extrabold" style={{ borderBottom: `2px solid ${needsDecision ? "var(--smq-gold)" : "var(--smq-ink)"}` }}>
        <span>{title}</span>
        <span className={cx("flex h-[22px] min-w-[22px] items-center justify-center px-1.5 text-caption tnum", needsDecision ? "bg-gold text-ink" : "bg-sand")}>{fmtNum(count)}</span>
      </header>
      {children}
      {dropTarget && (
        <div className="flex h-11 items-center justify-center bg-sand text-caption font-bold text-muted" style={{ border: "1.5px dashed var(--smq-ink)" }}>
          {dropLabel}
        </div>
      )}
      {more &&
        (more.href ? (
          <A href={more.href} className="block p-2.5 text-center text-caption text-muted no-underline" style={{ border: "1.5px dashed var(--smq-line)" }}>
            {more.label}
          </A>
        ) : (
          <button type="button" onClick={more.onClick} className="min-h-11 p-2.5 text-center text-caption text-muted" style={{ border: "1.5px dashed var(--smq-line)" }}>
            {more.label}
          </button>
        ))}
    </div>
  );
}

export interface StageBoardColumn extends Omit<BoardColumnProps, "className"> {
  key: string;
}

/** The stage board: columns side by side from md up; on phone the columns are tabs and one column shows. */
export function StageBoard({ columns, initial, className }: { columns: StageBoardColumn[]; /** key of the tab open first on phone */ initial?: string; className?: string }) {
  const [active, setActive] = useState<string>(initial ?? columns.find((c) => c.needsDecision)?.key ?? columns[0]?.key ?? "");
  return (
    <div className={className}>
      <div className="md:hidden">
        <div role="tablist" aria-label="مراحل الطلبات" className="flex gap-1 overflow-x-auto" style={{ borderBottom: "1.5px solid var(--smq-ink)" }}>
          {columns.map((c) => {
            const on = c.key === active;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(c.key)}
                className={cx("flex min-h-11 shrink-0 items-center gap-1.5 px-3 text-[13px] font-bold", on ? "font-extrabold text-ink" : "text-muted")}
                style={on ? { borderBottom: "3px solid var(--smq-gold)", marginBottom: -1.5 } : undefined}
              >
                {c.title}
                <i className={cx("inline-flex h-[18px] min-w-[18px] items-center justify-center px-1 text-[10px] not-italic font-extrabold tnum", on && c.needsDecision ? "bg-gold" : "bg-sand")}>{fmtNum(c.count)}</i>
              </button>
            );
          })}
        </div>
        {columns
          .filter((c) => c.key === active)
          .map(({ key, ...c }) => (
            <BoardColumn key={key} {...c} className="mt-3" />
          ))}
      </div>
      <div className="hidden gap-3 md:grid" style={{ gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, minmax(0, 1fr))` }}>
        {columns.map(({ key, ...c }) => (
          <BoardColumn key={key} {...c} />
        ))}
      </div>
    </div>
  );
}
