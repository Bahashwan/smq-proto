"use client";
// Phone tab row (Admin-M, Admin-Alliance-M): نظرة عامة · الموافقات · الواردة · الوحدات · البحث · الزوار · التحالف.
// Scrolls horizontally; the active tab is ink with a 3px gold underline; counts follow the label («الموافقات 3»).
import Link from "next/link";
import { cx, fmtNum } from "@/lib/format";
import { useClientPath } from "@/lib/location";
import { navKeyFromPath, PHONE_TABS, type NavCounts, type NavKey, type PhoneTab } from "./nav";

export interface AdminPhoneTabsProps {
  active?: NavKey;
  counts?: NavCounts;
  tabs?: PhoneTab[];
  /** auto = phone only (hidden from md); phone = always shown; desktop = never. */
  layout?: "auto" | "desktop" | "phone";
  className?: string;
}

export function AdminPhoneTabs({ active, counts = {}, tabs = PHONE_TABS, layout = "auto", className }: AdminPhoneTabsProps) {
  const path = useClientPath();
  const current = active ?? navKeyFromPath(path);
  if (layout === "desktop") return null;
  return (
    <nav aria-label="أقسام الإدارة" className={cx("flex overflow-x-auto border-b-[1.5px] border-ink bg-paper", layout === "auto" && "md:hidden", className)}>
      {tabs.map((t) => {
        const isActive = t.key === current;
        const count = counts[t.key];
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={cx("flex-none whitespace-nowrap px-3.5 py-3 text-label no-underline tnum", isActive ? "border-b-[3px] border-gold font-extrabold text-ink" : "font-bold text-muted")}
          >
            {t.label}
            {typeof count === "number" && count > 0 ? ` ${fmtNum(count)}` : ""}
          </Link>
        );
      })}
    </nav>
  );
}
