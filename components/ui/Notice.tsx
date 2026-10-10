// Inline notices · Components sheet §8 (the floating toasts live in components/presenter/Toasts.tsx).
// Ink with a gold rule at the line start, or sand with an ink rule; an optional link or aside at the line end.
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { isExternalHref } from "./constants";

export interface NoticeProps {
  tone?: "ink" | "sand" | "gold";
  children: ReactNode;
  action?: { label: ReactNode; href: string };
  /** muted text at the line end («تصلك رسالة واتساب خلال دقائق») */
  aside?: ReactNode;
  role?: "status" | "alert" | "note";
  className?: string;
}

export function Notice({ tone = "ink", children, action, aside, role = "status", className }: NoticeProps) {
  const link = action
    ? isExternalHref(action.href)
      ? (
          <a href={action.href} className={cx("ms-auto shrink-0 text-caption font-bold no-underline hover:underline", tone === "ink" ? "text-gold" : "text-gold-text")}>
            {action.label}
          </a>
        )
      : (
          <Link href={action.href} className={cx("ms-auto shrink-0 text-caption font-bold no-underline hover:underline", tone === "ink" ? "text-gold" : "text-gold-text")}>
            {action.label}
          </Link>
        )
    : null;
  return (
    <div
      role={role === "note" ? undefined : role}
      className={cx(
        "flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-3 text-label border-s-4",
        tone === "ink" && "bg-ink text-paper border-gold",
        tone === "sand" && "bg-sand text-ink border-ink",
        tone === "gold" && "bg-gold text-ink border-ink",
        className,
      )}
    >
      <span className="font-bold">{children}</span>
      {aside && <span className={cx("ms-auto text-caption font-normal", tone === "ink" ? "text-on-ink-muted" : "text-muted")}>{aside}</span>}
      {link}
    </div>
  );
}
