// White panel on the cream admin background (Admin-Overview-D sections): 1.5px ink frame, optional header with
// a title and a link/action on the opposite side, hairline dividers inside.
import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export interface PanelProps {
  title?: ReactNode;
  /** Link or button rendered opposite the title. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Padding inside the body; the header keeps its own. Default p-4. */
  bodyClassName?: string;
  /** Hairline (1px line) instead of the interactive 1.5px ink frame. */
  hairline?: boolean;
  as?: "section" | "div" | "article";
  id?: string;
  "aria-label"?: string;
}

export function Panel({ title, action, children, className, bodyClassName = "p-4", hairline, as: Tag = "section", id, ...aria }: PanelProps) {
  return (
    <Tag id={id} className={cx("flex min-w-0 flex-col bg-paper", hairline ? "border-hairline" : "border-interactive", className)} {...aria}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          {typeof title === "string" ? <h2 className="text-[16px] font-extrabold leading-tight">{title}</h2> : title}
          {action && <div className="text-[12px] font-bold">{action}</div>}
        </div>
      )}
      <div className={cx("min-w-0", bodyClassName)}>{children}</div>
    </Tag>
  );
}
