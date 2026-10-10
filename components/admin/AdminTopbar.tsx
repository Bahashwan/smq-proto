"use client";
// Ink top bar. Desktop (Admin-Overview-D): lockup + «لوحة الإدارة», search, «عرض الموقع», the bell, the user block.
// Phone (Admin-M): gold mark + «الإدارة», the bell, the menu button.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import lockup from "@/design/brand/lockup-goldmark-white.png";
import mark from "@/design/brand/logo-mark-gold.png";
import { cx } from "@/lib/format";
import { IconMenu, IconSearch } from "./icons";
import { NotificationsBell, type Notification } from "./Notifications";

export interface AdminUser {
  name: string;
  role: string;
  /** Letter inside the gold hexagon. */
  initial: string;
}

export const DEFAULT_ADMIN_USER: AdminUser = { name: "سعود", role: "مدير", initial: "س" };

export interface AdminTopbarProps {
  notifications?: Notification[];
  onMenu?: () => void;
  user?: AdminUser;
  searchPlaceholder?: string;
  siteHref?: string;
  /** Muted caption next to the badge (Admin-Pieces-D). */
  caption?: ReactNode;
  /** auto = by viewport (phone below md); desktop / phone force one layout (previews). */
  layout?: "auto" | "desktop" | "phone";
  className?: string;
}

/** Visibility classes for the desktop / phone halves of a layout. */
export function layoutShow(layout: "auto" | "desktop" | "phone", half: "desktop" | "phone"): string {
  if (layout === "auto") return half === "desktop" ? "hidden md:flex" : "flex md:hidden";
  return layout === half ? "flex" : "hidden";
}

export function AdminTopbar({ notifications = [], onMenu, user = DEFAULT_ADMIN_USER, searchPlaceholder = "ابحث في الوحدات والطلبات والزوار", siteHref = "/", caption, layout = "auto", className }: AdminTopbarProps) {
  return (
    <header className={cx("bg-ink text-paper", className)}>
      {/* desktop */}
      <div className={cx("h-[60px] items-center justify-between gap-4 px-6", layoutShow(layout, "desktop"))}>
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/admin" className="flex shrink-0 items-center">
            <Image src={lockup} alt="إس إم كيو العقارية" priority style={{ height: 28, width: "auto" }} />
          </Link>
          <span className="bg-gold px-2 py-1 text-[12px] font-bold leading-tight text-ink">لوحة الإدارة</span>
          {caption && <span className="truncate text-[12px] font-bold text-on-ink-muted">{caption}</span>}
        </div>
        <div className="flex items-center gap-3">
          <label className={cx("h-10 items-center gap-2 bg-ink-2 px-3 text-label text-on-ink-muted", layout === "auto" ? "hidden lg:flex" : "flex")}>
            <IconSearch />
            <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="w-[280px] bg-transparent text-label text-paper placeholder:text-on-ink-muted focus-visible:outline-0" />
          </label>
          <Link href={siteHref} className="px-2 py-2.5 text-[12px] font-bold text-on-ink-muted no-underline hover:text-paper">
            عرض الموقع
          </Link>
          <NotificationsBell items={notifications} />
          <span className="flex items-center gap-2 text-label font-bold">
            <span aria-hidden className="hex-flat flex size-8 items-center justify-center bg-gold text-[12px] text-ink">
              {user.initial}
            </span>
            {user.name} · {user.role}
          </span>
        </div>
      </div>
      {/* phone */}
      <div className={cx("items-center justify-between px-4 py-2.5", layoutShow(layout, "phone"))}>
        <div className="flex items-center gap-2.5">
          <Link href="/admin" className="flex items-center" aria-label="لوحة الإدارة">
            <Image src={mark} alt="" style={{ height: 24, width: "auto" }} />
          </Link>
          <span className="bg-gold px-[7px] py-[3px] text-[12px] font-bold leading-tight text-ink">الإدارة</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationsBell items={notifications} large />
          <button type="button" aria-label="القائمة" onClick={onMenu} className="flex size-11 cursor-pointer items-center justify-center bg-transparent text-paper">
            <IconMenu />
          </button>
        </div>
      </div>
    </header>
  );
}
