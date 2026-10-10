"use client";
// G9 · the AdminShell every marketers / alliance-room page renders (fixture notifications, nav counters computed from
// the selectors plus the in-memory store), the alliance room's sub-tabs with their computed counters, and the small
// pieces the room's pages share (hexagon avatar, framed section, link tile, hexagon tag).
import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { AdminShell, type AdminShellProps, type NavCounts, type Notification } from "@/components/admin";
import { notifications as notificationFixture } from "@/data/content";
import { offices } from "@/data/offices";
import { allianceOverview, approvalCounts, leadCounts, marketersByStage } from "@/data/selectors";
import { useStore } from "@/lib/store";
import { cx, fmtNum } from "@/lib/format";

export const ADMIN_NOTIFICATIONS: Notification[] = notificationFixture.map((n) => ({
  id: n.id,
  title: n.titleAr || undefined,
  text: n.textAr,
  when: n.whenAr,
  href: n.href,
  linkLabel: n.linkAr,
  read: !n.unread,
}));

/** The alliance overview numbers with every store override merged in. */
export function useAllianceOverview() {
  const requests = useStore((s) => s.requests);
  const referralStages = useStore((s) => s.referralStages);
  const applications = useStore((s) => s.applications);
  const createdReferrals = useStore((s) => s.createdReferrals);
  return useMemo(
    () => allianceOverview({ requestOverrides: requests, referralOverrides: referralStages, applicationOverrides: applications, createdReferrals }),
    [requests, referralStages, applications, createdReferrals],
  );
}

/** approvals = open submissions · leads = «بلا رد» · marketers = new applicants · alliance = applications to verify +
 *  open disputes (the same rule as the admin-core pages). */
export function useAdminCounts(): NavCounts {
  const approvals = useStore((s) => s.approvals);
  const leads = useStore((s) => s.leads);
  const marketers = useStore((s) => s.marketers);
  const ov = useAllianceOverview();
  return useMemo(
    () => ({
      approvals: approvalCounts(approvals).open,
      leads: leadCounts(leads).unanswered,
      marketers: marketersByStage(marketers).new.length,
      alliance: ov.pendingApplications + ov.disputes,
    }),
    [approvals, leads, marketers, ov],
  );
}

export type G9ShellProps = Omit<AdminShellProps, "notifications" | "counts">;

export function G9Shell(props: G9ShellProps) {
  const counts = useAdminCounts();
  return <AdminShell {...props} notifications={ADMIN_NOTIFICATIONS} counts={counts} />;
}

// ---------------------------------------------------------------------------------------------- alliance room tabs

export type RoomTab = "overview" | "applications" | "members" | "radar" | "requests" | "referrals" | "report" | "settings";

