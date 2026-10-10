"use client";
// The shell every admin page shares: cream page background, the ink top bar, the desktop sidebar or the phone tab
// row, the page header, and the phone menu sheet. Toasts come from the store (useStore().toast) and are rendered once
// by components/presenter/Toasts.tsx, so nothing here duplicates them.
import { useState, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { AdminPhoneTabs } from "./AdminPhoneTabs";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar, layoutShow, type AdminUser } from "./AdminTopbar";
import { Drawer } from "./Drawer";
import type { Notification } from "./Notifications";
import { PageHeader } from "./PageHeader";
import type { NavCounts, NavKey, PhoneTab } from "./nav";

export interface AdminShellProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** Active sidebar item; derived from the path when omitted. */
  active?: NavKey;
  /** Active phone tab when it differs from the sidebar item (Admin-M opens on «الموافقات»). */
  phoneActive?: NavKey;
  notifications?: Notification[];
  /** false hides the phone tab row; an array replaces the default seven tabs. */
  phoneTabs?: boolean | PhoneTab[];
  /** Counters on the nav (approvals, leads, marketers, alliance) from the page's fixtures. */
  counts?: NavCounts;
  /** true → «الأرقام توضيحية» on the header line. */
  note?: boolean | ReactNode;
  user?: AdminUser;
  /** Caption after the badge in the top bar (Admin-Pieces-D). */
  topbarCaption?: ReactNode;
  /** Hide the page header on the phone (Admin-M starts with the tiles). */
  phoneHideHeader?: boolean;
  /** auto = by viewport; desktop / phone force one layout (styleguide previews). */
  layout?: "auto" | "desktop" | "phone";
  className?: string;
  mainClassName?: string;
}

export function AdminShell({ title, subtitle, actions, children, active, phoneActive, notifications = [], phoneTabs = true, counts, note, user, topbarCaption, phoneHideHeader, layout = "auto", className, mainClassName }: AdminShellProps) {
  const [menu, setMenu] = useState(false);
  const mainPad = layout === "auto" ? "gap-4 px-4 py-4 md:gap-6 md:px-8 md:pb-12 md:pt-7" : layout === "desktop" ? "gap-6 px-8 pb-12 pt-7" : "gap-4 px-4 py-4";
  return (
    <div className={cx("bg-cream text-ink", layout === "auto" ? "min-h-dvh" : "min-h-full", className)}>
      <AdminTopbar notifications={notifications} onMenu={() => setMenu(true)} user={user} caption={topbarCaption} layout={layout} />
      {phoneTabs !== false && <AdminPhoneTabs active={phoneActive ?? active} counts={counts} tabs={Array.isArray(phoneTabs) ? phoneTabs : undefined} layout={layout} />}
      <div className={cx("flex items-stretch", layout === "auto" && "min-h-[calc(100dvh-60px)]")}>
        <AdminSidebar active={active} counts={counts} className={layoutShow(layout, "desktop")} />
        <main className={cx("flex min-w-0 flex-1 flex-col", mainPad, mainClassName)}>
          {(title || actions) && (
            <div className={cx(phoneHideHeader && (layout === "auto" ? "hidden md:block" : layout === "phone" ? "hidden" : "block"))}>
              <PageHeader title={title} subtitle={subtitle} actions={actions} note={note} />
            </div>
          )}
          {children}
        </main>
      </div>
      <Drawer open={menu} onClose={() => setMenu(false)} title="أقسام الإدارة" side="start" bodyClassName="p-0">
        <AdminSidebar active={active} counts={counts} inSheet onNavigate={() => setMenu(false)} />
      </Drawer>
    </div>
  );
}
