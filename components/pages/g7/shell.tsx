"use client";
// G7 · the AdminShell every admin-core page renders. The bell's items and the nav counters (selectors + the in-memory
// store, so a «علّم كمردود» or an approval updates them) are the admin library's shared ones (components/admin/live.ts).
import { AdminShell, type AdminShellProps } from "@/components/admin";

export { ADMIN_NOTIFICATIONS, useAdminCounts } from "@/components/admin";

export type G7ShellProps = Omit<AdminShellProps, "notifications" | "counts">;

export function G7Shell(props: G7ShellProps) {
  return <AdminShell {...props} />;
}
