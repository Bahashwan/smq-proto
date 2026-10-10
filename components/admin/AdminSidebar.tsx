"use client";
// Desktop sidebar (Admin-Overview-D): white column with the ink line on its inner edge, the groups and items in the
// boards' order, a sand active item with a 4px gold marker on the outer edge, counters, and «الإعدادات والمستخدمون»
// pinned to the bottom. Also used inside the phone menu sheet.
import Link from "next/link";
import { cx } from "@/lib/format";
import { useClientPath } from "@/lib/location";
import { Counter } from "./Counter";
import { ADMIN_NAV, COLLABORATE_GROUP_LABEL, navKeyFromPath, type NavCounts, type NavKey } from "./nav";

export interface AdminSidebarProps {
  active?: NavKey;
  counts?: NavCounts;
  className?: string;
  /** Called after a link is chosen (closes the phone menu). */
  onNavigate?: () => void;
  /** Inside the phone menu: no inner border, no bottom pinning. */
  inSheet?: boolean;
}

export function AdminSidebar({ active, counts = {}, className, onNavigate, inSheet }: AdminSidebarProps) {
  const path = useClientPath();
  const current = active ?? navKeyFromPath(path);
  return (
    <nav aria-label="أقسام الإدارة" className={cx("flex flex-col bg-paper py-4", !inSheet && "w-60 shrink-0 self-stretch border-e-[1.5px] border-ink", className)}>
      {ADMIN_NAV.map((item, i) => {
        const isActive = item.key === current;
        const Icon = item.icon;
        const count = counts[item.key];
        const firstCollab = item.group === "collaborate" && ADMIN_NAV[i - 1]?.group !== "collaborate";
        return (
          <div key={item.key} className={cx("flex flex-col", item.group === "bottom" && !inSheet && "mt-auto")}>
            {firstCollab && <span className="mt-1.5 border-t border-line px-5 pb-1 pt-3.5 text-caption font-extrabold text-muted">{COLLABORATE_GROUP_LABEL}</span>}
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              className={cx(
                "flex min-h-11 items-center justify-between gap-3 px-5 py-3 text-[14px] text-ink no-underline motion-hover transition-colors",
                isActive ? "border-s-4 border-gold bg-sand font-extrabold ps-4" : "font-bold hover:bg-cream",
                item.group === "bottom" && !inSheet && "border-t border-line",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                {Icon && <Icon />}
                <span className="truncate">{item.label}</span>
              </span>
              {typeof count === "number" && count > 0 && <Counter value={count} tone={item.countTone ?? "outline"} />}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
