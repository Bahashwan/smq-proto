"use client";
// Footer link lists with the current page in gold (Privacy-M / Privacy-D footers).
import Link from "next/link";
import { useClientPath } from "@/lib/location";
import { cx } from "@/lib/format";
import type { NavItem } from "./constants";

export function FooterLinks({ items, className, linkClassName }: { items: NavItem[]; className?: string; linkClassName?: string }) {
  const path = useClientPath();
  return (
    <nav aria-label="روابط" className={className}>
      {items.map((l) => {
        const on = path === l.href || (l.href !== "/" && path.startsWith(`${l.href}/`));
        return (
          <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined} className={cx("no-underline hover:underline", on ? "text-gold" : "text-paper", linkClassName)}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** The single privacy link of the desktop compact footer line, gold on the privacy page. */
export function PrivacyLink() {
  const path = useClientPath();
  const on = path === "/privacy";
  return (
    <Link href="/privacy" aria-current={on ? "page" : undefined} className={cx("no-underline hover:underline", on ? "text-gold" : "text-paper")}>
      الخصوصية
    </Link>
  );
}
