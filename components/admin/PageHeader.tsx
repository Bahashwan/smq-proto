// Page header (Admin-Overview-D): title, muted subtitle line, actions on the opposite side, and the
// «الأرقام توضيحية» note that every illustrative admin screen carries.
import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export const ILLUSTRATIVE_NOTE = "الأرقام توضيحية";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** true → «الأرقام توضيحية» appended to the subtitle line; a node → that text instead. */
  note?: boolean | ReactNode;
  as?: "h1" | "h2";
  className?: string;
  /** Smaller title (section headers inside a page, 18px). */
  size?: "page" | "section";
}

export function PageHeader({ title, subtitle, actions, note, as: Tag = "h1", className, size = "page" }: PageHeaderProps) {
  const noteNode = note === true ? ILLUSTRATIVE_NOTE : note || null;
  return (
    <div className={cx("flex flex-wrap items-end justify-between gap-x-4 gap-y-3", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <Tag className={cx("font-extrabold leading-tight", size === "page" ? "text-h3 md:text-[28px]" : "text-h3")}>{title}</Tag>
        {(subtitle || noteNode) && (
          <span className="text-caption font-normal text-muted md:text-label md:font-normal">
            {subtitle}
            {subtitle && noteNode ? " · " : null}
            {noteNode}
          </span>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Section heading inside an admin page: h2 + a link on the opposite side (Admin-M «الكل 12 …»). */
export function SectionHeader({ title, action, subtitle, className }: { title: ReactNode; action?: ReactNode; subtitle?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-baseline justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-h3 font-extrabold leading-tight">{title}</h2>
        {subtitle && <span className="text-caption text-muted">{subtitle}</span>}
      </div>
      {action && <span className="shrink-0 text-[12px] font-bold">{action}</span>}
    </div>
  );
}