/** «نظرة عامة · طلبات الانضمام 4 · الأعضاء 12 · الرادار · الطلبات والمطابقات · الإحالات والصفقات 3 · …» */
export function AllianceTabs({ active, className }: { active: RoomTab; className?: string }) {
  const ov = useAllianceOverview();
  const tabs: { key: RoomTab; label: string; href: string; count?: number }[] = [
    { key: "overview", label: "نظرة عامة", href: "/admin/alliance" },
    { key: "applications", label: "طلبات الانضمام", href: "/admin/alliance/applications", count: ov.pendingApplications },
    { key: "members", label: "الأعضاء", href: "/admin/alliance/members", count: offices.length },
    { key: "radar", label: "الرادار", href: "/admin/alliance/radar" },
    { key: "requests", label: "الطلبات والمطابقات", href: "/admin/alliance/requests", count: ov.awaitingDecision },
    { key: "referrals", label: "الإحالات والصفقات", href: "/admin/alliance/referrals", count: ov.ongoingReferrals },
    { key: "report", label: "التقرير الشهري", href: "/admin/alliance/report" },
    { key: "settings", label: "الميثاق والإعدادات", href: "/admin/alliance/settings" },
  ];
  return (
    <nav aria-label="أقسام غرفة التحالف" className={cx("-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      <ul className="flex min-w-max items-stretch gap-1 border-b-[1.5px] border-ink">
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <li key={t.key} className="flex">
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={cx(
                  "motion-hover -mb-[1.5px] flex min-h-11 items-center gap-2 px-3.5 text-[14px] no-underline",
                  on ? "border-b-[3px] border-gold font-extrabold text-ink" : "border-b-[3px] border-transparent font-bold text-ink-2 hover:text-ink",
                )}
              >
                {t.label}
                {t.count != null && t.count > 0 && <i className="inline-flex h-5 min-w-5 items-center justify-center bg-sand px-1.5 text-[11px] font-extrabold not-italic tnum text-ink">{fmtNum(t.count)}</i>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** «غرفة التحالف» with the gold + ink hexagon pair of the boards; sub-pages append « · section». */
export function RoomTitle({ section }: { section?: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {!section && (
        <span aria-hidden className="inline-flex items-center">
          <span className="hex-flat inline-block h-[18px] w-[21px] bg-gold" />
          <span className="hex-flat -ms-1 inline-block h-[18px] w-[21px] bg-ink" />
        </span>
      )}
      <span>{section ? `غرفة التحالف · ${section}` : "غرفة التحالف"}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------------------------- shared pieces

/** Letter in a flat hexagon (marketer and office avatars). */
export function HexAvatar({ letter, tone = "ink", size = 28, className }: { letter: string; tone?: "ink" | "gold" | "muted"; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx("hex-flat inline-flex shrink-0 items-center justify-center font-extrabold leading-none", tone === "gold" ? "bg-gold text-ink" : tone === "muted" ? "bg-muted text-paper" : "bg-ink text-paper", className)}
      style={{ width: size, height: Math.round(size * 0.9), fontSize: Math.max(11, Math.round(size * 0.45)) }}
    >
      {letter}
    </span>
  );
}

/** White section with the ink frame and a cream header strip (title + side note or link). */
export function Section({ title, aside, children, className, bodyClassName, headerClassName, id, as: Tag = "section" }: { title: ReactNode; aside?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; headerClassName?: string; id?: string; as?: "section" | "div" }) {
  return (
    <Tag id={id} className={cx("flex min-w-0 flex-col border-interactive bg-paper", className)}>
      <header className={cx("flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b-[1.5px] border-ink bg-sand px-4 py-3.5", headerClassName)}>
        <h2 className="text-[16px] font-extrabold leading-tight">{title}</h2>
        {aside && <span className="text-caption font-bold text-muted">{aside}</span>}
      </header>
      <div className={cx("min-w-0", bodyClassName)}>{children}</div>
    </Tag>
  );
}

/** Overview tile that links to its tab: label, big number, note. `rule` = the gold rule of a tile that waits for a
 *  decision; `ink` = the closed-deals tile with the cut corner. */
export function LinkTile({ href, label, value, note, rule, ink, className }: { href: string; label: string; value: ReactNode; note?: ReactNode; rule?: boolean; ink?: boolean; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        "motion-hover relative flex min-w-0 flex-col gap-1 px-4 py-3.5 no-underline md:px-5 md:py-[18px]",
        ink ? "cut-m bg-ink text-paper hover:bg-ink-2" : "border-interactive bg-paper text-ink hover:bg-sand",
        className,
      )}
    >
      {rule && !ink && <span aria-hidden className="absolute inset-y-0 end-0 w-[5px] bg-gold" />}
      <small className={cx("text-caption font-bold md:text-[12px]", ink ? "text-on-ink-muted" : "text-muted")}>{label}</small>
      <b className={cx("text-2xl font-extrabold leading-none tnum md:text-[28px]", ink ? "text-gold" : "text-ink")}>{value}</b>
      {note && <span className={cx("text-caption md:text-[12px]", ink ? "text-on-ink-muted" : "text-muted")}>{note}</span>}
    </Link>
  );
}

/** The hexagon tag in front of a decision row: «عرض» gold · «طلب» outline · «واتساب» gold outline · «نزاع» ink ·
 *  «تقرير» sand. */
export function HexTag({ children, tone }: { children: ReactNode; tone: "gold" | "outline" | "goldOutline" | "ink" | "sand" }) {
  const ring = tone === "outline" ? "bg-ink" : tone === "goldOutline" ? "bg-gold" : null;
  const fill = tone === "gold" ? "bg-gold text-ink" : tone === "ink" ? "bg-ink text-paper" : tone === "sand" ? "bg-sand text-ink" : "bg-paper text-ink";
  return (
    <span aria-hidden={false} className={cx("hex-flat relative inline-flex h-[40px] w-[46px] shrink-0 items-center justify-center", ring ?? fill)}>
      {ring ? (
        <span className={cx("hex-flat absolute inset-[1.5px] flex items-center justify-center text-[10px] font-extrabold", fill)}>{children}</span>
      ) : (
        <span className="text-[10px] font-extrabold">{children}</span>
      )}
    </span>
  );
}
