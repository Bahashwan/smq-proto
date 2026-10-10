"use client";
// G7 · the AdminShell every admin-core page renders, with the fixture notifications (data/content.ts) and the nav
// counters computed from the selectors plus the in-memory store, so a «علّم كمردود» or an approval updates them.
import { useMemo } from "react";
import { AdminShell, type AdminShellProps, type NavCounts, type Notification } from "@/components/admin";
import { notifications as notificationFixture } from "@/data/content";
import { allianceOverview, approvalCounts, leadCounts, marketersByStage } from "@/data/selectors";
import { useStore } from "@/lib/store";

/** The bell's items, mapped from the fixture (Admin-Pieces-D). */
export const ADMIN_NOTIFICATIONS: Notification[] = notificationFixture.map((n) => ({
  id: n.id,
  title: n.titleAr || undefined,
  text: n.textAr,
  when: n.whenAr,
  href: n.href,
  linkLabel: n.linkAr,
  read: !n.unread,
}));

/** approvals = open submissions · leads = «بلا رد» · marketers = new applicants · alliance = actions waiting for the
 *  manager (applications to verify + open disputes). */
export function useAdminCounts(): NavCounts {
  const approvals = useStore((s) => s.approvals);
  const leads = useStore((s) => s.leads);
  const marketers = useStore((s) => s.marketers);
  const applications = useStore((s) => s.applications);
  const referralStages = useStore((s) => s.referralStages);
  return useMemo(() => {
    const ov = allianceOverview({ applicationOverrides: applications, referralOverrides: referralStages });
    return {
      approvals: approvalCounts(approvals).open,
      leads: leadCounts(leads).unanswered,
      marketers: marketersByStage(marketers).new.length,
      alliance: ov.pendingApplications + ov.disputes,
    };
  }, [approvals, leads, marketers, applications, referralStages]);
}

export type G7ShellProps = Omit<AdminShellProps, "notifications" | "counts">;

export function G7Shell(props: G7ShellProps) {
  const counts = useAdminCounts();
  return <AdminShell {...props} notifications={ADMIN_NOTIFICATIONS} counts={counts} />;
}
