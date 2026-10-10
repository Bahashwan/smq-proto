"use client";
// The admin's live numbers, shared by every admin page: the bell's items from the fixture (Admin-Pieces-D · 1) and the
// nav counters computed from the selectors plus the in-memory store, so a «علّم كمردود», an approval or an alliance
// decision on one page updates the counters on every other page.
import { useMemo } from "react";
import { notifications as notificationFixture } from "@/data/content";
import { allianceOverview, approvalCounts, leadCounts, marketersByStage } from "@/data/selectors";
import { useStore } from "@/lib/store";
import type { NavCounts } from "./nav";
import type { Notification } from "./Notifications";

/** The bell's items, mapped from the fixture. */
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
 *  open disputes. */
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
